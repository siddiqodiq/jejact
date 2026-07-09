import type { StatField } from "@repo/types";

/** One per-km split, for splits-based templates. */
export interface StickerSplit {
  distanceMeters: number;
  movingTimeSeconds: number;
}

/**
 * Minimal activity data a sticker needs. Decoupled from the API DTO so the
 * engine can render sample data (landing page, template gallery) too.
 */
export interface StickerData {
  name: string;
  sportType: string;
  startDate: string; // ISO
  distanceMeters: number;
  movingTimeSeconds: number;
  elapsedTimeSeconds: number;
  elevationGainMeters: number;
  averageSpeedMps: number | null;
  averageHeartrateBpm: number | null;
  calories: number | null;
  /** Strava encoded polyline of the route, when the activity has one. */
  mapPolyline?: string | null;
  /** Per-km splits, when the detailed activity has been fetched. */
  splits?: StickerSplit[] | null;
  /** City-level location, when known. */
  location?: string | null;
}

export type TextAlign = "left" | "center" | "right";

/** Static or activity-bound single line of text. */
export interface TextElement {
  type: "text";
  /** Bound source, or use `literal`. */
  source?: "activityName" | "date" | "sportType" | "brand";
  literal?: string;
  x: number;
  y: number;
  /** Max width before the text is ellipsized. */
  maxWidth?: number;
  fontSize: number;
  fontWeight?: number;
  letterSpacing?: number;
  align?: TextAlign;
  uppercase?: boolean;
  /** 1 = primary text color, otherwise opacity applied to it. */
  opacity?: number;
}

/**
 * Flow container that lays out the user's enabled stats. Hidden stats
 * reflow automatically, so templates never hard-code which stats exist.
 */
export interface StatFlowElement {
  type: "statFlow";
  x: number;
  y: number;
  /** Available width (used for centering and grid layouts). */
  width: number;
  direction: "row" | "column" | "grid";
  /** Columns when direction = "grid". */
  columns?: number;
  gap: number;
  valueSize: number;
  labelSize: number;
  valueWeight?: number;
  align?: TextAlign;
  /** Draw thin dividers between items (row direction only). */
  dividers?: boolean;
  /** Render only these fields here (intersection with enabled fields). */
  only?: StatField[];
  /** Exclude these fields here (e.g. when a hero element shows them). */
  except?: StatField[];
}

/** A single oversized stat — the "hero" of a template. */
export interface StatHeroElement {
  type: "statHero";
  field: StatField;
  x: number;
  y: number;
  width: number;
  valueSize: number;
  labelSize: number;
  valueWeight?: number;
  align?: TextAlign;
  /** Show unit inline after the value at a smaller size. */
  inlineUnit?: boolean;
}

/** Rounded translucent panel (glass surface behind content). */
export interface BoxElement {
  type: "box";
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  /** "glass" adapts to text color; otherwise any CSS color. */
  fill: "glass" | string;
  stroke?: boolean;
}

/**
 * The activity's GPS route, drawn as a stroked path fitted into the box
 * (aspect ratio preserved). Skipped when the activity has no polyline.
 */
export interface RouteElement {
  type: "route";
  x: number;
  y: number;
  width: number;
  height: number;
  strokeWidth: number;
  /** Draw start (filled) and finish (ring) markers. Default true. */
  markers?: boolean;
  opacity?: number;
}

/**
 * Editorial sentence ("12.4 kilometers run — Sunday Long Run, in 1h 10m…")
 * with stat values highlighted marker-style. Wraps within `width`.
 * Plain words follow the user's text color; highlights stay amber.
 */
export interface StatementElement {
  type: "statement";
  x: number;
  y: number;
  width: number;
  fontSize: number;
  /** Multiplier of fontSize. */
  lineHeight: number;
  highlightColor?: string;
}

/** Notification-style opaque card (own fixed palette, monospace type). */
export interface NotificationElement {
  type: "notification";
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Shopping-receipt style card: brand header, dashed rules, one row per
 * enabled stat, barcode, torn bottom edge. Height adapts to content.
 */
export interface ReceiptElement {
  type: "receipt";
  x: number;
  y: number;
  width: number;
}

/**
 * WhatsApp-style outgoing chat bubble: enabled stats as the message text,
 * clock time + blue double check inside the bubble (own fixed palette).
 */
export interface ChatBubbleElement {
  type: "chatBubble";
  x: number;
  y: number;
  width: number;
}

/**
 * Push-notification card with the athlete's avatar (drawn from
 * RenderOptions.avatar when provided, initial-letter tile otherwise),
 * activity name as title and stats as the body (own fixed palette).
 */
export interface NotifBubbleElement {
  type: "notifBubble";
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * "1.67 kilometers ✔" — one stat spelled out, followed by a blue
 * verified seal. Text follows the user color; the seal stays blue.
 */
export interface VerifiedElement {
  type: "verified";
  field: StatField;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  align?: TextAlign;
}

/**
 * Terminal window: `$ run_stats --latest` prompt followed by one
 * key/value line per enabled stat (own fixed palette, monospace).
 * Height adapts to the number of enabled stats.
 */
export interface TerminalElement {
  type: "terminal";
  x: number;
  y: number;
  width: number;
}

/**
 * Horizontal per-km pace bars from the activity's splits. Bar length is
 * proportional to speed; the fastest split is drawn at full opacity.
 * Skipped when the activity has fewer than two splits.
 */
export interface SplitsBarElement {
  type: "splitsBar";
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DividerElement {
  type: "divider";
  x: number;
  y: number;
  width: number;
  opacity?: number;
}

export type TemplateElement =
  | TextElement
  | StatFlowElement
  | StatHeroElement
  | BoxElement
  | RouteElement
  | StatementElement
  | NotificationElement
  | ReceiptElement
  | ChatBubbleElement
  | NotifBubbleElement
  | VerifiedElement
  | TerminalElement
  | SplitsBarElement
  | DividerElement;

export interface StickerTemplate {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  /**
   * True for "object" stickers (notification, receipt) that ship their own
   * colors — the text-color picker doesn't apply to them.
   */
  fixedPalette?: boolean;
  elements: TemplateElement[];
}
