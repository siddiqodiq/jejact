"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ActivityDto, SessionUser } from "@repo/types";
import { api, ApiError } from "../../lib/api";
import { SiteHeader } from "../../components/site-header";
import { ActivityCard } from "../../components/activity-card";
import { Skeleton } from "../../components/ui/skeleton";
import { Button } from "../../components/ui/button";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; activities: ActivityDto[] };

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [state, setState] = useState<State>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (refresh: boolean) => {
      try {
        if (refresh) setRefreshing(true);
        const [me, data] = await Promise.all([api.me(), api.activities()]);
        setUser(me);
        setState({ status: "ready", activities: data.activities });
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
        setRefreshing(false);
      }
    },
    [router],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  return (
    <div className="min-h-dvh">
      <SiteHeader user={user} />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Recent activities
            </h1>
            <p className="mt-1 text-sm text-ink-secondary">
              Pick one to turn it into a sticker.
            </p>
          </div>
          {state.status === "ready" ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void load(true)}
              disabled={refreshing}
            >
              {refreshing ? "Syncing…" : "Refresh"}
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
    </div>
  );
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
    <div className="rounded-3xl bg-surface px-6 py-16 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-[15px] text-ink-secondary">
        {body}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
