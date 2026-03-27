# Travel Planner

A personal travel planning tool for saving places you want to visit and organizing them into trips. Built mobile-first — fast to use on the ground.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)

## Features

- **Places backlog** — save restaurants, bars, cafes, neighborhoods, activities, and spots with notes, a source, and a link
- **Filters** — filter your backlog by status, category, and city
- **Trips** — create and manage trips with name, cities, dates, and status
- **Edit anywhere** — tap any place or trip to view details and edit inline
- **City & country autocomplete** — powered by OpenStreetMap (Nominatim) and REST Countries, with flag emoji and state/province context
- **Mobile-first** — bottom nav, bottom sheets, iOS safe area support, fast capture

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Database**: [Supabase](https://supabase.com) (Postgres) via [Drizzle ORM](https://orm.drizzle.team)
- **UI**: [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS v4
- **Font**: Inter

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/travel-planner.git
cd travel-planner
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a free project, then find your connection strings under **Project Settings → Database → Connection string**.

You need two URLs:
- **Transaction mode** (port 6543) — used by the app at runtime
- **Session mode** (port 5432) — used by Drizzle Kit for migrations

### 3. Configure environment variables

Create a `.env.local` file at the project root:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
DATABASE_URL_UNPOOLED=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### 4. Run database migrations

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Scripts

| Script | Description |
|--------|-------------|
| `npm run db:generate` | Generate SQL migrations from schema changes |
| `npm run db:migrate` | Apply migrations to the database |
| `npm run db:studio` | Open Drizzle Studio (visual DB browser) |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── places/          # GET, POST /api/places
│   │   ├── places/[id]/     # PATCH /api/places/[id]
│   │   ├── trips/           # GET, POST /api/trips
│   │   ├── trips/[id]/      # PATCH /api/trips/[id]
│   │   └── autocomplete/    # City + country search proxies
│   ├── trips/               # Trips list page
│   ├── layout.tsx
│   └── page.tsx             # Places backlog
├── components/
│   ├── ui/                  # shadcn components + AutocompleteInput
│   ├── add-place-sheet.tsx
│   ├── place-detail-sheet.tsx
│   ├── create-trip-sheet.tsx
│   ├── trip-detail-sheet.tsx
│   └── bottom-nav.tsx
└── lib/
    ├── db/                  # Drizzle client + schema
    ├── categories.ts        # Category labels, icons, colors
    └── flags.ts             # Country name → flag emoji
```

## Notes

- Single-user, no auth. Gate with an env var if needed.
- No map view — use the `url` field to link to Google Maps or similar.
- Autocomplete proxies through Next.js API routes to satisfy Nominatim's `User-Agent` requirement and avoid CORS issues.
