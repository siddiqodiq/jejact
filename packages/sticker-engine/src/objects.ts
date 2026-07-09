import type { StatField } from "@repo/types";
import {
  formatClockTime,
  formatSportType,
  formatStat,
  isRideSport,
  sportVerb,
  type FormattedStat,
} from "./format";
import { ellipsizeText, HIGHLIGHT, MONO_FONT, roundedPath } from "./cards";
import type {
  ChatBubbleElement,
  NotifBubbleElement,
  SplitsBarElement,
  StickerData,
  StickerSplit,
  TerminalElement,
  VerifiedElement,
} from "./template";

function enabledStats(
  data: StickerData,
  fields: StatField[],
): FormattedStat[] {
  return fields
    .map((f) => formatStat(f, data))
    .filter((s): s is FormattedStat => s !== null);
}

/** "1.67 km" — pace units ("/km") attach without a space. */
function statText(stat: FormattedStat): string {
  if (!stat.unit) return stat.value;
  return stat.unit.startsWith("/")
    ? `${stat.value}${stat.unit}`
    : `${stat.value} ${stat.unit}`;
}

/* ---------------------------------------------------------------- */
/* Chat bubble (WhatsApp-style outgoing message)                      */
/* ---------------------------------------------------------------- */

const WA_BUBBLE = "#d9fdd3";
const WA_INK = "#0b141a";
const WA_TIME = "#5b7562";
const WA_TICK = "#53bdeb";

/** Blue double check — the "read" receipt. */
function drawDoubleCheck(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
): void {
  ctx.save();
  ctx.strokeStyle = WA_TICK;
  ctx.lineWidth = size * 0.16;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const check = (ox: number) => {
    ctx.beginPath();
    ctx.moveTo(x + ox, y + size * 0.52);
    ctx.lineTo(x + ox + size * 0.3, y + size * 0.85);
    ctx.lineTo(x + ox + size * 0.85, y + size * 0.12);
    ctx.stroke();
  };
  check(0);
  check(size * 0.5);
  ctx.restore();
}

export function drawChatBubble(
  ctx: CanvasRenderingContext2D,
  el: ChatBubbleElement,
  data: StickerData,
  fields: StatField[],
  font: string,
): void {
  const textSize = 56;
  const metaSize = 30;
  const padX = 44;
  const padY = 38;
  const tail = 26;

  ctx.save();
  ctx.textBaseline = "alphabetic";

  ctx.font = `500 ${textSize}px ${font}`;
  const maxTextW = el.width - tail - padX * 2;
  // Cap at three stats so the bubble keeps chat-message proportions.
  const message = ellipsizeText(
    ctx,
    enabledStats(data, fields).slice(0, 3).map(statText).join(", ") ||
      data.name,
    maxTextW,
  );
  const textW = ctx.measureText(message).width;

  const time = formatClockTime(data.startDate);
  ctx.font = `400 ${metaSize}px ${font}`;
  const tickSize = metaSize * 1.05;
  const metaW = ctx.measureText(time).width + 14 + tickSize * 1.45;

  const bubbleW = Math.max(textW, metaW) + padX * 2;
  const bubbleH = padY + textSize + 20 + metaSize + padY * 0.7;
  // Outgoing message: bubble hugs the right edge, tail at the top-right.
  const bx = el.x + el.width - tail - bubbleW;
  const by = el.y;

  // Bubble and tail as a single path: the top-right corner stays square
  // and runs straight into the tail, exactly like a WhatsApp bubble.
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.18)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = WA_BUBBLE;
  const r = 30;
  ctx.beginPath();
  ctx.moveTo(bx + r, by);
  ctx.lineTo(bx + bubbleW + tail, by); // top edge out to the tail tip
  ctx.quadraticCurveTo(bx + bubbleW + 4, by + 10, bx + bubbleW, by + 44);
  ctx.lineTo(bx + bubbleW, by + bubbleH - r);
  ctx.quadraticCurveTo(bx + bubbleW, by + bubbleH, bx + bubbleW - r, by + bubbleH);
  ctx.lineTo(bx + r, by + bubbleH);
  ctx.quadraticCurveTo(bx, by + bubbleH, bx, by + bubbleH - r);
  ctx.lineTo(bx, by + r);
  ctx.quadraticCurveTo(bx, by, bx + r, by);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = WA_INK;
  ctx.font = `500 ${textSize}px ${font}`;
  ctx.fillText(message, bx + padX, by + padY + textSize * 0.82);

  const metaBaseline = by + bubbleH - padY * 0.7;
  const timeX = bx + bubbleW - padX - metaW;
  ctx.fillStyle = WA_TIME;
  ctx.font = `400 ${metaSize}px ${font}`;
  ctx.fillText(time, timeX, metaBaseline);
  drawDoubleCheck(
    ctx,
    timeX + ctx.measureText(time).width + 14,
    metaBaseline - metaSize * 0.82,
    tickSize,
  );
  ctx.restore();
}

