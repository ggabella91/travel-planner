@AGENTS.md

# Travel Planner — Project Guide

## What This Is

A personal travel planning tool. Single user, no auth. Two core flows:
1. **Places backlog** — save and tag places by city/country
2. **Active trip** — pull backlog places into a flexible itinerary

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Database**: Supabase (Postgres) via Drizzle ORM + `postgres` driver
- **UI**: shadcn/ui components (in `src/components/ui/`) + Tailwind CSS v4
- **Deployment**: Vercel (planned)

## Conventions

- **API routes only** — use `/app/api/*/route.ts`. No Server Actions.
- **IDs**: use `crypto.randomUUID()` for all new record IDs.
- **Env**: secrets live in `.env.local`. DB scripts use `--env-file=.env.local` to load it (see `package.json`).
- **Git commits**: all lowercase, one-line, no co-authored trailer. Example: `feat: add place detail sheet`.

## Data Model

Three tables in `src/lib/db/schema.ts`:

- **`places`** — global backlog. Key fields: `name`, `city`, `country`, `category`, `notes`, `source`, `url`, `status` (`backlog`/`visited`/`skipped`), `rating` (1–5, post-visit), `tags` (JSON string array).
- **`trips`** — named trip. `cities` is a JSON string array (supports multi-city). `status`: `planning`/`active`/`done`.
- **`trip_places`** — joins places into a trip. `day` is nullable ("on the list but unscheduled" is valid).

## Key Design Decisions

- No auth — gate with an env var later if needed.
- No map view in MVP — use the `url` field to link to Google Maps.
- `tags` and `cities` stored as JSON strings — no extra tables needed at this scale.
- `day` is nullable on `trip_places` — unscheduled is a first-class state.

## UX Principles

- Mobile-first — used on the ground while traveling.
- Fast capture — adding a place should take under 20 seconds.
- Flexible itinerary — a pool of options, not a rigid schedule.

## MVP Scope

**Building**: quick-add place, backlog list with filters, trip creation, trip view, mark visited, PWA manifest.

**Skipping**: map view, photos, offline sync, sharing, recommendation engine, calendar sync, multiple users.
