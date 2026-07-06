import { Logo } from "../components/logo";
import { HeroSticker } from "../components/hero-sticker";

const OAUTH_ERRORS: Record<string, string> = {
  strava_denied: "Strava access was declined. Connect to continue.",
  oauth_state: "The sign-in attempt expired. Please try again.",
  oauth_failed: "Something went wrong signing in with Strava. Try again.",
};

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? OAUTH_ERRORS[error] : undefined;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="glass sticky top-0 z-40 border-b border-hairline">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Logo />
          <a
            href="/api/auth/strava"
            className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Connect Strava
          </a>
        </div>
      </header>

      <main className="flex-1">
        {errorMessage ? (
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-hairline bg-surface px-5 py-3 text-center text-sm text-ink-secondary">
            {errorMessage}
          </div>
        ) : null}

        {/* Hero */}
        <section className="mx-auto grid max-w-5xl items-center gap-14 px-6 pb-20 pt-16 sm:pt-24 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-block rounded-full bg-accent-soft px-3.5 py-1 text-[13px] font-semibold text-accent">
              For your Instagram Story
            </p>
            <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Your run,
              <br />
              as a sticker.
            </h1>
            <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-ink-secondary">
              Jejact turns your Strava stats into clean, transparent stickers.
              Pick an activity, choose a look, copy, and paste it straight onto
              your Story.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/api/auth/strava"
                className="elevated inline-flex h-12 items-center rounded-full bg-accent px-7 text-[15px] font-medium text-white transition-all hover:bg-accent-hover active:scale-[0.98]"
              >
                Connect with Strava
              </a>
              <a
                href="/templates"
                className="text-[15px] font-medium text-ink-secondary transition-colors hover:text-ink"
              >
                Browse templates →
              </a>
            </div>
            <p className="mt-4 text-[13px] text-ink-faint">
              Free · No posting on your behalf · Read-only access
            </p>
          </div>
          <HeroSticker />
        </section>

        {/* How it works */}
        <section className="border-t border-hairline">
          <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Connect Strava",
                body: "One tap. Jejact only reads your activities — nothing is ever posted for you.",
              },
              {
                step: "02",
                title: "Pick an activity",
                body: "Your latest runs, rides and swims, ready the moment you finish them.",
              },
              {
                step: "03",
                title: "Copy the sticker",
                body: "Choose a template, toggle your stats, and export a crisp transparent PNG.",
              },
            ].map(({ step, title, body }) => (
              <div key={step}>
                <p className="text-sm font-semibold text-accent">{step}</p>
                <h3 className="mt-2 text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-secondary">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8 text-[13px] text-ink-faint">
          <span>© 2026 Jejact</span>
          <span>Powered by the Strava API</span>
        </div>
      </footer>
    </div>
  );
}