/* ---------------------------------------------------------------- */
/* Notification bubble with athlete avatar                            */
/* ---------------------------------------------------------------- */

const NOTIF_BG = "#f2f2f4";
const NOTIF_INK = "#141416";
const NOTIF_MUTED = "#82828a";
const NOTIF_TILE = "#161412";

export function drawNotifBubble(
  ctx: CanvasRenderingContext2D,
  el: NotifBubbleElement,
  data: StickerData,
  fields: StatField[],
  font: string,
  avatar?: CanvasImageSource | null,
): void {
  const { x, y, width: w, height: h } = el;
  const pad = h * 0.12;

  ctx.save();
  ctx.textBaseline = "alphabetic";

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = NOTIF_BG;
  roundedPath(ctx, x, y, w, h, h * 0.16);
  ctx.fill();
  ctx.restore();

  // avatar (Strava profile photo, or initial-letter tile as fallback) —
  // half the card height, vertically centered, so it sits flush with the
  // three text lines instead of dominating the card.
  const av = h * 0.56;
  const avY = y + (h - av) / 2;
  ctx.save();
  roundedPath(ctx, x + pad, avY, av, av, av * 0.28);
  if (avatar) {
    ctx.clip();
    // Strava caps avatars at 124px; smooth the upscale as well as the
    // browser can.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(avatar, x + pad, avY, av, av);
  } else {
    ctx.fillStyle = NOTIF_TILE;
    ctx.fill();
    ctx.fillStyle = HIGHLIGHT;
    ctx.font = `700 ${av * 0.5}px ${font}`;
    const letter = (data.name.trim()[0] ?? "J").toUpperCase();
    const lw = ctx.measureText(letter).width;
    ctx.fillText(letter, x + pad + (av - lw) / 2, avY + av * 0.66);
  }
  ctx.restore();

  const textX = x + pad + av + pad * 0.85;
  const rightX = x + w - pad;
  // Baselines pinned to the avatar's span: title caps align with its top
  // edge, the secondary line bottoms out at its bottom edge. Type is sized
  // up so the tighter leading still fills the same span.
  const titleY = avY + av * 0.223;
  const bodyY = titleY + av * 0.382;
  const secondaryY = bodyY + av * 0.352;

  // title row: activity name + clock time
  const time = formatClockTime(data.startDate);
  const timeSize = h * 0.095;
  ctx.font = `600 ${timeSize}px ${font}`;
  const timeW = ctx.measureText(time).width;
  ctx.fillStyle = NOTIF_MUTED;
  ctx.fillText(time, rightX - timeW, titleY);

  ctx.fillStyle = NOTIF_INK;
  ctx.font = `800 ${h * 0.165}px ${font}`;
  ctx.fillText(
    ellipsizeText(ctx, data.name, rightX - textX - timeW - 24),
    textX,
    titleY,
  );

  // body line: "1.67 km in 24:10 at 14:28/km"
  const primary: string[] = [];
  const distance = fields.includes("distance") ? formatStat("distance", data) : null;
  const duration = fields.includes("duration") ? formatStat("duration", data) : null;
  const pace = fields.includes("pace") ? formatStat("pace", data) : null;
  if (distance) primary.push(statText(distance));
  if (duration) primary.push(`in ${statText(duration)}`);
  if (pace) primary.push(`at ${statText(pace)}`);
  ctx.font = `600 ${h * 0.132}px ${font}`;
  ctx.fillText(
    ellipsizeText(
      ctx,
      primary.join(" ") || `${formatSportType(data.sportType)} logged`,
      rightX - textX,
    ),
    textX,
    bodyY,
  );

  // secondary line: leftover stats + location (sport type as fallback)
  const secondary = fields
    .filter((f) => f === "heartRate" || f === "calories" || f === "elevation")
    .map((f) => formatStat(f, data))
    .filter((s): s is FormattedStat => s !== null)
    .map(statText);
  secondary.push(data.location || formatSportType(data.sportType));
  ctx.fillStyle = NOTIF_MUTED;
  ctx.font = `600 ${h * 0.116}px ${font}`;
  ctx.fillText(
    ellipsizeText(ctx, secondary.join(" · "), rightX - textX),
    textX,
    secondaryY,
  );
  ctx.restore();
}

/* ---------------------------------------------------------------- */
/* Verified stat ("1.67 kilometers" + blue seal)                      */
/* ---------------------------------------------------------------- */

