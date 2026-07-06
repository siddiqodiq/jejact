"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@repo/types";
import { Logo } from "./logo";

const links = [
  { href: "/dashboard", label: "Activities" },
  { href: "/templates", label: "Templates" },
  { href: "/settings", label: "Settings" },
];

export function SiteHeader({ user }: { user?: SessionUser | null }) {
  const pathname = usePathname();
  return (
    <header className="glass sticky top-0 z-40 border-b border-hairline">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Logo href={user ? "/dashboard" : "/"} />
        {user ? (
          <nav className="flex items-center gap-1 sm:gap-2">
            {links.map(({ href, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-accent-soft text-accent"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- external Strava avatar host
              <img
                src={user.avatarUrl}
                alt={user.firstName}
                className="ml-1 size-8 rounded-full border border-hairline object-cover"
              />
            ) : null}
          </nav>
        ) : (
          <a
            href="/api/auth/strava"
            className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Connect Strava
          </a>
        )}
      </div>
    </header>
  );
}
