import { NextResponse } from "next/server";
import { getSession } from "../../../lib/server/session";
import { jsonError, unauthorized } from "../../../lib/server/responses";

/**
 * Proxies the athlete's Strava avatar so the sticker canvas can draw it
 * without being tainted by a cross-origin image (Strava's CDN sends no
 * CORS headers, which would break canvas.toBlob for export).
 */
export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const url = session.athlete.avatarUrl;
  if (!url) return jsonError(404, "No avatar on this Strava profile");
  // Older sessions/DB rows stored the medium rendition — upgrade to large.
  const largeUrl = url.replace(/\/medium(\.\w+)$/, "/large$1");

  try {
    let upstream = await fetch(largeUrl, { cache: "no-store" });
    if ((!upstream.ok || !upstream.body) && largeUrl !== url) {
      upstream = await fetch(url, { cache: "no-store" });
    }
    if (!upstream.ok || !upstream.body) {
      return jsonError(502, "Failed to load avatar from Strava");
    }
    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "image/jpeg",
        // Revalidate every load — a long max-age kept serving the old
        // medium rendition after the source URL was upgraded.
        "Cache-Control": "private, no-cache",
      },
    });
  } catch {
    return jsonError(502, "Failed to load avatar from Strava");
  }
}
