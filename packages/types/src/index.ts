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
}

export interface ActivitiesResponse {
  activities: ActivityDto[];
}

export interface ApiErrorBody {
  statusCode: number;
  message: string;
}
