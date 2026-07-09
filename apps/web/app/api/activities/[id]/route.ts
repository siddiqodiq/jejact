import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "../../../../lib/server/session";
import {
  fromStravaError,
  jsonError,
  unauthorized,
} from "../../../../lib/server/responses";
import {
  fetchActivityDetail,
  toActivityDto,
} from "../../../../lib/server/strava";
import { reverseGeocodeStart } from "../../../../lib/server/geocode";
import { getActivity, updateActivityDetail } from "@repo/database";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  if (!/^\d+$/.test(id)) return jsonError(400, "Invalid activity id");

  try {
    const { activity, hasDetail } = await getActivity(session.athlete.id, id);

    // null splits/location mean the detail was cached before those fields
    // existed (or a lookup failed) — refetch once so the cache heals.
    if (
      activity &&
      hasDetail &&
      activity.splits !== null &&
      activity.location !== null
    ) {
      return NextResponse.json(activity);
    }

    // Detailed activity (developers.strava.com #api-Activities-getActivityById)
    // — includes calories and splits, which the summary list omits.
    const stravaActivity = await fetchActivityDetail(session.accessToken, id);
    const dto = toActivityDto(stravaActivity);
    // Distinguish "fetched, none" from "never fetched" in the cache.
    dto.splits ??= [];
    // Strava stopped populating its location fields years ago — fall back
    // to reverse-geocoding the route's start point ("" = known to have
    // none, null = lookup failed, retry on the next open).
    if (!dto.location) {
      dto.location = await reverseGeocodeStart(dto.mapPolyline);
    }

    // Update cache if the activity is already in the DB
    if (activity) {
      await updateActivityDetail(session.athlete.id, dto);
    }
    
    return NextResponse.json(dto);
  } catch (error) {
    return fromStravaError(error);
  }
}
