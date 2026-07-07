import type { StatField } from "@repo/types";
import {
  formatActivityDate,
  formatSportType,
  formatStat,
  type FormattedStat,
} from "./format";
import { drawNotification, drawReceipt, drawStatement } from "./cards";
import {
  drawChatBubble,
  drawNotifBubble,
  drawSplitsBar,
  drawTerminal,
  drawVerified,
} from "./objects";
import { decodePolyline } from "./polyline";
import type {
  BoxElement,
  DividerElement,
  RouteElement,
  StatFlowElement,
  StatHeroElement,
  StickerData,
  StickerTemplate,
  TextAlign,
  TextElement,
} from "./template";

export interface RenderOptions {
  /** Stats the user enabled, in display order. */
  fields: StatField[];
  /** Primary text color (hex or any CSS color). */
  textColor: string;
  fontFamily?: string;
  /** Multiplier on top of template dimensions (1 = 1080px-class export). */
  pixelRatio?: number;
  /**
   * Athlete avatar for templates that show it (notifBubble). Must be
   * same-origin or CORS-clean, otherwise the canvas taints and export breaks.
   */
  avatar?: CanvasImageSource | null;
}

const DEFAULT_FONT =
  "Geist, Inter, -apple-system, 'SF Pro Display', 'Segoe UI', sans-serif";
const LABEL_OPACITY = 0.62;
const LABEL_TRACKING = 0.08; // em

interface Ctx2D {
  ctx: CanvasRenderingContext2D;
  font: string;
  color: string;
  darkText: boolean;
}

function isDarkColor(color: string): boolean {
  const hex = color.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return false;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
}

