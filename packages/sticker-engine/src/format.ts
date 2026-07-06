import type { StatField } from "@repo/types";
import type { StickerData } from "./template";

export interface FormattedStat {
  /** e.g. "12.4" */
  value: string;
  /** e.g. "km" — rendered smaller, inline after the value. */
  unit: string;
  /** e.g. "Distance" */
  label: string;
}

const RIDE_SPORTS = new Set([
  "Ride",
  "VirtualRide",
  "EBikeRide",
  "GravelRide",
  "MountainBikeRide",
  "Handcycle",
  "Velomobile",
]);

function isRide(sportType: string): boolean {
  return RIDE_SPORTS.has(sportType);
}

export function formatDistance(meters: number): FormattedStat {
  const km = meters / 1000;
  const value = km >= 100 ? km.toFixed(0) : km.toFixed(2);
  return { value, unit: "km", label: "Distance" };
}

export function formatDuration(seconds: number): FormattedStat {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const value = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  return { value, unit: "", label: "Time" };
}

/** Pace for foot sports (min/km), average speed for rides (km/h). */
export function formatPace(data: StickerData): FormattedStat {
  if (isRide(data.sportType)) {
    const mps =
      data.averageSpeedMps ??
      (data.movingTimeSeconds > 0
        ? data.distanceMeters / data.movingTimeSeconds
        : 0);
    return { value: (mps * 3.6).toFixed(1), unit: "km/h", label: "Avg Speed" };
  }
  if (data.distanceMeters <= 0 || data.movingTimeSeconds <= 0) {
    return { value: "–", unit: "/km", label: "Pace" };
  }
  const secPerKm = data.movingTimeSeconds / (data.distanceMeters / 1000);
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  const value = `${m}:${s.toString().padStart(2, "0")}`;
  return { value, unit: "/km", label: "Pace" };
}

export function formatElevation(meters: number): FormattedStat {
  return { value: Math.round(meters).toString(), unit: "m", label: "Elev Gain" };
}

export function formatHeartRate(bpm: number): FormattedStat {
  return { value: Math.round(bpm).toString(), unit: "bpm", label: "Avg HR" };
}

export function formatCalories(kcal: number): FormattedStat {
  return { value: Math.round(kcal).toString(), unit: "kcal", label: "Calories" };
}

/** Returns null when the activity has no data for the field. */
export function formatStat(
  field: StatField,
  data: StickerData,
): FormattedStat | null {
  switch (field) {
    case "distance":
      return data.distanceMeters > 0
        ? formatDistance(data.distanceMeters)
        : null;
    case "pace":
      return data.movingTimeSeconds > 0 ? formatPace(data) : null;
    case "duration":
      return data.movingTimeSeconds > 0
        ? formatDuration(data.movingTimeSeconds)
        : null;
    case "elevation":
      return data.elevationGainMeters > 0
        ? formatElevation(data.elevationGainMeters)
        : null;
    case "heartRate":
      return data.averageHeartrateBpm
        ? formatHeartRate(data.averageHeartrateBpm)
        : null;
    case "calories":
      return data.calories ? formatCalories(data.calories) : null;
  }
}

/** Fields that actually have data for this activity. */
export function availableFields(data: StickerData): StatField[] {
  const all: StatField[] = [
    "distance",
    "pace",
    "duration",
    "elevation",
    "heartRate",
    "calories",
  ];
  return all.filter((f) => formatStat(f, data) !== null);
}

/** "24m 10s", "1h 10m" — for prose contexts. */
export function formatDurationWords(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  if (m > 0) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  return `${s}s`;
}

const SPORT_VERBS: Record<string, { present: string; past: string }> = {
  Run: { present: "run", past: "RAN" },
  TrailRun: { present: "trail run", past: "RAN" },
  VirtualRun: { present: "run", past: "RAN" },
  Walk: { present: "walk", past: "WALKED" },
  Hike: { present: "hike", past: "HIKED" },
  Ride: { present: "ride", past: "RODE" },
  VirtualRide: { present: "ride", past: "RODE" },
  EBikeRide: { present: "ride", past: "RODE" },
  GravelRide: { present: "ride", past: "RODE" },
  MountainBikeRide: { present: "ride", past: "RODE" },
  Swim: { present: "swim", past: "SWAM" },
  OpenWaterSwim: { present: "swim", past: "SWAM" },
};

/** Verb forms for prose/labels; falls back to the sport name itself. */
export function sportVerb(sportType: string): {
  present: string;
  past: string;
} {
  return (
    SPORT_VERBS[sportType] ?? {
      present: formatSportType(sportType).toLowerCase(),
      past: "LOGGED",
    }
  );
}

/** "5:14 PM" local-ish start time for receipt rows. */
export function formatClockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatActivityDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "Run" → "Run", "VirtualRide" → "Virtual Ride" */
export function formatSportType(sportType: string): string {
  return sportType.replace(/([a-z])([A-Z])/g, "$1 $2");
}
