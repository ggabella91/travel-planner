# Travel Planner — Status

## Done

- [x] Next.js project scaffolded + Supabase connected, migrations applied
- [x] shadcn/ui (Tailwind v4) + Drizzle ORM + `postgres` driver
- [x] DB schema: `places`, `trips`, `trip_places`
- [x] `GET/POST /api/places`, `PATCH /api/places/[id]`
- [x] `GET/POST /api/trips`, `PATCH /api/trips/[id]`
- [x] Places backlog — add, list, filter (status/category/city), detail + edit
- [x] Trip list — create, detail + edit
- [x] Bottom nav (Places | Trips)
- [x] Visual refresh — category icons/emoji, card accent borders, filter row labels
- [x] Inter font
- [x] City + country autocomplete (REST Countries + Nominatim proxy)
- [x] Flag emoji on place cards
- [x] Trips UI refresh — status filter chips, card accent borders, status icons on badges, notes preview

## Up Next

- [ ] Trip detail view (`/trips/[id]`) — show backlog places matching city, pull into trip via `trip_places`
- [ ] Mark visited — quick-action from place card (status + optional rating)
- [ ] City photos on trip cards
- [ ] Illustrated empty states (SVG)
- [ ] PWA manifest

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── places/route.ts + [id]/route.ts
│   │   ├── trips/route.ts + [id]/route.ts
│   │   └── autocomplete/countries + cities
│   ├── trips/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx              ← backlog home
├── components/
│   ├── ui/                   ← shadcn + autocomplete-input
│   ├── add-place-sheet.tsx
│   ├── place-detail-sheet.tsx
│   ├── create-trip-sheet.tsx
│   ├── trip-detail-sheet.tsx
│   └── bottom-nav.tsx
└── lib/
    ├── db/
    ├── categories.ts
    └── flags.ts
```