const VERIFIED_BLUE = "#1d9bf0";
/** Instagram's own face when available (webfont or OS-installed). */
const INSTAGRAM_FONT = "'Instagram Sans'";

const UNIT_WORDS: Record<string, [singular: string, plural: string]> = {
  km: ["kilometer", "kilometers"],
  m: ["meter", "meters"],
};

function verifiedText(stat: FormattedStat): string {
  const words = UNIT_WORDS[stat.unit];
  if (!words) return statText(stat);
  const singular = Math.abs(Number(stat.value)) === 1;
  return `${stat.value} ${singular ? words[0] : words[1]}`;
}

function drawSeal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
): void {
  ctx.save();
  ctx.fillStyle = VERIFIED_BLUE;
  ctx.beginPath();
  const steps = 90;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const r = radius * (0.93 + 0.07 * Math.cos(9 * angle));
    const px = cx + r * Math.cos(angle);
    const py = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = radius * 0.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - radius * 0.42, cy + 0.02 * radius);
  ctx.lineTo(cx - radius * 0.1, cy + 0.34 * radius);
  ctx.lineTo(cx + radius * 0.45, cy - 0.3 * radius);
  ctx.stroke();
  ctx.restore();
}

export function drawVerified(
  ctx: CanvasRenderingContext2D,
  el: VerifiedElement,
  data: StickerData,
  fields: StatField[],
  color: string,
  font: string,
): void {
  // Preferred field first, then whatever enabled stat has data.
  const candidates: StatField[] = [
    el.field,
    ...fields.filter((f) => f !== el.field),
  ];
  let stat: FormattedStat | null = null;
  for (const f of candidates) {
    if (!fields.includes(f)) continue;
    stat = formatStat(f, data);
    if (stat) break;
  }
  if (!stat) return;

  const text = verifiedText(stat);
  ctx.save();
  ctx.textBaseline = "alphabetic";
  ctx.font = `400 ${el.fontSize}px ${INSTAGRAM_FONT}, ${font}`;
  const badgeR = el.fontSize * 0.4;
  const gap = el.fontSize * 0.32;
  const total = ctx.measureText(text).width + gap + badgeR * 2;

  const align = el.align ?? "center";
  let cursor = el.x;
  if (align === "center") cursor = el.x + (el.width - total) / 2;
  if (align === "right") cursor = el.x + el.width - total;

  const baseline = el.y + el.fontSize;
  ctx.fillStyle = color;
  ctx.fillText(text, cursor, baseline);
  drawSeal(
    ctx,
    cursor + ctx.measureText(text).width + gap + badgeR,
    baseline - el.fontSize * 0.34,
    badgeR,
  );
  ctx.restore();
}

/* ---------------------------------------------------------------- */
/* Terminal window                                                    */
/* ---------------------------------------------------------------- */

const TERM_BG = "#0d1117";
const TERM_BORDER = "#243040";
const TERM_PROMPT = "#53e28b";
const TERM_KEY = "#5f7a68";
const TERM_VALUE = "#7ee787";

const TERM_KEYS: Record<StatField, string> = {
  distance: "dist",
  pace: "pace",
  duration: "time",
  elevation: "elev",
  heartRate: "hr",
  calories: "kcal",
};

export function drawTerminal(
  ctx: CanvasRenderingContext2D,
  el: TerminalElement,
  data: StickerData,
  fields: StatField[],
): void {
  const { x, y, width: w } = el;
  const pad = w * 0.1;
  const size = 34;
  const lineH = 58;

  const stats = fields
    .map((f) => ({ key: TERM_KEYS[f], stat: formatStat(f, data) }))
    .filter((s): s is { key: string; stat: FormattedStat } => s.stat !== null);

  // Box height follows the content: prompt, one row per enabled stat,
  // then the trailing cursor line.
  const h =
    pad +
    size * 0.4 +
    lineH * 1.4 +
    stats.length * lineH +
    lineH * 0.3 +
    size * 0.25 +
    pad * 0.7;

  ctx.save();
  ctx.textBaseline = "alphabetic";

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = TERM_BG;
  roundedPath(ctx, x, y, w, h, 26);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = TERM_BORDER;
  ctx.lineWidth = 2;
  roundedPath(ctx, x, y, w, h, 26);
  ctx.stroke();

  const verb = sportVerb(data.sportType).present.replace(/\s+/g, "_");
  let baseline = y + pad + size * 0.4;
  ctx.fillStyle = TERM_PROMPT;
  ctx.font = `600 ${size}px ${MONO_FONT}`;
  ctx.fillText(`$ ${verb}_stats --latest`, x + pad, baseline);
  baseline += lineH * 1.4;

  ctx.font = `500 ${size}px ${MONO_FONT}`;
  const keyCol = x + pad;
  const valueCol =
    keyCol +
    Math.max(...stats.map(({ key }) => ctx.measureText(`${key}:`).width), 0) +
    size * 0.8;
  for (const { key, stat } of stats) {
    ctx.fillStyle = TERM_KEY;
    ctx.font = `500 ${size}px ${MONO_FONT}`;
    ctx.fillText(`${key}:`, keyCol, baseline);
    ctx.fillStyle = TERM_VALUE;
    ctx.font = `700 ${size}px ${MONO_FONT}`;
    ctx.fillText(statText(stat), valueCol, baseline);
    baseline += lineH;
  }

  // block cursor on its own prompt line
  ctx.fillStyle = TERM_PROMPT;
  ctx.font = `600 ${size}px ${MONO_FONT}`;
  ctx.fillText("$", keyCol, baseline + lineH * 0.3);
  ctx.globalAlpha = 0.8;
  ctx.fillRect(
    keyCol + ctx.measureText("$ ").width,
    baseline + lineH * 0.3 - size * 0.78,
    size * 0.52,
    size * 0.95,
  );
  ctx.restore();
}

