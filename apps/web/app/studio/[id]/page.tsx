"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ActivityDto, StatField } from "@repo/types";
import {
  availableFields,
  BUILT_IN_TEMPLATES,
  canCopyImages,
  canvasToPngBlob,
  copyPngToClipboard,
  downloadBlob,
  formatActivityDate,
  formatSportType,
  formatStat,
  shareSticker,
  splitsAvailable,
  templateUsesRoute,
  templateUsesSplits,
  type StickerData,
} from "@repo/sticker-engine";
import { api, ApiError } from "../../../lib/api";
import { useSessionUser } from "../../../lib/use-session-user";
import { StickerCanvas } from "../../../components/sticker-canvas";
import { Skeleton } from "../../../components/ui/skeleton";
import { Button } from "../../../components/ui/button";
import { Logo } from "../../../components/logo";

const TEXT_COLORS = [
  { value: "#ffffff", name: "White" },
  { value: "#1d1d1f", name: "Black" },
  { value: "#e8532f", name: "Ember" },
  { value: "#ffd60a", name: "Sun" },
  { value: "#8affc1", name: "Mint" },
];

const DEFAULT_FIELDS: StatField[] = ["distance", "pace", "duration"];

const FIELD_LABELS: Record<StatField, string> = {
  distance: "Distance",
  pace: "Pace",
  duration: "Duration",
  elevation: "Elevation",
  heartRate: "Heart Rate",
  calories: "Calories",
};

