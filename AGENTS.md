<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Confirmed gotchas in this project

### Dynamic route params must be awaited
`params` is a Promise in Next.js 16 dynamic routes. Always `await ctx.params`:
```ts
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/places/[id]">) {
  const { id } = await ctx.params;
```
Use the `RouteContext<"/api/path/[param]">` helper (defined locally in each route file) for typed params.

### shadcn/ui here uses @base-ui/react, NOT Radix
The component primitives are from `@base-ui/react`. APIs differ from Radix. In particular:
- `SelectValue` renders the raw `value` string, not the item's label text. For human-readable display of enum values (e.g. status), add `className="capitalize"` to `SelectValue`, or render a label map.

### Tailwind v4 layer ordering
Unlayered CSS beats `@layer utilities`. Any CSS resets or base overrides must be inside `@layer base { }`, otherwise component styles will silently lose to the reset.

### Font CSS variable
The global font is Inter, wired up as `--font-inter` via `next/font/google`. In `globals.css`, the theme maps it as `--font-sans: var(--font-inter)`. Do not change this to a self-referential `var(--font-sans)` — that breaks the font silently (falls back to Times New Roman).

### Autocomplete proxies
City and country autocomplete routes (`/api/autocomplete/cities` and `/api/autocomplete/countries`) proxy external APIs server-side. Nominatim requires a `User-Agent` header that cannot be set from the browser. Never call Nominatim directly from client components.
<!-- END:nextjs-agent-rules -->
