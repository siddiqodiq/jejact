import { NextResponse } from "next/server";
import { getSession } from "../../../lib/server/session";
import { unauthorized, fromStravaError } from "../../../lib/server/responses";
import { getLastSyncedAt } from "@repo/database";
import { syncRecentActivities } from "../../../lib/server/sync";

export async function POST() {
  const session = await getSession();
  if (!session) return unauthorized();

  try {
    const count = await syncRecentActivities(session.athlete.id, session.accessToken);
    const newLastSynced = await getLastSyncedAt(session.athlete.id);
    
    return NextResponse.json({
      synced: count,
      lastSyncedAt: newLastSynced,
    });
  } catch (error) {
    return fromStravaError(error);
  }
}
