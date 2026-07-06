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
        avatarUrl: athlete.profile_medium ?? athlete.profile ?? null,
      },
    };
    await writeSession(session);

    const response = NextResponse.redirect(`${origin}/dashboard`);
    response.cookies.delete(OAUTH_STATE_COOKIE);
    return response;
  } catch {
    return fail("oauth_failed");
  }
}