export default function StudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [activity, setActivity] = useState<ActivityDto | null>(null);
  const user = useSessionUser();
  const [error, setError] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState(
    BUILT_IN_TEMPLATES[0]?.id ?? "",
  );
  const [fields, setFields] = useState<StatField[]>(DEFAULT_FIELDS);
  const [textColor, setTextColor] = useState("#ffffff");
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    api
      .activity(id)
      .then((data) => {
        setActivity(data);
        const usable = availableFields(toStickerData(data));
        setFields(DEFAULT_FIELDS.filter((f) => usable.includes(f)));
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.unauthorized) {
          router.replace("/");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load");
      });
  }, [id, router]);

  const data = useMemo(
    () => (activity ? toStickerData(activity) : null),
    [activity],
  );
  const usableFields = useMemo(
    () => (data ? availableFields(data) : []),
    [data],
  );
  // Route/splits templates only make sense when the activity has the data.
  const templates = useMemo(() => {
    if (!data) return BUILT_IN_TEMPLATES;
    const hasSplits = splitsAvailable(data);
    return BUILT_IN_TEMPLATES.filter(
      (t) =>
        (data.mapPolyline || !templateUsesRoute(t)) &&
        (hasSplits || !templateUsesSplits(t)),
    );
  }, [data]);
  const template = useMemo(
    () => templates.find((t) => t.id === templateId) ?? templates[0],
    [templates, templateId],
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const exportBlob = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Sticker not ready yet");
    return canvasToPngBlob(canvas);
  }, []);

  const handleCopy = useCallback(async () => {
    setBusy(true);
    try {
      await copyPngToClipboard(exportBlob);
      showToast("Sticker copied — paste it in Instagram");
    } catch {
      showToast("Copy failed — try Download instead");
    } finally {
      setBusy(false);
    }
  }, [exportBlob, showToast]);

  const handleDownload = useCallback(async () => {
    setBusy(true);
    try {
      const blob = await exportBlob();
      const slug =
        activity?.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") ?? "sticker";
      downloadBlob(blob, `jejact-${slug}.png`);
      showToast("Saved as transparent PNG");
    } catch {
      showToast("Export failed");
    } finally {
      setBusy(false);
    }
  }, [activity, exportBlob, showToast]);

  const handleShare = useCallback(async () => {
    try {
      await shareSticker(await exportBlob(), activity?.name ?? "Jejact");
    } catch {
      // user cancelled or unsupported — no toast needed
    }
  }, [activity, exportBlob]);

  const canShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  if (error) {
    return (
      <Shell>
        <div className="mx-auto mt-16 max-w-sm rounded-3xl border border-hairline bg-surface px-6 py-14 text-center">
          <h1 className="text-lg font-semibold">Activity unavailable</h1>
          <p className="mt-2 text-sm text-ink-secondary">{error}</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block text-sm font-medium text-accent"
          >
            ← Back to activities
          </Link>
        </div>
      </Shell>
    );
  }

  if (!activity || !data || !template) {
    return (
      <Shell>
        <div className="mx-auto max-w-4xl space-y-4 px-5 py-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="aspect-[2/1] rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <main className="mx-auto max-w-4xl px-5 pb-28 pt-6 lg:pb-10">
        {/* Activity header */}
        <div className="mb-5">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
          >
            ← Activities
          </Link>
          <h1 className="mt-2 truncate text-2xl font-bold tracking-tight">
            {activity.name}
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {formatSportType(activity.sportType)} ·{" "}
            {formatActivityDate(activity.startDate)}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Preview */}
          <section className="transparency-grid flex min-h-[320px] items-center justify-center rounded-3xl border border-hairline p-6 sm:p-10">
            <StickerCanvas
              template={template}
              data={data}
              fields={fields}
              textColor={textColor}
              avatarUrl={user?.avatarUrl ? "/api/avatar" : null}
              canvasRef={(c) => {
                canvasRef.current = c;
              }}
              className="max-h-[420px] w-auto drop-shadow-md"
            />
          </section>

          {/* Controls */}
          <section className="space-y-6">
            <div>
              <ControlLabel>Template</ControlLabel>
              <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplateId(t.id)}
                    className={`shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all ${
                      t.id === template.id
                        ? "border-ink bg-surface text-ink"
                        : "border-hairline bg-surface text-ink-secondary hover:text-ink"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <ControlLabel>Stats</ControlLabel>
              <div className="flex flex-wrap gap-2">
                {usableFields.map((field) => {
                  const active = fields.includes(field);
                  const preview = formatStat(field, data);
                  return (
                    <button
                      key={field}
                      onClick={() =>
                        setFields((prev) =>
                          active
                            ? prev.filter((f) => f !== field)
                            : [...usableFields.filter(
                                (f) => prev.includes(f) || f === field,
                              )],
                        )
                      }
                      aria-pressed={active}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                        active
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-hairline bg-surface text-ink-secondary hover:text-ink"
                      }`}
                    >
                      {FIELD_LABELS[field]}
                      {preview ? (
                        <span className="ml-1.5 opacity-60">
                          {preview.value}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={template.fixedPalette ? "hidden" : undefined}>
              <ControlLabel>Text color</ControlLabel>
              <div className="flex gap-2.5">
                {TEXT_COLORS.map(({ value, name }) => (
                  <button
                    key={value}
                    onClick={() => setTextColor(value)}
                    aria-label={name}
                    title={name}
                    className={`size-9 rounded-full border-2 transition-transform active:scale-90 ${
                      textColor === value
                        ? "border-ink scale-110"
                        : "border-hairline"
                    }`}
                    style={{ backgroundColor: value }}
                  />
                ))}
              </div>
            </div>

            {/* Desktop actions */}
            <div className="hidden flex-col gap-2.5 lg:flex">
              <Actions
                busy={busy}
                canCopy={canCopyImages()}
                canShare={canShare}
                onCopy={() => void handleCopy()}
                onDownload={() => void handleDownload()}
                onShare={() => void handleShare()}
              />
            </div>
          </section>
        </div>
      </main>

      {/* Mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-canvas p-4 lg:hidden">
        <div className="mx-auto flex max-w-md gap-2.5">
          <Actions
            busy={busy}
            canCopy={canCopyImages()}
            canShare={canShare}
            onCopy={() => void handleCopy()}
            onDownload={() => void handleDownload()}
            onShare={() => void handleShare()}
          />
        </div>
      </div>

      {/* Toast */}
      <div
        aria-live="polite"
        className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas shadow-lg transition-all duration-300 lg:bottom-8 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {toast}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-hairline bg-canvas">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5">
          <Logo href="/dashboard" />
          <span className="text-sm font-medium text-ink-secondary">
            Sticker Studio
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}

function ControlLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[13px] font-semibold uppercase tracking-wide text-ink-faint">
      {children}
    </p>
  );
}

function Actions({
  busy,
  canCopy,
  canShare,
  onCopy,
  onDownload,
  onShare,
}: {
  busy: boolean;
  canCopy: boolean;
  canShare: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onShare: () => void;
}) {
  return (
    <>
      {canCopy ? (
        <Button onClick={onCopy} disabled={busy} className="flex-1">
          Copy Sticker
        </Button>
      ) : null}
      <Button
        variant={canCopy ? "secondary" : "primary"}
        onClick={onDownload}
        disabled={busy}
        className="flex-1"
      >
        Download PNG
      </Button>
      {canShare ? (
        <Button variant="secondary" onClick={onShare} disabled={busy}>
          Share
        </Button>
      ) : null}
    </>
  );
}

function toStickerData(activity: ActivityDto): StickerData {
  return {
    name: activity.name,
    sportType: activity.sportType,
    startDate: activity.startDate,
    distanceMeters: activity.distanceMeters,
    movingTimeSeconds: activity.movingTimeSeconds,
    elapsedTimeSeconds: activity.elapsedTimeSeconds,
    elevationGainMeters: activity.elevationGainMeters,
    averageSpeedMps: activity.averageSpeedMps,
    averageHeartrateBpm: activity.averageHeartrateBpm,
    calories: activity.calories,
    mapPolyline: activity.mapPolyline,
    splits: activity.splits,
    location: activity.location,
  };
}
