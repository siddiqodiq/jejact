"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@repo/types";
import { api, ApiError } from "../../lib/api";
import { SiteHeader } from "../../components/site-header";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .me()
      .then(setUser)
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.unauthorized) {
          router.replace("/");
        }
      });
  }, [router]);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await api.logout();
      router.replace("/");
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    if (
      !window.confirm(
        "Disconnect Strava? This revokes Jejact's access and signs you out.",
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      await api.disconnectStrava();
      router.replace("/");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh">
      <SiteHeader user={user} />
      <main className="mx-auto max-w-xl px-5 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

        {!user ? (
          <div className="mt-6 space-y-3">
            <Skeleton className="h-20 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {/* Profile */}
            <section className="flex items-center gap-4 rounded-3xl bg-surface p-5">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- external Strava avatar host
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="size-14 rounded-full border border-hairline object-cover"
                />
              ) : (
                <div className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-lg font-semibold text-accent">
                  {user.firstName.charAt(0) || "?"}
                </div>
              )}
              <div>
                <p className="font-semibold">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-ink-secondary">
                  Signed in with Strava
                </p>
              </div>
            </section>

            {/* Privacy */}
            <section className="rounded-3xl bg-surface p-5">
              <h2 className="font-semibold">Your data</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
                Jejact stores nothing on a server. Your Strava tokens live in
                an encrypted cookie in this browser, and activities are read
                from Strava only when you open them. Stickers are rendered on
                your device.
              </p>
            </section>

            {/* Session */}
            <section className="rounded-3xl bg-surface p-5">
              <h2 className="font-semibold">Session</h2>
              <p className="mt-1 text-sm text-ink-secondary">
                Log out keeps Jejact authorized on Strava; Disconnect also
                revokes access to your Strava account.
              </p>
              <div className="mt-4 flex gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void handleLogout()}
                  disabled={busy}
                >
                  Log out
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => void handleDisconnect()}
                  disabled={busy}
                >
                  Disconnect Strava
                </Button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
