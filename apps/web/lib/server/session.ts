import "server-only";
import { cookies } from "next/headers";
import type { SessionUser } from "@repo/types";
import { seal, unseal, encryptString } from "./crypto";
import { refreshAccessToken } from "./strava";

export const SESSION_COOKIE = "jejact_session";
export const OAUTH_STATE_COOKIE = "jejact_oauth_state";

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
/** Refresh the Strava token when it expires within this window. */
const REFRESH_MARGIN_SECONDS = 5 * 60;

/** Everything Jejact knows about a user — lives only in the sealed cookie. */
export interface SessionData {
  accessToken: string;
  refreshToken: string;
  /** Unix seconds. */
  expiresAt: number;
  athlete: SessionUser;
}

export function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function writeSession(session: SessionData): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, seal(session), cookieOptions(SESSION_TTL_SECONDS));
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Reads the session and transparently refreshes the Strava access token
 * when it is about to expire (persisting the rotated tokens back into the
 * cookie — allowed in Route Handlers). Returns null when signed out or
 * when the refresh is rejected (access revoked on Strava's side).
 */
export async function getSession(): Promise<SessionData | null> {
  const store = await cookies();
  const sealed = store.get(SESSION_COOKIE)?.value;
  if (!sealed) return null;
  const session = unseal<SessionData>(sealed);
  if (!session) return null;

  const secondsLeft = session.expiresAt - Date.now() / 1000;
  if (secondsLeft > REFRESH_MARGIN_SECONDS) return session;

  try {
    const refreshed = await refreshAccessToken(session.refreshToken);
    const next: SessionData = {
      ...session,
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token,
      expiresAt: refreshed.expires_at,
    };
    await writeSession(next);
    
    // Also update tokens in database if available
    try {
      const { updateUserTokens } = await import("@repo/database");
      await updateUserTokens(
        session.athlete.id,
        encryptString(next.accessToken),
        encryptString(next.refreshToken),
        next.expiresAt,
      );
    } catch {
      // Ignore DB errors during background refresh, the cookie is updated anyway
    }
    
    return next;
  } catch {
    await clearSession();
    return null;
  }
}
