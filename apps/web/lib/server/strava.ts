import "server-only";
import {
  stravaActivityListSchema,
  stravaActivitySchema,
  stravaTokenResponseSchema,
  type StravaActivity,
  type StravaTokenResponse,
} from "@repo/validation";
import type { ActivityDto } from "@repo/types";
import { getEnv } from "./env";

export const STRAVA_AUTHORIZE_URL = "https://www.strava.com/oauth/authorize";
export const STRAVA_OAUTH_SCOPE = "read,activity:read_all";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_DEAUTHORIZE_URL = "https://www.strava.com/oauth/deauthorize";
const STRAVA_API_BASE = "https://www.strava.com/api/v3";

/** Recent activities fetched per page. */
export const ACTIVITIES_PER_PAGE = 50;

export class StravaApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "StravaApiError";
  }
}

export function exchangeCode(code: string): Promise<StravaTokenResponse> {
  return tokenRequest({ grant_type: "authorization_code", code });
}

export function refreshAccessToken(
  refreshToken: string,
): Promise<StravaTokenResponse> {
  return tokenRequest({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

export async function fetchRecentActivities(
  accessToken: string,
  page = 1,
): Promise<StravaActivity[]> {
  const url = `${STRAVA_API_BASE}/athlete/activities?per_page=${ACTIVITIES_PER_PAGE}&page=${page}`;
  const json = await apiRequest(url, accessToken);
  return stravaActivityListSchema.parse(json);
}

/** Detailed activity — includes calories, unlike the summary list. */
export async function fetchActivityDetail(
  accessToken: string,
  activityId: string,
): Promise<StravaActivity> {
  const url = `${STRAVA_API_BASE}/activities/${encodeURIComponent(activityId)}`;
  const json = await apiRequest(url, accessToken);
  return stravaActivitySchema.parse(json);
}

/** Best-effort token revocation when the user disconnects. */
export async function deauthorize(accessToken: string): Promise<void> {
  try {
    await fetch(
      `${STRAVA_DEAUTHORIZE_URL}?access_token=${encodeURIComponent(accessToken)}`,
      { method: "POST" },
    );
  } catch {
    // revocation is best-effort; the session cookie is cleared regardless
  }
}

export function toActivityDto(activity: StravaActivity): ActivityDto {
  return {
    id: String(activity.id),
    name: activity.name,
    sportType: activity.sport_type,
    startDate: activity.start_date,
    distanceMeters: activity.distance,
    movingTimeSeconds: activity.moving_time,
    elapsedTimeSeconds: activity.elapsed_time,
    elevationGainMeters: activity.total_elevation_gain,
    averageSpeedMps: activity.average_speed ?? null,
    averageHeartrateBpm: activity.average_heartrate ?? null,
    calories: activity.calories ?? null,
    mapPolyline:
      activity.map?.summary_polyline ?? activity.map?.polyline ?? null,
    splits:
      activity.splits_metric?.map((s) => ({
        distanceMeters: s.distance,
        movingTimeSeconds: s.moving_time,
      })) ?? null,
  };
}

async function apiRequest(url: string, accessToken: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new StravaApiError(
      response.status,
      response.status === 429
        ? "Strava rate limit reached — try again in a few minutes"
        : `Strava API responded with ${response.status}`,
    );
  }
  return response.json();
}

async function tokenRequest(
  params: Record<string, string>,
): Promise<StravaTokenResponse> {
  const env = getEnv();
  const body = new URLSearchParams({
    client_id: env.STRAVA_CLIENT_ID,
    client_secret: env.STRAVA_CLIENT_SECRET,
    ...params,
  });
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    body,
    cache: "no-store",
  });
  if (!response.ok) {
    throw new StravaApiError(
      response.status,
      `Strava token endpoint responded with ${response.status}`,
    );
  }
  return stravaTokenResponseSchema.parse(await response.json());
}
