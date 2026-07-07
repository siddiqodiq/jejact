import { Activity, Footprints, Bike, Waves, Dumbbell } from "lucide-react";

const RUN_SPORTS = new Set(["Run", "TrailRun", "VirtualRun"]);
const WALK_SPORTS = new Set(["Walk", "Hike"]);
const RIDE_SPORTS = new Set([
  "Ride",
  "VirtualRide",
  "EBikeRide",
  "GravelRide",
  "MountainBikeRide",
]);
const SWIM_SPORTS = new Set(["Swim", "OpenWaterSwim"]);

export function SportIcon({
  sportType,
  className = "size-5",
}: {
  sportType: string;
  className?: string;
}) {
  if (RUN_SPORTS.has(sportType)) {
    return <Activity className={className} />;
  }
  if (WALK_SPORTS.has(sportType)) {
    return <Footprints className={className} />;
  }
  if (RIDE_SPORTS.has(sportType)) {
    return <Bike className={className} />;
  }
  if (SWIM_SPORTS.has(sportType)) {
    return <Waves className={className} />;
  }
  return <Dumbbell className={className} />;
}

