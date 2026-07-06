import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getEnv } from "../../../../lib/server/env";
import {
  STRAVA_AUTHORIZE_URL,
  STRAVA_OAUTH_SCOPE,
} from "../../../../lib/server/strava";
import {
  cookieOptions,
  OAUTH_STATE_COOKIE,
} from "../../../../lib/server/session";

export async function GET(request: NextRequest) {
  const env = getEnv();
  const origin = env.APP_URL ?? request.nextUrl.origin;
  const state = randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    client_id: env.STRAVA_CLIENT_ID,
    response_type: "code",
    redirect_uri: `${origin}/api/auth/strava/callback`,
    approval_prompt: "auto",
    scope: STRAVA_OAUTH_SCOPE,
    state,
  });

  const response = NextResponse.redirect(`${STRAVA_AUTHORIZE_URL}?${params}`);
  response.cookies.set(OAUTH_STATE_COOKIE, state, cookieOptions(10 * 60));
  return response;
}
