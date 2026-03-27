# Travel Planner — Status

## Done

- [x] Next.js project scaffolded
- [x] shadcn/ui initialized (Tailwind v4, neutral theme)
- [x] shadcn components: `button`, `sheet`, `input`, `label`, `select`, `badge`
- [x] Drizzle ORM + `postgres` driver installed
- [x] `drizzle.config.ts` at project root
- [x] DB schema: `places`, `trips`, `trip_places` (`src/lib/db/schema.ts`)
- [x] DB connection at `src/lib/db/index.ts`
- [x] npm scripts: `db:generate`, `db:migrate`, `db:studio` (use `--env-file=.env.local`)
- [x] Supabase project connected, migrations applied
- [x] `GET /api/places` + `POST /api/places`
- [x] `AddPlaceSheet` component (bottom sheet, mobile-friendly)
- [x] Home page (`/`) — backlog list with empty state

## Up Next

- [ ] Backlog filters (city, category, status)
- [ ] `POST /api/trips` + trip creation UI
- [ ] Trip detail view (`/trips/[id]`) — show matching backlog places, pull into trip
- [ ] Mark visited flow (status update + optional rating/note)
- [ ] PWA manifest

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── places/route.ts
│   ├── trips/[id]/        ← next to build
│   ├── layout.tsx
│   └── page.tsx           ← backlog home
├── components/
│   ├── ui/                ← shadcn components
│   └── add-place-sheet.tsx
└── lib/db/
    ├── index.ts
    └── schema.ts
```
