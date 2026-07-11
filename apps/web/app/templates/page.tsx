"use client";

import Link from "next/link";
import { BUILT_IN_TEMPLATES, SAMPLE_ACTIVITY } from "@repo/sticker-engine";
import { useSessionUser } from "../../lib/use-session-user";
import { SiteHeader } from "../../components/site-header";
import { StickerCanvas } from "../../components/sticker-canvas";

export default function TemplatesPage() {
  const user = useSessionUser();

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Template gallery</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Every template, previewed with a sample run. Pick one in the Studio.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BUILT_IN_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="overflow-hidden rounded-3xl border border-hairline bg-surface"
            >
              <div className="story-backdrop flex aspect-[4/3] items-center justify-center p-6">
                <StickerCanvas
                  template={template}
                  data={SAMPLE_ACTIVITY}
                  fields={["distance", "pace", "duration", "elevation"]}
                  textColor="#ffffff"
                  className="max-h-full drop-shadow"
                />
              </div>
              <div className="p-4">
                <h2 className="font-semibold">{template.name}</h2>
                <p className="mt-0.5 text-sm text-ink-secondary">
                  {template.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={user ? "/dashboard" : "/api/auth/strava"}
            className="text-[15px] font-medium text-accent"
          >
            {user ? "Choose an activity →" : "Connect Strava to use them →"}
          </Link>
        </div>
      </main>
    </div>
  );
}
