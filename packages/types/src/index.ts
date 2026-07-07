/** Statistics a user can toggle on a sticker. */
export const STAT_FIELDS = [
  "distance",
  "pace",
  "duration",
  "elevation",
  "heartRate",
  "calories",
] as const;

export type StatField = (typeof STAT_FIELDS)[number];

/** Authenticated athlete as exposed to the frontend. */
export interface SessionUser {
  /** Strava athlete id (stringified). */
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

/** One metric (per-km) split of an activity. */
export interface ActivitySplit {
  distanceMeters: number;
  movingTimeSeconds: number;
}

/** Normalized Strava activity as exposed to the frontend. */
export interface ActivityDto {
  /** Strava activity id (stringified). */
  id: string;
  name: string;
  sportType: string;
  startDate: string; // ISO
  distanceMeters: number;
  movingTimeSeconds: number;
  elapsedTimeSeconds: number;
  elevationGainMeters: number;
  averageSpeedMps: number | null;
  averageHeartrateBpm: number | null;
  /** Only present after fetching the detailed activity. */
  calories: number | null;
  mapPolyline: string | null;
  /**
   * Per-km splits. Only present after fetching the detailed activity:
   * null = never fetched, [] = fetched but the activity has none.
   */
  splits: ActivitySplit[] | null;
}

export interface ActivitiesResponse {
  activities: ActivityDto[];
  lastSyncedAt?: string | null; // ISO
}

export interface ApiErrorBody {
  statusCode: number;
  message: string;
}

export interface SyncResponse {
  synced: number;
  lastSyncedAt: string; // ISO
}
