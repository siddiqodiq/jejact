import { NextResponse, type NextRequest } from "next/server";
import { getEnv } from "../../../../../lib/server/env";
import { exchangeCode } from "../../../../../lib/server/strava";
import {
  OAUTH_STATE_COOKIE,
  writeSession,
  type SessionData,
} from "../../../../../lib/server/session";

export async function GET(request: NextRequest) {
  const env = getEnv();
  const origin = env.APP_URL ?? request.nextUrl.origin;
  const query = request.nextUrl.searchParams;

  const fail = (reason: string) => {
    const response = NextResponse.redirect(`${origin}/?error=${reason}`);
    response.cookies.delete(OAUTH_STATE_COOKIE);
    return response;
  };

  if (query.get("error")) return fail("strava_denied");

  const code = query.get("code");
  const state = query.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (!code || !state || !expectedState || state !== expectedState) {
    return fail("oauth_state");
  }

  try {
    const token = await exchangeCode(code);
    const athlete = token.athlete;
    if (!athlete) return fail("oauth_failed");

    const session: SessionData = {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: token.expires_at,
      athlete: {
        id: String(athlete.id),
        firstName: athlete.firstname ?? "",
        lastName: athlete.lastname ?? "",
        // `profile` is the large rendition — crisper on 1080px stickers.
        avatarUrl: athlete.profile ?? athlete.profile_medium ?? null,
      },
    };
    await writeSession(session);

    try {
      const { upsertUser } = await import("@repo/database");
      const { encryptString } = await import("../../../../../lib/server/crypto");
      const { syncRecentActivities } = await import("../../../../../lib/server/sync");
      
      await upsertUser({
        id: session.athlete.id,
        firstName: session.athlete.firstName,
        lastName: session.athlete.lastName,
        avatarUrl: session.athlete.avatarUrl,
        encryptedAccessToken: encryptString(session.accessToken),
        encryptedRefreshToken: encryptString(session.refreshToken),
        tokenExpiresAt: session.expiresAt,
      });

      await syncRecentActivities(session.athlete.id, session.accessToken);
    } catch (e) {
      console.error("Failed to sync on login", e);
    }

    const response = NextResponse.redirect(`${origin}/dashboard`);
    response.cookies.delete(OAUTH_STATE_COOKIE);
    return response;
  } catch {
    return fail("oauth_failed");
  }
}
