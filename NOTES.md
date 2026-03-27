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

### Core features
- [ ] Trip detail view (`/trips/[id]`) — show backlog places matching city, pull into trip via `trip_places`
- [ ] Mark visited — quick-action from place card (status + optional rating)
- [ ] `GET/POST/DELETE /api/trips/[id]/places` — manage `trip_places` join table

### UI polish
- [ ] City hero photos on trip cards — proxy Unsplash API (`/api/photos/city?q=`) with `UNSPLASH_ACCESS_KEY` env var; cache response in-memory or via `next/cache` to stay within free tier (50 req/hr)
- [ ] Illustrated empty states (SVG) — one for places backlog, one for trips list, one for trip detail
- [ ] Skeleton loaders on list pages while fetch is in-flight

### PWA
- [ ] `public/manifest.json` — name, short_name, icons, theme_color, display: standalone
- [ ] Meta tags in `layout.tsx` — `apple-mobile-web-app-capable`, viewport fit=cover
- [ ] App icons (192×192, 512×512) in `public/`

### Nice-to-haves (post-MVP)
- [ ] Swipe-to-delete / swipe-to-visit on place cards
- [ ] Drag-to-reorder days in trip detail
- [ ] Share trip as read-only link

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
