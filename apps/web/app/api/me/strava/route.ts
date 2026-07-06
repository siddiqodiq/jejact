import { NextResponse } from "next/server";
import { clearSession, getSession } from "../../../../lib/server/session";
import { deauthorize } from "../../../../lib/server/strava";

/** Disconnect: revoke the Strava grant and clear the session cookie. */
export async function DELETE() {
  const session = await getSession();
  if (session) await deauthorize(session.accessToken);
  await clearSession();
  return NextResponse.json({ ok: true });
}
