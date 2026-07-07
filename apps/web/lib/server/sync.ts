import "server-only";
import { fetchRecentActivities, toActivityDto } from "./strava";
import { upsertActivities, updateLastSyncedAt } from "@repo/database";

export async function syncRecentActivities(userId: string, accessToken: string) {
  const stravaActivities = await fetchRecentActivities(accessToken, 1);
  const dtos = stravaActivities.map(toActivityDto);
  
  await upsertActivities(userId, dtos, false);
  await updateLastSyncedAt(userId);
  
  return dtos.length;
}
