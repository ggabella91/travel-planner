# Travel Planner

A personal travel planning tool for saving places you want to visit and organizing them into trips. Built mobile-first — fast to use on the ground.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)

## Features

- **Places backlog** — save restaurants, bars, cafes, neighborhoods, activities, and spots with notes, a source, and a link
- **Filters** — filter your backlog by status, category, and city
- **Trips** — create and manage trips with name, cities, dates, and status
- **City & place photos** — hero images from Unsplash on trip cards and place/trip detail modals
- **Edit & delete** — tap any place or trip to view, edit, or delete with confirmation
- **City & country autocomplete** — powered by OpenStreetMap (Nominatim) and REST Countries, with flag emoji and state/province context
- **Per-user data isolation** — each Google account sees only their own places and trips
- **Google Sign-In** — any Google account can sign in
- **Mobile-first** — bottom nav, bottom sheets, skeleton loading, toast feedback, iOS safe area support

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Database**: [Supabase](https://supabase.com) (Postgres) via [Drizzle ORM](https://orm.drizzle.team)
- **UI**: [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS v4
- **Auth**: [Auth.js v5](https://authjs.dev) with Google provider
- **Photos**: [Unsplash API](https://unsplash.com/developers) (proxied server-side)
- **Deployment**: [Vercel](https://vercel.com)

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/ggabella91/travel-planner.git
cd travel-planner
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a free project, then find your connection strings under **Project Settings → Database**:

- **Local dev**: create a separate Supabase project for dev and use its **Transaction pooler** URI (port 6543)
- **Production (Vercel)**: use your prod project's **Transaction pooler** URI (port 6543) — required because Vercel runs on IPv4 and Supabase's direct connection is IPv6-only

### 3. Set up Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-vercel-domain.vercel.app/api/auth/callback/google`

### 4. Configure environment variables

Create a `.env.local` file at the project root:

```env
# Database (use direct connection for local dev, pooler URL for prod)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres

# Unsplash (get a free key at unsplash.com/developers)
UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# Auth.js (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
AUTH_SECRET=your_auth_secret
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
```

### 5. Run database migrations

```bash
npm run db:migrate
```

### 6. Start the dev server

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
│   │   ├── auth/[...nextauth]/  # Auth.js OAuth handler
│   │   ├── places/              # GET, POST /api/places
│   │   │   ├── places/[id]/         # PATCH, DELETE /api/places/[id]
│   │   ├── trips/               # GET, POST /api/trips
│   │   ├── trips/[id]/          # PATCH, DELETE /api/trips/[id]
│   │   ├── autocomplete/        # City + country search proxies
│   │   └── photos/city/         # Unsplash photo proxy (24hr cache)
│   ├── login/                   # Login page (Google Sign-In)
│   ├── places/
│   │   ├── constants.ts
│   │   └── hooks/           # use-places.ts, use-place-photo.ts
│   ├── trips/
│   │   ├── components/      # trip-card.tsx
│   │   ├── hooks/           # use-trips.ts, use-city-photo.ts
│   │   ├── constants.ts
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Places backlog
├── auth.ts                      # Auth.js config
├── middleware.ts                 # Route protection
├── components/
│   ├── ui/                      # shadcn primitives: button, sheet, modal, select, skeleton, toaster, confirm-dialog…
│   ├── add-place-sheet.tsx
│   ├── place-detail-sheet.tsx
│   ├── create-trip-sheet.tsx
│   ├── trip-detail-sheet.tsx
│   ├── sign-out-button.tsx
│   └── bottom-nav.tsx
└── lib/
    ├── db/                      # Drizzle client + schema
    ├── categories.ts            # Category labels, icons, colors
    ├── flags.ts                 # Country name → flag emoji
    └── toast.ts                 # Global toast manager
```

## Notes

- Any Google account can sign in. Each user's data is fully isolated by their Google email.
- No map view — use the `url` field to link to Google Maps or similar.
- Autocomplete proxies through Next.js API routes to satisfy Nominatim's `User-Agent` requirement and avoid CORS issues.
- Unsplash photos are cached 24hr server-side to stay within the free tier (50 req/hr).
- Use separate Supabase projects for dev and prod to keep data isolated.
