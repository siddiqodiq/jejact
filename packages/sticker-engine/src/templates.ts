import type { StickerTemplate } from "./template";

/**
 * Built-in sticker templates. All sizes are export-resolution (1080-class)
 * with transparent backgrounds, designed for Instagram Stories.
 */
export const BUILT_IN_TEMPLATES: StickerTemplate[] = [
  {
    id: "minimal-distance",
    name: "Minimal",
    description: "One huge number, nothing else shouting.",
    width: 1080,
    height: 560,
    elements: [
      { type: "text", source: "sportType", x: 60, y: 48, fontSize: 34, fontWeight: 600, uppercase: true, letterSpacing: 0.18, opacity: 0.65 },
      { type: "statHero", field: "distance", x: 60, y: 110, width: 960, valueSize: 240, labelSize: 30, valueWeight: 800, align: "left" },
      { type: "statFlow", x: 60, y: 448, width: 960, direction: "row", gap: 64, valueSize: 52, labelSize: 22, align: "left", except: ["distance"] },
    ],
  },
  {
    id: "glass-card",
    name: "Glass Card",
    description: "Translucent panel with a tidy grid of stats.",
    width: 1080,
    height: 760,
    elements: [
      { type: "box", x: 40, y: 40, width: 1000, height: 680, radius: 56, fill: "glass", stroke: true },
      { type: "text", source: "activityName", x: 116, y: 116, maxWidth: 848, fontSize: 56, fontWeight: 700 },
      { type: "text", source: "date", x: 116, y: 196, fontSize: 30, fontWeight: 500, opacity: 0.6 },
      { type: "divider", x: 116, y: 268, width: 848 },
      { type: "statFlow", x: 116, y: 316, width: 848, direction: "grid", columns: 2, gap: 72, valueSize: 88, labelSize: 24 },
      { type: "text", source: "brand", x: 964, y: 656, fontSize: 24, fontWeight: 700, letterSpacing: 0.24, opacity: 0.4, align: "right" },
    ],
  },
  {
    id: "bold-pace",
    name: "Tempo",
    description: "Pace front and center for the speed obsessed.",
    width: 1080,
    height: 560,
    elements: [
      { type: "text", source: "activityName", x: 540, y: 40, maxWidth: 900, fontSize: 40, fontWeight: 600, align: "center", opacity: 0.75 },
      { type: "statHero", field: "pace", x: 60, y: 116, width: 960, valueSize: 220, labelSize: 30, valueWeight: 800, align: "center" },
      { type: "statFlow", x: 60, y: 442, width: 960, direction: "row", gap: 72, valueSize: 50, labelSize: 22, align: "center", except: ["pace"] },
    ],
  },
  {
    id: "story-strip",
    name: "Strip",
    description: "A slim row of stats with dividers. Sits anywhere.",
    width: 1080,
    height: 380,
    elements: [
      { type: "text", source: "activityName", x: 540, y: 42, maxWidth: 920, fontSize: 44, fontWeight: 700, align: "center" },
      { type: "text", source: "date", x: 540, y: 104, fontSize: 26, fontWeight: 500, align: "center", opacity: 0.6 },
      { type: "statFlow", x: 40, y: 190, width: 1000, direction: "row", gap: 56, valueSize: 72, labelSize: 24, align: "center", dividers: true },
    ],
  },
  {
    id: "vertical-tower",
    name: "Tower",
    description: "Tall stack for the side of a Story.",
    width: 640,
    height: 1080,
    elements: [
      { type: "text", source: "sportType", x: 56, y: 56, fontSize: 30, fontWeight: 600, uppercase: true, letterSpacing: 0.18, opacity: 0.65 },
      { type: "text", source: "date", x: 56, y: 110, fontSize: 26, fontWeight: 500, opacity: 0.5 },
      { type: "statFlow", x: 56, y: 210, width: 528, direction: "column", gap: 56, valueSize: 108, labelSize: 26, align: "left" },
      { type: "text", source: "brand", x: 56, y: 990, fontSize: 24, fontWeight: 700, letterSpacing: 0.24, opacity: 0.4 },
    ],
  },
  {
    id: "race-day",
    name: "Race Day",
    description: "Bib-style panel with the essentials, loud and proud.",
    width: 1080,
    height: 700,
    elements: [
      { type: "box", x: 40, y: 40, width: 1000, height: 620, radius: 44, fill: "glass", stroke: true },
      { type: "text", source: "brand", x: 540, y: 96, fontSize: 28, fontWeight: 700, letterSpacing: 0.32, align: "center", opacity: 0.5 },
      { type: "statHero", field: "distance", x: 90, y: 168, width: 900, valueSize: 200, labelSize: 0, valueWeight: 800, align: "center" },
      { type: "divider", x: 160, y: 452, width: 760 },
      { type: "statFlow", x: 90, y: 496, width: 900, direction: "row", gap: 80, valueSize: 56, labelSize: 22, align: "center", except: ["distance"] },
    ],
  },
  {
    id: "trace",
    name: "Trace",
    description: "Your route, drawn as one clean line.",
    width: 1080,
    height: 960,
    elements: [
      { type: "text", source: "activityName", x: 60, y: 44, maxWidth: 960, fontSize: 52, fontWeight: 700 },
      { type: "text", source: "date", x: 60, y: 116, fontSize: 28, fontWeight: 500, opacity: 0.6 },
      { type: "route", x: 90, y: 200, width: 900, height: 500, strokeWidth: 10 },
      { type: "divider", x: 60, y: 756, width: 960 },
      { type: "statFlow", x: 60, y: 800, width: 960, direction: "row", gap: 64, valueSize: 64, labelSize: 22, align: "center" },
    ],
  },
  {
    id: "map-card",
    name: "Map Card",
    description: "Glass panel with the route beside your numbers.",
    width: 1080,
    height: 820,
    elements: [
      { type: "box", x: 40, y: 40, width: 1000, height: 740, radius: 56, fill: "glass", stroke: true },
      { type: "text", source: "activityName", x: 116, y: 108, maxWidth: 540, fontSize: 52, fontWeight: 700 },
      { type: "text", source: "date", x: 116, y: 180, fontSize: 28, fontWeight: 500, opacity: 0.6 },
      { type: "statFlow", x: 116, y: 290, width: 520, direction: "grid", columns: 2, gap: 44, valueSize: 60, labelSize: 20 },
      { type: "route", x: 690, y: 260, width: 274, height: 430, strokeWidth: 8 },
      { type: "text", source: "brand", x: 964, y: 716, fontSize: 24, fontWeight: 700, letterSpacing: 0.24, opacity: 0.4, align: "right" },
    ],
  },
  {
    id: "route-strip",
    name: "Route Strip",
    description: "Compact route plus stats, side by side.",
    width: 1080,
    height: 460,
    elements: [
      { type: "route", x: 50, y: 70, width: 300, height: 320, strokeWidth: 8 },
      { type: "text", source: "activityName", x: 410, y: 64, maxWidth: 610, fontSize: 44, fontWeight: 700 },
      { type: "statFlow", x: 410, y: 170, width: 610, direction: "grid", columns: 3, gap: 40, valueSize: 48, labelSize: 18 },
    ],
  },
  {
    id: "headline",
    name: "Headline",
    description: "An editorial sentence with your stats marked in amber.",
    width: 1080,
    height: 640,
    elements: [
      { type: "statement", x: 70, y: 70, width: 940, fontSize: 74, lineHeight: 1.55 },
    ],
  },
  {
    id: "notification",
    name: "Notif",
    description: "The kind of notification you actually want to get.",
    width: 1000,
    height: 470,
    fixedPalette: true,
    elements: [
      { type: "notification", x: 50, y: 30, width: 900, height: 390 },
    ],
  },
  {
    id: "receipt",
    name: "Receipt",
    description: "An official-looking receipt for your effort. 100/100.",
    width: 720,
    height: 1140,
    fixedPalette: true,
    elements: [{ type: "receipt", x: 50, y: 30, width: 620 }],
  },
  {
    id: "chat",
    name: "Chat",
    description: "Your stats as a chat bubble — read receipt included.",
    width: 1000,
    height: 280,
    fixedPalette: true,
    elements: [{ type: "chatBubble", x: 30, y: 40, width: 940 }],
  },
  {
    id: "ping",
    name: "Ping",
    description: "A push notification starring your profile photo.",
    width: 1080,
    height: 360,
    fixedPalette: true,
    elements: [{ type: "notifBubble", x: 40, y: 36, width: 1000, height: 280 }],
  },
  {
    id: "verified",
    name: "Verified",
    description: "Your distance, officially blue-checked.",
    width: 1080,
    height: 260,
    elements: [
      { type: "verified", field: "distance", x: 60, y: 66, width: 960, fontSize: 116, align: "center" },
    ],
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "Stats straight from the command line.",
    width: 800,
    height: 660,
    fixedPalette: true,
    elements: [{ type: "terminal", x: 40, y: 30, width: 720 }],
  },
  {
    id: "splits",
    name: "Splits",
    description: "Per-kilometer pace, bar by bar.",
    width: 900,
    height: 760,
    elements: [
      { type: "text", literal: "PACE SPLITS", x: 60, y: 48, fontSize: 30, fontWeight: 600, uppercase: true, letterSpacing: 0.18, opacity: 0.65 },
      { type: "splitsBar", x: 60, y: 128, width: 780, height: 580 },
    ],
  },
  {
    id: "duo",
    name: "Duo",
    description: "Distance and pace, sharing the spotlight.",
    width: 1080,
    height: 560,
    elements: [
      { type: "text", source: "activityName", x: 60, y: 44, maxWidth: 960, fontSize: 44, fontWeight: 600, opacity: 0.8 },
      { type: "statHero", field: "distance", x: 60, y: 150, width: 440, valueSize: 150, labelSize: 26, valueWeight: 800, align: "left" },
      { type: "statHero", field: "pace", x: 580, y: 150, width: 440, valueSize: 150, labelSize: 26, valueWeight: 800, align: "left" },
      { type: "statFlow", x: 60, y: 452, width: 960, direction: "row", gap: 64, valueSize: 44, labelSize: 20, align: "left", except: ["distance", "pace"] },
    ],
  },
];

export function getTemplate(id: string): StickerTemplate | undefined {
  return BUILT_IN_TEMPLATES.find((t) => t.id === id);
}

/** True when the template draws the GPS route (needs a polyline). */
export function templateUsesRoute(template: StickerTemplate): boolean {
  return template.elements.some((el) => el.type === "route");
}

/** True when the template draws per-km splits (needs detailed activity data). */
export function templateUsesSplits(template: StickerTemplate): boolean {
  return template.elements.some((el) => el.type === "splitsBar");
}