/* ---------------------------------------------------------------- */
/* Pace splits bar                                                    */
/* ---------------------------------------------------------------- */

/** Splits big enough to have a meaningful pace (drops tiny leftovers). */
function usableSplits(data: StickerData): StickerSplit[] {
  return (data.splits ?? []).filter(
    (s) => s.distanceMeters >= 100 && s.movingTimeSeconds > 0,
  );
}

export function splitsAvailable(data: StickerData): boolean {
  return usableSplits(data).length >= 2;
}

function paceLabel(split: StickerSplit, ride: boolean): string {
  const speed = split.distanceMeters / split.movingTimeSeconds; // m/s
  if (ride) return `${(speed * 3.6).toFixed(1)}`;
  const secPerKm = 1000 / speed;
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function drawSplitsBar(
  ctx: CanvasRenderingContext2D,
  el: SplitsBarElement,
  data: StickerData,
  color: string,
  font: string,
): void {
  const splits = usableSplits(data);
  if (splits.length < 2) return;
  const ride = isRideSport(data.sportType);

  const speeds = splits.map((s) => s.distanceMeters / s.movingTimeSeconds);
  const maxSpeed = Math.max(...speeds);
  const fastest = speeds.indexOf(maxSpeed);

  const hintSpace = 48; // room for the unit hint under the last row
  const rowH = Math.min(92, (el.height - hintSpace) / splits.length);
  const barH = Math.min(32, rowH * 0.42);
  const textSize = Math.min(34, rowH * 0.46);
  const indexW = 56;
  const labelW = textSize * 4.4;
  const barLeft = el.x + indexW + 24;
  const barMax = el.x + el.width - labelW - barLeft;
  const top = el.y + (el.height - hintSpace - rowH * splits.length) / 2;

  ctx.save();
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color;

  splits.forEach((split, i) => {
    const speed = speeds[i] ?? maxSpeed;
    const rowY = top + i * rowH;
    const baseline = rowY + rowH / 2 + textSize * 0.36;
    const emphasis = i === fastest;

    ctx.save();
    ctx.globalAlpha *= emphasis ? 0.95 : 0.5;
    ctx.font = `600 ${textSize}px ${font}`;
    const index = `${i + 1}`;
    ctx.fillText(
      index,
      el.x + indexW - ctx.measureText(index).width,
      baseline,
    );
    ctx.restore();

    ctx.save();
    ctx.globalAlpha *= emphasis ? 1 : 0.38;
    const barW = Math.max(barMax * (speed / maxSpeed), barH);
    roundedPath(ctx, barLeft, rowY + (rowH - barH) / 2, barW, barH, barH / 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha *= emphasis ? 1 : 0.6;
    ctx.font = `${emphasis ? 700 : 500} ${textSize}px ${font}`;
    const label = paceLabel(split, ride);
    ctx.fillText(
      label,
      el.x + el.width - ctx.measureText(label).width,
      baseline,
    );
    ctx.restore();
  });

  // unit hint under the last row
  ctx.save();
  ctx.globalAlpha *= 0.45;
  ctx.font = `500 ${textSize * 0.72}px ${font}`;
  const hint = ride ? "km/h per km" : "min/km";
  ctx.fillText(
    hint,
    el.x + el.width - ctx.measureText(hint).width,
    top + splits.length * rowH + textSize,
  );
  ctx.restore();
  ctx.restore();
}
