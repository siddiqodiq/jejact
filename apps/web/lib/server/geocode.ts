import "server-only";

/** Decodes just the first coordinate of a Strava-encoded polyline. */
function firstPoint(polyline: string): { lat: number; lng: number } | null {
  let index = 0;
  const next = (): number => {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = polyline.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    return result & 1 ? ~(result >> 1) : result >> 1;
  };
  const lat = next() / 1e5;
  const lng = next() / 1e5;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

interface NominatimAddress {
  city?: string;
  city_district?: string;
  municipality?: string;
  town?: string;
  village?: string;
  county?: string;
  state_district?: string;
  state?: string;
}

/**
 * City-level name for the activity's start point, via OSM Nominatim
 * (fair-use: we call this once per activity and cache it in the DB).
 * Returns "" when the activity has no route, null when the lookup failed
 * (so it can be retried later).
 */
export async function reverseGeocodeStart(
  polyline: string | null,
): Promise<string | null> {
  if (!polyline) return "";
  const point = firstPoint(polyline);
  if (!point) return "";

  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
      `&lat=${point.lat}&lon=${point.lng}&zoom=12&accept-language=id`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Jejact/1.0 (Strava sticker app)" },
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const json = (await response.json()) as { address?: NominatimAddress };
    const a = json.address;
    if (!a) return "";
    return (
      a.city ??
      a.city_district ??
      a.municipality ??
      a.town ??
      a.village ??
      a.county ??
      a.state_district ??
      a.state ??
      ""
    );
  } catch {
    return null;
  }
}