function setFont(c: Ctx2D, size: number, weight: number): void {
  c.ctx.font = `${weight} ${size}px ${c.font}`;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function ellipsize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let result = text;
  while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result.trimEnd()}…`;
}

function drawTracked(
  c: Ctx2D,
  text: string,
  x: number,
  baseline: number,
  size: number,
  align: TextAlign,
  tracking: number,
): void {
  // Manual letter-spacing keeps output identical across browsers.
  const gap = tracking * size;
  const { ctx } = c;
  const width =
    ctx.measureText(text).width + gap * Math.max(0, text.length - 1);
  let cursor = x;
  if (align === "center") cursor = x - width / 2;
  if (align === "right") cursor = x - width;
  for (const ch of text) {
    ctx.fillText(ch, cursor, baseline);
    cursor += ctx.measureText(ch).width + gap;
  }
}

/** Draws "12.4 km" with the unit smaller, sharing the baseline. Returns width. */
function measureStatValue(
  c: Ctx2D,
  stat: FormattedStat,
  valueSize: number,
  weight: number,
): number {
  setFont(c, valueSize, weight);
  let width = c.ctx.measureText(stat.value).width;
  if (stat.unit) {
    setFont(c, valueSize * 0.42, 500);
    width += valueSize * 0.12 + c.ctx.measureText(stat.unit).width;
  }
  return width;
}

function drawStatValue(
  c: Ctx2D,
  stat: FormattedStat,
  x: number,
  baseline: number,
  valueSize: number,
  weight: number,
  align: TextAlign,
): void {
  const total = measureStatValue(c, stat, valueSize, weight);
  let cursor = x;
  if (align === "center") cursor = x - total / 2;
  if (align === "right") cursor = x - total;
  const { ctx } = c;
  setFont(c, valueSize, weight);
  ctx.fillText(stat.value, cursor, baseline);
  cursor += ctx.measureText(stat.value).width;
  if (stat.unit) {
    setFont(c, valueSize * 0.42, 500);
    ctx.save();
    ctx.globalAlpha *= 0.75;
    ctx.fillText(stat.unit, cursor + valueSize * 0.12, baseline);
    ctx.restore();
  }
}

function drawLabel(
  c: Ctx2D,
  label: string,
  x: number,
  baseline: number,
  size: number,
  align: TextAlign,
): void {
  const { ctx } = c;
  ctx.save();
  ctx.globalAlpha *= LABEL_OPACITY;
  setFont(c, size, 600);
  drawTracked(c, label.toUpperCase(), x, baseline, size, align, LABEL_TRACKING);
  ctx.restore();
}

function resolveText(el: TextElement, data: StickerData): string {
  switch (el.source) {
    case "activityName":
      return data.name;
    case "date":
      return formatActivityDate(data.startDate);
    case "sportType":
      return formatSportType(data.sportType);
    case "brand":
      return "JEJACT";
    default:
      return el.literal ?? "";
  }
}

function drawTextElement(c: Ctx2D, el: TextElement, data: StickerData): void {
  const { ctx } = c;
  let text = resolveText(el, data);
  if (el.uppercase) text = text.toUpperCase();
  ctx.save();
  ctx.globalAlpha *= el.opacity ?? 1;
  setFont(c, el.fontSize, el.fontWeight ?? 400);
  if (el.maxWidth) text = ellipsize(ctx, text, el.maxWidth);
  const baseline = el.y + el.fontSize;
  if (el.letterSpacing) {
    drawTracked(c, text, el.x, baseline, el.fontSize, el.align ?? "left", el.letterSpacing);
  } else {
    ctx.textAlign = el.align ?? "left";
    ctx.fillText(text, el.x, baseline);
    ctx.textAlign = "left";
  }
  ctx.restore();
}

function statsFor(
  el: { only?: StatField[]; except?: StatField[] },
  fields: StatField[],
  data: StickerData,
): { field: StatField; stat: FormattedStat }[] {
  return fields
    .filter((f) => !el.only || el.only.includes(f))
    .filter((f) => !el.except || !el.except.includes(f))
    .map((field) => ({ field, stat: formatStat(field, data) }))
    .filter((s): s is { field: StatField; stat: FormattedStat } => s.stat !== null);
}

function drawStatFlow(
  c: Ctx2D,
  el: StatFlowElement,
  data: StickerData,
  fields: StatField[],
): void {
  const items = statsFor(el, fields, data);
  if (items.length === 0) return;
  const weight = el.valueWeight ?? 700;
  const align = el.align ?? "left";
  const { ctx } = c;

  if (el.direction === "row") {
    const widths = items.map(({ stat }) =>
      Math.max(
        measureStatValue(c, stat, el.valueSize, weight),
        labelWidth(c, stat.label, el.labelSize),
      ),
    );
    const dividerSpace = el.dividers ? el.gap : 0;
    const total =
      widths.reduce((a, b) => a + b, 0) +
      (items.length - 1) * (el.gap + dividerSpace);
    let cursor = el.x;
    if (align === "center") cursor = el.x + (el.width - total) / 2;
    if (align === "right") cursor = el.x + el.width - total;
    const valueBaseline = el.y + el.valueSize;
    const labelBaseline = valueBaseline + el.valueSize * 0.28 + el.labelSize;
    items.forEach(({ stat }, i) => {
      const w = widths[i] ?? 0;
      const center = cursor + w / 2;
      drawStatValue(c, stat, center, valueBaseline, el.valueSize, weight, "center");
      drawLabel(c, stat.label, center, labelBaseline, el.labelSize, "center");
      cursor += w + el.gap;
      if (el.dividers && i < items.length - 1) {
        ctx.save();
        ctx.globalAlpha *= 0.25;
        ctx.fillRect(cursor - el.gap / 2, el.y + 4, 2, el.valueSize + el.labelSize);
        ctx.restore();
        cursor += dividerSpace;
      }
    });
    return;
  }

  if (el.direction === "grid") {
    const cols = el.columns ?? 2;
    const cellW = (el.width - el.gap * (cols - 1)) / cols;
    const rowH = el.valueSize + el.valueSize * 0.28 + el.labelSize + el.gap;
    items.forEach(({ stat }, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = el.x + col * (cellW + el.gap);
      const y = el.y + row * rowH;
      drawStatValue(c, stat, x, y + el.valueSize, el.valueSize, weight, "left");
      drawLabel(
        c,
        stat.label,
        x,
        y + el.valueSize + el.valueSize * 0.28 + el.labelSize,
        el.labelSize,
        "left",
      );
    });
    return;
  }

  // column
  const itemH = el.valueSize + el.valueSize * 0.24 + el.labelSize;
  let y = el.y;
  for (const { stat } of items) {
    const anchorX =
      align === "center" ? el.x + el.width / 2 : align === "right" ? el.x + el.width : el.x;
    drawStatValue(c, stat, anchorX, y + el.valueSize, el.valueSize, weight, align);
    drawLabel(
      c,
      stat.label,
      anchorX,
      y + el.valueSize + el.valueSize * 0.24 + el.labelSize,
      el.labelSize,
      align,
    );
    y += itemH + el.gap;
  }
}

function labelWidth(c: Ctx2D, label: string, size: number): number {
  setFont(c, size, 600);
  const text = label.toUpperCase();
  return (
    c.ctx.measureText(text).width +
    LABEL_TRACKING * size * Math.max(0, text.length - 1)
  );
}

function drawStatHero(
  c: Ctx2D,
  el: StatHeroElement,
  data: StickerData,
  fields: StatField[],
): void {
  if (!fields.includes(el.field)) return;
  const stat = formatStat(el.field, data);
  if (!stat) return;
  const align = el.align ?? "left";
  const anchorX =
    align === "center" ? el.x + el.width / 2 : align === "right" ? el.x + el.width : el.x;
  const heroStat = el.inlineUnit === false ? { ...stat, unit: "" } : stat;
  drawStatValue(
    c,
    heroStat,
    anchorX,
    el.y + el.valueSize,
    el.valueSize,
    el.valueWeight ?? 800,
    align,
  );
  drawLabel(
    c,
    stat.label,
    anchorX,
    el.y + el.valueSize + el.valueSize * 0.2 + el.labelSize,
    el.labelSize,
    align,
  );
}

function drawBox(c: Ctx2D, el: BoxElement): void {
  const { ctx } = c;
  ctx.save();
  if (el.fill === "glass") {
    ctx.fillStyle = c.darkText
      ? "rgba(255, 255, 255, 0.62)"
      : "rgba(16, 16, 20, 0.38)";
  } else {
    ctx.fillStyle = el.fill;
  }
  roundedRect(ctx, el.x, el.y, el.width, el.height, el.radius);
  ctx.fill();
  if (el.stroke) {
    ctx.strokeStyle = c.darkText
      ? "rgba(0, 0, 0, 0.10)"
      : "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

function drawRoute(c: Ctx2D, el: RouteElement, data: StickerData): void {
  if (!data.mapPolyline) return;
  const points = decodePolyline(data.mapPolyline);
  if (points.length < 2) return;

  // Equirectangular projection: good enough at activity scale.
  const midLat =
    points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const cosLat = Math.cos((midLat * Math.PI) / 180);
  const projected = points.map((p) => ({ x: p.lng * cosLat, y: -p.lat }));

  const minX = Math.min(...projected.map((p) => p.x));
  const maxX = Math.max(...projected.map((p) => p.x));
  const minY = Math.min(...projected.map((p) => p.y));
  const maxY = Math.max(...projected.map((p) => p.y));
  const pad = el.strokeWidth * 2;
  const spanX = Math.max(maxX - minX, 1e-9);
  const spanY = Math.max(maxY - minY, 1e-9);
  const scale = Math.min(
    (el.width - pad * 2) / spanX,
    (el.height - pad * 2) / spanY,
  );
  const offsetX = el.x + (el.width - spanX * scale) / 2 - minX * scale;
  const offsetY = el.y + (el.height - spanY * scale) / 2 - minY * scale;
  const toCanvas = (p: { x: number; y: number }) => ({
    x: p.x * scale + offsetX,
    y: p.y * scale + offsetY,
  });

  const { ctx } = c;
  ctx.save();
  ctx.globalAlpha *= el.opacity ?? 1;
  ctx.strokeStyle = c.color;
  ctx.lineWidth = el.strokeWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  projected.forEach((p, i) => {
    const { x, y } = toCanvas(p);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  if (el.markers !== false) {
    const first = projected[0];
    const last = projected[projected.length - 1];
    if (first && last) {
      const start = toCanvas(first);
      const end = toCanvas(last);
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(start.x, start.y, el.strokeWidth * 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = el.strokeWidth * 0.6;
      ctx.beginPath();
      ctx.arc(end.x, end.y, el.strokeWidth * 1.3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawDivider(c: Ctx2D, el: DividerElement): void {
  const { ctx } = c;
  ctx.save();
  ctx.globalAlpha *= el.opacity ?? 0.25;
  ctx.fillRect(el.x, el.y, el.width, 2);
  ctx.restore();
}

/**
 * Renders a template onto a canvas with a transparent background.
 * Browser-only (uses Canvas 2D).
 */
export function renderSticker(
  canvas: HTMLCanvasElement,
  template: StickerTemplate,
  data: StickerData,
  options: RenderOptions,
): void {
  const ratio = options.pixelRatio ?? 1;
  canvas.width = Math.round(template.width * ratio);
  canvas.height = Math.round(template.height * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(ratio, ratio);

  const c: Ctx2D = {
    ctx,
    font: options.fontFamily ?? DEFAULT_FONT,
    color: options.textColor,
    darkText: isDarkColor(options.textColor),
  };
  ctx.fillStyle = options.textColor;
  ctx.textBaseline = "alphabetic";

  for (const el of template.elements) {
    switch (el.type) {
      case "box":
        drawBox(c, el);
        ctx.fillStyle = options.textColor; // boxes change fillStyle
        break;
      case "text":
        drawTextElement(c, el, data);
        break;
      case "statFlow":
        drawStatFlow(c, el, data, options.fields);
        break;
      case "statHero":
        drawStatHero(c, el, data, options.fields);
        break;
      case "route":
        drawRoute(c, el, data);
        ctx.fillStyle = options.textColor; // markers change fillStyle
        break;
      case "statement":
        drawStatement(ctx, el, data, options.fields, options.textColor);
        ctx.fillStyle = options.textColor;
        break;
      case "notification":
        drawNotification(ctx, el, data, options.fields);
        ctx.fillStyle = options.textColor;
        break;
      case "receipt":
        drawReceipt(ctx, el, data, options.fields);
        ctx.fillStyle = options.textColor;
        break;
      case "chatBubble":
        drawChatBubble(ctx, el, data, options.fields, c.font);
        ctx.fillStyle = options.textColor;
        break;
      case "notifBubble":
        drawNotifBubble(ctx, el, data, options.fields, c.font, options.avatar);
        ctx.fillStyle = options.textColor;
        break;
      case "verified":
        drawVerified(ctx, el, data, options.fields, c.color, c.font);
        ctx.fillStyle = options.textColor;
        break;
      case "terminal":
        drawTerminal(ctx, el, data, options.fields);
        ctx.fillStyle = options.textColor;
        break;
      case "splitsBar":
        drawSplitsBar(ctx, el, data, c.color, c.font);
        ctx.fillStyle = options.textColor;
        break;
      case "divider":
        drawDivider(c, el);
        break;
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
