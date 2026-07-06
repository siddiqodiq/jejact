import Link from "next/link";
import type { ActivityDto } from "@repo/types";
import {
  formatActivityDate,
  formatDistance,
  formatDuration,
  formatPace,
  formatSportType,
} from "@repo/sticker-engine";
import { SportIcon } from "./sport-icon";

export function ActivityCard({ activity }: { activity: ActivityDto }) {
  const distance = formatDistance(activity.distanceMeters);
  const duration = formatDuration(activity.movingTimeSeconds);
  const pace = formatPace(activity);

  return (
    <Link
      href={`/studio/${activity.id}`}
      className="group flex items-center gap-4 rounded-3xl bg-surface p-4 transition-all duration-200 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 sm:p-5"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
        <SportIcon sportType={activity.sportType} className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{activity.name}</p>
        <p className="mt-0.5 text-sm text-ink-secondary">
          {formatSportType(activity.sportType)} ·{" "}
          {formatActivityDate(activity.startDate)}
        </p>
      </div>
      <div className="hidden shrink-0 items-baseline gap-5 text-right sm:flex">
        <Stat value={`${distance.value} ${distance.unit}`} label="Distance" />
        <Stat value={duration.value} label="Time" />
        <Stat value={`${pace.value} ${pace.unit}`} label={pace.label} />
      </div>
      <span
        aria-hidden
        className="ml-1 text-ink-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
      >
        →
      </span>
    </Link>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-[15px] font-semibold tabular-nums text-ink">{value}</p>
      <p className="text-xs text-ink-faint">{label}</p>
    </div>
  );
}
