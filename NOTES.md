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
- [x] State/province field on places (DB migration + form + API)
- [x] Unsplash city photos — `/api/photos/city` proxy with 24hr cache; shown on trip cards and trip detail hero
- [x] Place photos — `/api/photos/city?q={name}+{city}` shown as hero in place detail modal
- [x] Modal detail views — centered modal (view) + bottom sheet (edit) for both places and trips
- [x] Extracted `TripCard` component with feature-scoped hooks (`trips/hooks/`, `trips/components/`)
- [x] Illustrated empty states — SVG travel graphics for places and trips
- [x] Ambient gradient blobs — decorative background layer in layout
- [x] Status dots on place cards
- [x] Google Sign-In auth — Auth.js v5 + Google provider, single-user email gate via `ALLOWED_EMAIL`
- [x] Login page with "Continue with Google" button
- [x] Route protection middleware — all routes require auth except `/login`
- [x] Deployed to Vercel (prod)

## Up Next

### PWA
- [ ] `public/manifest.json` — name, short_name, icons, theme_color, display: standalone
- [ ] Meta tags in `layout.tsx` — `apple-mobile-web-app-capable`, viewport fit=cover
- [ ] App icons (192×192, 512×512) in `public/`

### Core features (post-MVP)
- [ ] Trip detail view (`/trips/[id]`) — show backlog places matching city, pull into trip via `trip_places`
- [ ] Mark visited — quick-action from place card (status + optional rating)
- [ ] `GET/POST/DELETE /api/trips/[id]/places` — manage `trip_places` join table

### Nice-to-haves
- [ ] Swipe-to-delete / swipe-to-visit on place cards
- [ ] Drag-to-reorder days in trip detail
- [ ] Share trip as read-only link
- [ ] Skeleton loaders on list pages while fetch is in-flight

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # Auth.js OAuth handler
│   │   ├── places/              # GET, POST /api/places
│   │   ├── places/[id]/         # PATCH /api/places/[id]
│   │   ├── trips/               # GET, POST /api/trips
│   │   ├── trips/[id]/          # PATCH /api/trips/[id]
│   │   ├── autocomplete/        # City + country search proxies
│   │   └── photos/city/         # Unsplash photo proxy (24hr cache)
│   ├── login/                   # Login page (Google Sign-In)
│   ├── places/
│   │   ├── constants.ts
│   │   └── hooks/use-place-photo.ts
│   ├── trips/
│   │   ├── components/trip-card.tsx
│   │   ├── hooks/use-city-photo.ts
│   │   ├── constants.ts
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 ← backlog home
├── auth.ts                      # Auth.js config
├── middleware.ts                 # Route protection
├── components/
│   ├── ui/                      # shadcn + modal + autocomplete-input
│   ├── add-place-sheet.tsx
│   ├── place-detail-sheet.tsx
│   ├── create-trip-sheet.tsx
│   ├── trip-detail-sheet.tsx
│   └── bottom-nav.tsx
└── lib/
    ├── db/                      # Drizzle client + schema
    ├── categories.ts            # Category labels, icons, colors
    └── flags.ts                 # Country name → flag emoji
```
