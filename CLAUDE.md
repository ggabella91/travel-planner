@AGENTS.md

# Travel Planner — Project Guide

## What This Is

A personal travel planning tool. Single user, Google Sign-In auth. Two core flows:
1. **Places backlog** — save and tag places by city/country
2. **Active trip** — pull backlog places into a flexible itinerary

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Database**: Supabase (Postgres) via Drizzle ORM + `postgres` driver
- **UI**: shadcn/ui components (in `src/components/ui/`) + Tailwind CSS v4
- **Auth**: Auth.js v5 (next-auth@beta) with Google provider
- **Deployment**: Vercel

## Conventions

- **API routes only** — use `/app/api/*/route.ts`. No Server Actions, with one exception: the login page uses a Server Action to call `signIn("google")` — this is required by Auth.js.
- **IDs**: use `crypto.randomUUID()` for all new record IDs.
- **Env**: secrets live in `.env.local`. DB scripts use `--env-file=.env.local` to load it (see `package.json`). Required vars: `DATABASE_URL`, `UNSPLASH_ACCESS_KEY`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ALLOWED_EMAIL`.
- **Git commits**: all lowercase, one-line, no co-authored trailer. Example: `feat: add place detail sheet`.
- **Modular architecture** — hooks, components, and utilities live in feature-scoped subfolders, e.g. `src/app/trips/hooks/`, `src/app/trips/components/`. Do not create top-level `src/hooks/` or `src/utils/` preemptively. A shared common layer is a deliberate decision made when code is genuinely needed across multiple unrelated features.
- **`src/components/ui/` is shadcn-only** — feature components (sheets, cards, forms) start in `src/components/` and migrate into their feature folder once the feature grows enough to warrant it.
- **`src/lib/` is for shared non-UI code only** — DB client, schema, and cross-cutting helpers (e.g. `flags.ts`, `categories.ts`). Feature-specific logic belongs in the feature folder.
- **Co-locate feature constants** — constants scoped to one feature (e.g. status color maps, label maps) belong in a `constants.ts` or `utils.ts` within the feature folder, not inlined in the component file.
- **No barrel files** — don't create `index.ts` re-exports. Import directly from the source file.
- **Types co-location** — feature-specific types live in the feature folder (inline or a `types.ts` alongside). Don't add a top-level `src/types/` unless a type is genuinely shared across multiple features.

## Data Model

Three tables in `src/lib/db/schema.ts`:

- **`places`** — global backlog. Key fields: `name`, `city`, `state`, `country`, `category`, `notes`, `source`, `url`, `status` (`backlog`/`visited`/`skipped`), `rating` (1–5, post-visit), `tags` (JSON string array).
- **`trips`** — named trip. `cities` is a JSON string array (supports multi-city). `status`: `planning`/`active`/`done`.
- **`trip_places`** — joins places into a trip. `day` is nullable ("on the list but unscheduled" is valid).

## Auth

- Auth.js v5 with Google provider. Config in `src/auth.ts`.
- Route handler at `src/app/api/auth/[...nextauth]/route.ts`.
- Middleware in `src/middleware.ts` — protects all routes; unauthenticated users are redirected to `/login`. Authenticated users on `/login` are redirected to `/`.
- Any Google account can sign in — no email allowlist.
- Login page at `src/app/login/page.tsx` — uses a Server Action (only exception to the no-Server-Actions rule).

## Key Design Decisions

- Open to any Google account — no email allowlist. Data is shared across all users.
- No map view in MVP — use the `url` field to link to Google Maps.
- `tags` and `cities` stored as JSON strings — no extra tables needed at this scale.
- `day` is nullable on `trip_places` — unscheduled is a first-class state.
- City/place photos from Unsplash — proxied server-side at `/api/photos/city`, cached 24hr. Trip detail uses city name; place detail uses `{name} {city}` for more specific results.
- Detail views use a Modal (centered, view mode) + Sheet (bottom slide-up, edit mode) pattern.

## UX Principles

- Mobile-first — used on the ground while traveling.
- Fast capture — adding a place should take under 20 seconds.
- Flexible itinerary — a pool of options, not a rigid schedule.

## MVP Scope

**Done**: quick-add place, backlog list with filters, trip creation, trip view, Google Sign-In, city/place hero photos, modal detail views, PWA manifest, OG social preview image, Vercel deployment.

**Up next**: PWA manifest (install to home screen).

**Skipping**: map view, offline sync, sharing, recommendation engine, calendar sync, multiple users.
