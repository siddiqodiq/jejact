# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Jejact turns Strava activities into transparent PNG stickers for Instagram Stories. See `brief.md` for the original product brief. The architecture deliberately deviates from the brief's NestJS/Prisma stack: it is a **Next.js app**, designed to deploy straight to Vercel, now using **Supabase PostgreSQL** purely as a caching layer to minimize Strava API calls.

## Commands

```sh
pnpm dev            # dev server at http://localhost:3000 (turbo → apps/web)
pnpm build          # production build of everything
pnpm lint           # eslint across all workspaces (max-warnings 0)
pnpm check-types    # tsc --noEmit across all workspaces (web runs `next typegen` first)
```

There is no test suite. Requires a root `.env` (copy `.env.example`) with `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `SESSION_SECRET`; `apps/web/next.config.js` loads the root `.env` via `process.loadEnvFile`.

## Architecture

Turborepo + pnpm workspace. Shared packages export **TypeScript source directly** (`"exports": { ".": "./src/index.ts" }`, no build step); `next.config.js` lists them in `transpilePackages`.

- `apps/web` — the entire app (Next.js 16 App Router, Tailwind CSS v4).
- `packages/sticker-engine` — the core domain: template JSON model (`template.ts`), stat formatters (`format.ts`), a hand-rolled Canvas 2D renderer (`render.ts`, browser-only), built-in templates (`templates.ts`), PNG export/copy/share helpers (`export.ts`). No Konva — templates are absolutely positioned, with `statFlow` elements that reflow around whichever stats the user toggles on.
- `packages/types` — DTOs shared between route handlers and client (`ActivityDto`, `SessionUser`, `StatField`).
- `packages/validation` — Zod schemas for Strava API responses.
- `packages/ui`, `eslint-config`, `typescript-config` — starter leftovers/config; app components live in `apps/web/components`, not `@repo/ui`.
- `packages/database` — Encapsulates Supabase PostgreSQL access.

### Hybrid Auth & Caching (the key design decision)

There is **no heavy backend storage** for user-generated content, but we use Supabase to cache Strava data:
- `apps/web/lib/server/session.ts` — Strava access/refresh tokens + athlete profile are sealed into an httpOnly cookie (`jejact_session`). `getSession()` transparently refreshes the Strava token when it expires within 5 minutes, rewrites the cookie, and updates the database.
- Tokens are **also** stored in the `users` table in Supabase, encrypted using `SESSION_SECRET` via AES-256-GCM. This future-proofs the app for background syncs.
- `apps/web/lib/server/strava.ts` — Strava OAuth + API calls; `toActivityDto` normalizes snake_case Strava payloads.
- **Caching**: The dashboard reads from Supabase `activities` table. The Strava API is only called on initial login, when the user explicitly clicks "Sync", or when an activity detail (calories) is requested for the first time.
- API routes under `app/api/` return `ApiErrorBody` JSON on failure; the client wrapper (`lib/api.ts`) throws `ApiError`, and pages redirect to `/` on 401.

### Rendering flow

Pages are client components that fetch via `lib/api.ts`. `components/sticker-canvas.tsx` renders at full export resolution (1080-class) and CSS-scales down; it reads the page's computed `font-family` so canvas text matches the UI font (Geist, loaded via `next/font/local`), and re-renders after `document.fonts.ready`. Export = `canvas.toBlob` → copy uses a promise-valued `ClipboardItem` (required for Safari).

## Conventions

- Design tokens are CSS custom properties in `app/globals.css` mapped through Tailwind v4 `@theme inline` (`bg-canvas`, `text-ink`, `text-ink-secondary`, `bg-accent`, `border-hairline`...). Dark mode flips via `prefers-color-scheme` on the same variables — style with semantic tokens, not raw colors or `dark:` variants.
- UI is deliberately Apple-ish and minimal (rounded-3xl, glass header, one accent color). Avoid heavy gradients, card grids, and generic SaaS dashboard patterns — see the UI/UX section of `brief.md`.
- Strava tokens must never reach the client; anything importing `lib/server/*` stays server-side (enforced by `server-only`).
