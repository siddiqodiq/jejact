# Jejact

Turn your Strava activities into clean, transparent stickers for Instagram Stories.

Connect Strava → pick an activity → choose a template → toggle stats → copy or download a transparent PNG.

## How it works (no database)

Jejact is a single Next.js app, deployable straight to Vercel:

- **Auth**: Strava OAuth. Tokens are sealed with AES-256-GCM into an httpOnly cookie — nothing is stored server-side.
- **Activities**: read live from the Strava API through Next.js Route Handlers (`/api/activities`, `/api/activities/[id]` for calories via [getActivityById](https://developers.strava.com/docs/reference/#api-Activities-getActivityById)).
- **Stickers**: rendered entirely client-side on an HTML canvas from JSON templates, exported as transparent PNG (copy / download / share).

## Structure

```
apps/web                  # Next.js 16 (App Router) + Tailwind v4 — UI + API routes
packages/sticker-engine   # template model, stat formatting, canvas renderer, PNG export
packages/types            # shared DTO types
packages/validation       # Zod schemas for Strava responses
```

## Getting started

```sh
pnpm install
cp .env.example .env      # fill in Strava credentials
pnpm dev                  # http://localhost:3000
```

### Strava credentials

Create an API application at <https://www.strava.com/settings/api>:

- **Authorization Callback Domain**: `localhost` (dev) or your Vercel domain (prod)
- Copy the Client ID / Client Secret into `.env`

## Deploying to Vercel

1. Import the repo in Vercel; set **Root Directory** to `apps/web` (or keep the repo root — Vercel detects Turborepo).
2. Add environment variables: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `SESSION_SECRET`.
3. Update your Strava app's Authorization Callback Domain to the Vercel domain.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Run the web app in dev mode |
| `pnpm build` | Production build |
| `pnpm lint` / `pnpm check-types` | Lint / typecheck the whole repo |
