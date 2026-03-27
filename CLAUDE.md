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
- **Env**: secrets live in `.env.local`. DB scripts use `--env-file=.env.local` to load it (see `package.json`). Planned additional vars: `UNSPLASH_ACCESS_KEY` (city photos).
- **Git commits**: all lowercase, one-line, no co-authored trailer. Example: `feat: add place detail sheet`.
- **Modular architecture** — hooks, components, and utilities live in feature-scoped subfolders, e.g. `src/app/trips/hooks/`, `src/app/trips/components/`. Do not create top-level `src/hooks/` or `src/utils/` preemptively. A shared common layer is a deliberate decision made when code is genuinely needed across multiple unrelated features.
- **`src/components/ui/` is shadcn-only** — feature components (sheets, cards, forms) start in `src/components/` and migrate into their feature folder once the feature grows enough to warrant it.
- **`src/lib/` is for shared non-UI code only** — DB client, schema, and cross-cutting helpers (e.g. `flags.ts`, `categories.ts`). Feature-specific logic belongs in the feature folder.
- **Co-locate feature constants** — constants scoped to one feature (e.g. status color maps, label maps) belong in a `constants.ts` or `utils.ts` within the feature folder, not inlined in the component file.
- **No barrel files** — don't create `index.ts` re-exports. Import directly from the source file.
- **Types co-location** — feature-specific types live in the feature folder (inline or a `types.ts` alongside). Don't add a top-level `src/types/` unless a type is genuinely shared across multiple features.

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
