"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ActivityDto } from "@repo/types";
import { api, ApiError } from "../../lib/api";
import { SiteHeader } from "../../components/site-header";
import { ActivityCard } from "../../components/activity-card";
import { Skeleton } from "../../components/ui/skeleton";
import { Button } from "../../components/ui/button";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; activities: ActivityDto[]; lastSyncedAt?: string | null };

export default function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const load = useCallback(
    async (refresh: boolean) => {
      try {
        if (refresh) setRefreshing(true);
        const data = await api.activities();
        setState({ status: "ready", activities: data.activities, lastSyncedAt: data.lastSyncedAt });
      } catch (error) {
        if (error instanceof ApiError && error.unauthorized) {
          router.replace("/");
          return;
        }
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Something went wrong",
        });
      } finally {
        if (refresh) setRefreshing(false);
      }
    },
    [router],
  );

  const handleSync = useCallback(async () => {
    setRefreshing(true);
    try {
      await api.sync();
      await load(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        showToast(error.message);
      } else {
        showToast("Sync failed");
      }
    } finally {
      setRefreshing(false);
    }
  }, [load, showToast]);

  useEffect(() => {
    void load(false);
  }, [load]);

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Recent activities
            </h1>
            <p className="mt-1 text-sm text-ink-secondary">
              Pick one to turn it into a sticker.
              {state.status === "ready" && state.lastSyncedAt && (
                <span className="ml-2 border-l border-hairline pl-2">
                  Last synced: {formatRelativeTime(state.lastSyncedAt)}
                </span>
              )}
            </p>
          </div>
          {state.status === "ready" ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void handleSync()}
              disabled={refreshing}
            >
              {refreshing ? "Syncing…" : "↻ Sync"}
            </Button>
          ) : null}
        </div>

        {state.status === "loading" ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[84px] rounded-3xl" />
            ))}
          </div>
        ) : null}

        {state.status === "error" ? (
          <EmptyState
            title="Couldn't load your activities"
            body={state.message}
            action={
              <Button variant="secondary" onClick={() => void load(false)}>
                Try again
              </Button>
            }
          />
        ) : null}

        {state.status === "ready" ? (
          state.activities.length === 0 ? (
            <EmptyState
              title="No activities yet"
              body="Record something on Strava and it will show up here."
              action={
                <Button variant="secondary" onClick={() => void load(true)}>
                  Check again
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {state.activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )
        ) : null}
      </main>
      {/* Toast */}
      <div
        aria-live="polite"
        className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas shadow-lg transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {toast}
      </div>
    </div>
  );
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes === 1) return "1 min ago";
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  return new Date(isoString).toLocaleDateString();
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-hairline bg-surface px-6 py-16 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-[15px] text-ink-secondary">
        {body}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
