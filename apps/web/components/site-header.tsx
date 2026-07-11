"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSessionUser } from "../lib/use-session-user";
import { Logo } from "./logo";

const links = [
  { href: "/dashboard", label: "Activities" },
  { href: "/templates", label: "Templates" },
  { href: "/settings", label: "Settings" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const user = useSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-5">
        <Logo href={user ? "/dashboard" : "/"} />

        {/* undefined = session still loading: render nothing instead of
            flashing the logged-out CTA on every navigation. */}
        {user === undefined ? null : user ? (
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {/* macOS-style segmented tabs */}
            <nav className="flex items-center rounded-xl bg-hairline/60 p-1">
              {links.map(({ href, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`rounded-lg px-2.5 py-1 text-[13px] font-medium transition-colors sm:px-3.5 sm:text-sm ${
                      active
                        ? "bg-surface text-ink shadow-sm"
                        : "text-ink-secondary hover:text-ink"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- external Strava avatar host
              <img
                src={user.avatarUrl}
                alt={user.firstName}
                className="hidden size-8 shrink-0 rounded-full border border-hairline object-cover min-[400px]:block"
              />
            ) : null}
          </div>
        ) : (
          <a
            href="/api/auth/strava"
            className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-canvas transition-opacity hover:opacity-85"
          >
            Connect Strava
          </a>
        )}
      </div>
    </header>
  );
}
