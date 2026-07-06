import type { StatField } from "@repo/types";
import {
  formatActivityDate,
  formatClockTime,
  formatDurationWords,
  formatSportType,
  formatStat,
  sportVerb,
} from "./format";
import type {
  NotificationElement,
  ReceiptElement,
  StatementElement,
  StickerData,
} from "./template";

export const MONO_FONT =
  "'SF Mono', 'Cascadia Mono', Consolas, Menlo, 'Courier New', monospace";
export const SERIF_FONT =
  "Georgia, 'Iowan Old Style', 'Times New Roman', serif";

const HIGHLIGHT = "#ffc120";
const INK_ON_HIGHLIGHT = "#181410";

/* ---------------------------------------------------------------- */
/* Headline: editorial sentence with marker-highlighted stats        */
/* ---------------------------------------------------------------- */

interface Token {
  text: string;
  highlight: boolean;
}

function statementTokens(data: StickerData, fields: StatField[]): Token[] {
  const tokens: Token[] = [];
  const plain = (text: string) =>
    text
      .split(" ")
      .filter(Boolean)
      .forEach((word) => tokens.push({ text: word, highlight: false }));
  const mark = (text: string) => tokens.push({ text, highlight: true });

  const verb = sportVerb(data.sportType).present;
  const distance = fields.includes("distance")
    ? formatStat("distance", data)
    : null;
  if (distance) {
    const unitWord =
      distance.unit === "km"
        ? Number(distance.value) === 1
          ? "kilometer"
          : "kilometers"
        : distance.unit;
    mark(`${distance.value} ${unitWord}`);
    plain(`${verb} — ${data.name},`);
  } else {
    plain(`One ${verb} — ${data.name},`);
  }

  const clauses: [StatField, string, (v: string) => string][] = [
    ["duration", "in", () => formatDurationWords(data.movingTimeSeconds)],
    ["pace", "at", (v) => v],
    ["elevation", "climbing", (v) => v],
    ["heartRate", "averaging", (v) => v],
    ["calories", "burning", (v) => v],
  ];
  for (const [field, connector, transform] of clauses) {
    if (!fields.includes(field)) continue;
    const stat = formatStat(field, data);
    if (!stat) continue;
    plain(connector);
    const raw =
      field === "pace" && stat.unit.startsWith("/")
        ? `${stat.value}${stat.unit}`
        : `${stat.value} ${stat.unit}`.trim();
    mark(transform(raw));
    plain(",");
  }
  // Replace the trailing comma with a period.
  const last = tokens[tokens.length - 1];
  if (last && !last.highlight && last.text === ",") tokens.pop();
  tokens.push({ text: ".", highlight: false });
  return tokens;
}

export function drawStatement(
  ctx: CanvasRenderingContext2D,
  el: StatementElement,
  data: StickerData,
  fields: StatField[],
  userColor: string,
): void {
  const tokens = statementTokens(data, fields);
  const size = el.fontSize;
  const lineStep = el.lineHeight * size;
  const padX = size * 0.2;
  const padY = size * 0.16;
  const highlightColor = el.highlightColor ?? HIGHLIGHT;

  const fontFor = (highlight: boolean) =>
    `${highlight ? 700 : 400} ${size}px ${SERIF_FONT}`;
  const spaceWidth = (() => {
    ctx.font = fontFor(false);
    return ctx.measureText(" ").width;
  })();

  ctx.save();
  ctx.textBaseline = "alphabetic";
  let cursor = el.x;
  let baseline = el.y + size;

  for (const token of tokens) {
    ctx.font = fontFor(token.highlight);
    const textWidth = ctx.measureText(token.text).width;
    const boxWidth = textWidth + (token.highlight ? padX * 2 : 0);
    const isPunct = /^[.,;:!?]$/.test(token.text);
    if (!isPunct && cursor + boxWidth > el.x + el.width && cursor > el.x) {
      cursor = el.x;
      baseline += lineStep;
    }
    if (token.highlight) {
      ctx.fillStyle = highlightColor;
      ctx.fillRect(
        cursor,
        baseline - size * 0.82 - padY,
        boxWidth,
        size * 1.04 + padY * 2,
      );
      ctx.fillStyle = INK_ON_HIGHLIGHT;
      ctx.fillText(token.text, cursor + padX, baseline);
    } else {
      ctx.fillStyle = userColor;
      ctx.fillText(token.text, cursor, baseline);
    }
    cursor += boxWidth + (isPunct ? spaceWidth : spaceWidth);
  }
  ctx.restore();
}

/* ---------------------------------------------------------------- */
/* Notification card                                                  */
/* ---------------------------------------------------------------- */

const CARD_INK = "#161412";
const CARD_MUTED = "#8d8d93";

function roundedPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function tracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  baseline: number,
  size: number,
  em: number,
  align: "left" | "center" = "left",
): void {
  const gap = em * size;
  const width =
    ctx.measureText(text).width + gap * Math.max(0, text.length - 1);
  let cursor = align === "center" ? x - width / 2 : x;
  for (const ch of text) {
    ctx.fillText(ch, cursor, baseline);
    cursor += ctx.measureText(ch).width + gap;
  }
}

function ellipsizeText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out.trimEnd()}…`;
}

export function drawNotification(
  ctx: CanvasRenderingContext2D,
  el: NotificationElement,
  data: StickerData,
  fields: StatField[],
): void {
  const { x, y, width: w, height: h } = el;
  const pad = w * 0.07;
  const mono = MONO_FONT;

  ctx.save();
  // card + soft shadow
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "#ffffff";
  roundedPath(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = "#e7e7e7";
  ctx.lineWidth = 2;
  roundedPath(ctx, x, y, w, h, 12);
  ctx.stroke();

  ctx.textBaseline = "alphabetic";

  // 📍 WALKED · SUN, 5 JUL
  const labelBaseline = y + pad + h * 0.02;
  ctx.font = `26px ${mono}`;
  ctx.fillText("📍", x + pad, labelBaseline + 4);
  ctx.fillStyle = CARD_MUTED;
  ctx.font = `600 23px ${mono}`;
  tracked(
    ctx,
    `${sportVerb(data.sportType).past} · ${formatActivityDate(data.startDate).toUpperCase()}`,
    x + pad + 44,
    labelBaseline,
    23,
    0.14,
  );

  // Activity name
  ctx.fillStyle = CARD_INK;
  ctx.font = `700 ${Math.round(h * 0.155)}px ${mono}`;
  const name = ellipsizeText(ctx, data.name, w - pad * 2);
  ctx.fillText(name, x + pad, labelBaseline + h * 0.21);

  // hairline
  const ruleY = labelBaseline + h * 0.3;
  ctx.fillStyle = "#e7e7e7";
  ctx.fillRect(x + pad, ruleY, w - pad * 2, 2);

  // stat columns (max 4)
  const stats = fields
    .slice(0, 4)
    .map((f) => ({ field: f, stat: formatStat(f, data) }))
    .filter((s) => s.stat !== null);
  const colW = (w - pad * 2) / Math.max(stats.length, 1);
  stats.forEach(({ stat }, i) => {
    if (!stat) return;
    const cx = x + pad + i * colW;
    ctx.fillStyle = CARD_MUTED;
    ctx.font = `600 20px ${mono}`;
    tracked(ctx, stat.label.toUpperCase(), cx, ruleY + h * 0.13, 20, 0.1);
    ctx.fillStyle = CARD_INK;
    ctx.font = `700 ${Math.round(h * 0.115)}px ${mono}`;
    ctx.fillText(stat.value, cx, ruleY + h * 0.27);
    if (stat.unit) {
      const vw = ctx.measureText(stat.value).width;
      ctx.font = `600 20px ${mono}`;
      ctx.fillStyle = CARD_MUTED;
      ctx.fillText(stat.unit, cx + vw + 8, ruleY + h * 0.27);
    }
  });

  // accent bar along the bottom edge
  const barY = y + h - 14;
  ctx.fillStyle = HIGHLIGHT;
  ctx.fillRect(x + 6, barY, w - 12, 8);
  ctx.fillStyle = CARD_INK;
  ctx.fillRect(x + 6, barY, (w - 12) * 0.22, 8);
  ctx.restore();
}

/* ---------------------------------------------------------------- */
/* Receipt                                                            */
/* ---------------------------------------------------------------- */

const PAPER = "#faf5ec";
const PAPER_INK = "#2b251c";
const PAPER_MUTED = "#9b9080";
const PAPER_RULE = "#cfc5b4";

function dashedRule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
): void {
  ctx.save();
  ctx.strokeStyle = PAPER_RULE;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.stroke();
  ctx.restore();
}

/** Deterministic "barcode" from the activity name + date. */
function drawBarcode(
  ctx: CanvasRenderingContext2D,
  seedText: string,
  centerX: number,
  y: number,
  maxWidth: number,
  height: number,
): void {
  let seed = 0;
  for (const ch of seedText) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const next = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed >> 16;
  };
  const bars: number[] = [];
  let total = 0;
  while (total < maxWidth - 8) {
    const bar = 2 + (next() % 5);
    const gap = 2 + (next() % 4);
    bars.push(bar, gap);
    total += bar + gap;
  }
  let cursor = centerX - total / 2;
  ctx.fillStyle = PAPER_INK;
  bars.forEach((widthPx, i) => {
    if (i % 2 === 0) ctx.fillRect(cursor, y, widthPx, height);
    cursor += widthPx;
  });
}

const RECEIPT_LABELS: Record<StatField, string> = {
  distance: "DISTANCE",
  pace: "AVG PACE",
  duration: "DURATION",
  elevation: "ELEVATION",
  heartRate: "AVG HR",
  calories: "CALORIES",
};

export function drawReceipt(
  ctx: CanvasRenderingContext2D,
  el: ReceiptElement,
  data: StickerData,
  fields: StatField[],
): void {
  const { x, width: w } = el;
  const pad = w * 0.1;
  const mono = MONO_FONT;
  const innerW = w - pad * 2;
  const rowStep = 44;

  // ---- measure content height first -------------------------------
  const stats = fields
    .map((f) => ({ field: f, stat: formatStat(f, data) }))
    .filter((s) => s.stat !== null);
  let height = pad + 40; // header brand
  height += 36; // subtitle
  height += 52; // name
  height += 30; // rule
  height += rowStep * 2; // date + start time
  height += 30; // rule
  height += rowStep * stats.length;
  height += 30; // rule
  height += rowStep; // effort score
  height += 84; // barcode
  height += 74; // footer lines
  height += pad * 0.8;

  const y = el.y;
  const toothW = 16;
  const toothH = 10;

  ctx.save();
  // paper with torn bottom edge
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 10;
  ctx.beginPath();
  const r = 10;
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + height, r);
  ctx.lineTo(x + w, y + height - toothH);
  for (let tx = x + w; tx > x; tx -= toothW) {
    ctx.lineTo(tx - toothW / 2, y + height);
    ctx.lineTo(tx - toothW, y + height - toothH);
  }
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.fillStyle = PAPER;
  ctx.fill();
  ctx.restore();

  ctx.textBaseline = "alphabetic";
  const centerX = x + w / 2;
  let cursor = y + pad + 20;

  // brand
  ctx.fillStyle = PAPER_INK;
  ctx.font = `700 40px ${mono}`;
  tracked(ctx, "JEJACT", centerX, cursor, 40, 0.3, "center");
  cursor += 42;

  // subtitle
  ctx.fillStyle = PAPER_MUTED;
  ctx.font = `600 17px ${mono}`;
  tracked(
    ctx,
    `${formatSportType(data.sportType).toUpperCase()} RECEIPT · OFFICIAL RECORD`,
    centerX,
    cursor,
    17,
    0.1,
    "center",
  );
  cursor += 44;

  // activity name
  ctx.fillStyle = PAPER_INK;
  ctx.font = `700 30px ${mono}`;
  const displayName = ellipsizeText(ctx, data.name, innerW);
  ctx.fillText(
    displayName,
    centerX - ctx.measureText(displayName).width / 2,
    cursor,
  );
  cursor += 30;

  dashedRule(ctx, x + pad, cursor, innerW);
  cursor += rowStep;

  const row = (label: string, value: string, bold = false) => {
    ctx.font = `${bold ? 700 : 500} 24px ${mono}`;
    ctx.fillStyle = bold ? PAPER_INK : PAPER_MUTED;
    ctx.fillText(label, x + pad, cursor);
    ctx.fillStyle = PAPER_INK;
    ctx.font = `${bold ? 700 : 600} 24px ${mono}`;
    const vw = ctx.measureText(value).width;
    ctx.fillText(value, x + w - pad - vw, cursor);
    cursor += rowStep;
  };

  row("DATE", formatActivityDate(data.startDate).toUpperCase());
  row("START TIME", formatClockTime(data.startDate).toUpperCase());
  cursor -= rowStep - 8;
  dashedRule(ctx, x + pad, cursor, innerW);
  cursor += rowStep;

  for (const { field, stat } of stats) {
    if (!stat) continue;
    const value =
      field === "elevation"
        ? `+${stat.value} ${stat.unit.toUpperCase()}`
        : `${stat.value} ${stat.unit.toUpperCase()}`.trim();
    row(RECEIPT_LABELS[field], value);
  }
  cursor -= rowStep - 8;
  dashedRule(ctx, x + pad, cursor, innerW);
  cursor += rowStep;

  row("EFFORT SCORE", "100 / 100", true);
  cursor += 8;

  drawBarcode(
    ctx,
    `${data.name}|${data.startDate}`,
    centerX,
    cursor - 18,
    innerW * 0.8,
    52,
  );
  cursor += 76;

  ctx.fillStyle = PAPER_MUTED;
  ctx.font = `600 16px ${mono}`;
  tracked(
    ctx,
    `★ THANK YOU FOR YOUR ${formatSportType(data.sportType).toUpperCase()} ★`,
    centerX,
    cursor,
    16,
    0.1,
    "center",
  );
  cursor += 32;
  tracked(ctx, "POWERED BY JEJACT", centerX, cursor, 16, 0.1, "center");
  ctx.restore();
}
