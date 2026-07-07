import { NextResponse } from "next/server";
import type { ActivitiesResponse } from "@repo/types";
import { getSession } from "../../../lib/server/session";
import { fromStravaError, unauthorized } from "../../../lib/server/responses";
import { getActivities, getLastSyncedAt } from "@repo/database";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  try {
    const activities = await getActivities(session.athlete.id);
    const lastSyncedAt = await getLastSyncedAt(session.athlete.id);
    
    return NextResponse.json<ActivitiesResponse>({
      activities,
      lastSyncedAt,
    });
  } catch (error) {
    return fromStravaError(error);
  }
}
