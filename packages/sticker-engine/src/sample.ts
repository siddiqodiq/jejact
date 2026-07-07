import { encodePolyline, type LatLng } from "./polyline";
import type { StickerData } from "./template";

/** A believable park-loop route for previews. */
function sampleRoute(): string {
  const points: LatLng[] = [];
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    points.push({
      lat: -6.2146 + 0.0042 * Math.sin(t) + 0.0011 * Math.sin(3 * t + 0.8),
      lng: 106.8027 + 0.0061 * Math.cos(t) + 0.0014 * Math.cos(2 * t + 0.4),
    });
  }
  return encodePolyline(points);
}

/** Sample activity used on the landing page and template gallery. */
export const SAMPLE_ACTIVITY: StickerData = {
  name: "Sunday Long Run",
  sportType: "Run",
  startDate: "2026-07-05T06:12:00Z",
  distanceMeters: 12480,
  movingTimeSeconds: 4212,
  elapsedTimeSeconds: 4388,
  elevationGainMeters: 128,
  averageSpeedMps: 2.963,
  averageHeartrateBpm: 152,
  calories: 861,
  mapPolyline: sampleRoute(),
  splits: [
    352, 348, 341, 345, 338, 331, 334, 328, 330, 322, 318, 309,
  ]
    .map((seconds) => ({ distanceMeters: 1000, movingTimeSeconds: seconds }))
    .concat([{ distanceMeters: 480, movingTimeSeconds: 216 }]),
};
