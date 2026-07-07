import { NextResponse } from "next/server";
import { getSession } from "../../../lib/server/session";
import { jsonError, unauthorized, fromStravaError } from "../../../lib/server/responses";
import { getLastSyncedAt } from "@repo/database";
import { syncRecentActivities } from "../../../lib/server/sync";

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export async function POST() {
  const session = await getSession();
  if (!session) return unauthorized();

  try {
    const lastSynced = await getLastSyncedAt(session.athlete.id);
    
    if (lastSynced) {
      const msSinceSync = Date.now() - new Date(lastSynced).getTime();
      if (msSinceSync < COOLDOWN_MS) {
        return jsonError(429, "Sync is on cooldown. Please wait a few minutes.");
      }
    }

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
