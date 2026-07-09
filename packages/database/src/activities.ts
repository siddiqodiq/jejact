import "server-only";
import { getSupabase } from "./client";
import type { ActivityDto, ActivitySplit } from "@repo/types";

// DB format matches the schema created in the plan
export interface DbActivity {
  id: string;
  user_id: string;
  name: string;
  sport_type: string;
  start_date: string;
  distance_meters: number;
  moving_time_seconds: number;
  elapsed_time_seconds: number;
  elevation_gain_meters: number;
  average_speed_mps: number | null;
  average_heartrate_bpm: number | null;
  location: string | null;
  calories: number | null;
  map_polyline: string | null;
  splits: ActivitySplit[] | null;
  has_detail: boolean;
}

export async function getActivities(userId: string): Promise<ActivityDto[]> {
  const { data, error } = await getSupabase()
    .from("activities")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false });

  if (error) {
    throw new Error(`Failed to get activities: ${error.message}`);
  }

  return (data || []).map(mapToDto);
}

export async function getActivity(userId: string, activityId: string): Promise<{ activity: ActivityDto | null; hasDetail: boolean }> {
  const { data, error } = await getSupabase()
    .from("activities")
    .select("*")
    .eq("id", activityId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return { activity: null, hasDetail: false };
  }

  return {
    activity: mapToDto(data),
    hasDetail: data.has_detail,
  };
}

export async function upsertActivities(userId: string, activities: ActivityDto[], hasDetail = false): Promise<void> {
  if (activities.length === 0) return;

  const rows = activities.map((a) => ({
    id: a.id,
    user_id: userId,
    name: a.name,
    sport_type: a.sportType,
    start_date: a.startDate,
    distance_meters: a.distanceMeters,
    moving_time_seconds: a.movingTimeSeconds,
    elapsed_time_seconds: a.elapsedTimeSeconds,
    elevation_gain_meters: a.elevationGainMeters,
    average_speed_mps: a.averageSpeedMps,
    average_heartrate_bpm: a.averageHeartrateBpm,
    location: a.location,
    calories: a.calories,
    map_polyline: a.mapPolyline,
    splits: a.splits,
    has_detail: hasDetail,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await getSupabase().from("activities").upsert(rows, { onConflict: 'id, user_id' });

  if (error) {
    throw new Error(`Failed to upsert activities: ${error.message}`);
  }
}

export async function updateActivityDetail(userId: string, activity: ActivityDto): Promise<void> {
  const { error } = await getSupabase()
    .from("activities")
    .update({
      calories: activity.calories,
      splits: activity.splits,
      location: activity.location,
      has_detail: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", activity.id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to update activity detail: ${error.message}`);
  }
}

function mapToDto(row: DbActivity): ActivityDto {
  return {
    id: row.id,
    name: row.name,
    sportType: row.sport_type,
    startDate: row.start_date,
    distanceMeters: row.distance_meters,
    movingTimeSeconds: row.moving_time_seconds,
    elapsedTimeSeconds: row.elapsed_time_seconds,
    elevationGainMeters: row.elevation_gain_meters,
    averageSpeedMps: row.average_speed_mps,
    averageHeartrateBpm: row.average_heartrate_bpm,
    location: row.location ?? null,
    calories: row.calories,
    mapPolyline: row.map_polyline,
    splits: row.splits ?? null,
  };
}
