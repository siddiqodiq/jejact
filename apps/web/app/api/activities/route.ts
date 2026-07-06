import { NextResponse, type NextRequest } from "next/server";
import type { ActivitiesResponse } from "@repo/types";
import { getSession } from "../../../lib/server/session";
import { fromStravaError, unauthorized } from "../../../lib/server/responses";
import {
  fetchRecentActivities,
  toActivityDto,
} from "../../../lib/server/strava";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  const page = Number(request.nextUrl.searchParams.get("page") ?? "1") || 1;

  try {
    const activities = await fetchRecentActivities(session.accessToken, page);
    return NextResponse.json<ActivitiesResponse>({
      activities: activities.map(toActivityDto),
    });
  } catch (error) {
    return fromStravaError(error);
  }
}
