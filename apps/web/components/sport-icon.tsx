const RUN_SPORTS = new Set(["Run", "TrailRun", "VirtualRun", "Walk", "Hike"]);
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
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (RUN_SPORTS.has(sportType)) {
    return (
      <svg {...common}>
        <circle cx="14.5" cy="4.5" r="1.8" />
        <path d="M4 20l4.5-3 1.2-4.2M13 8.5l-2.8 1L9 13.8l4 2.7 1.5 4M13 8.5l3 2 3.5.5" />
      </svg>
    );
  }
  if (RIDE_SPORTS.has(sportType)) {
    return (
      <svg {...common}>
        <circle cx="6" cy="16.5" r="3.6" />
        <circle cx="18" cy="16.5" r="3.6" />
        <path d="M6 16.5L10 9h6l2 7.5M10 9L8.5 5.5h3" />
      </svg>
    );
  }
  if (SWIM_SPORTS.has(sportType)) {
    return (
      <svg {...common}>
        <path d="M2 18c1.7 1.3 3.3 1.3 5 0s3.3-1.3 5 0 3.3 1.3 5 0 3.3-1.3 5 0" />
        <circle cx="16" cy="7" r="1.8" />
        <path d="M4 13l6-4 3 2.5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <circle cx="12" cy="12" r="4.5" />
    </svg>
  );
}
