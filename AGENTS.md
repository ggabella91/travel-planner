<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Confirmed gotchas in this project

### Dynamic route params must be awaited
`params` is a Promise in Next.js 16 dynamic routes. Always `await ctx.params`:
```ts
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
```
Type the context inline — do not use a `RouteContext` generic helper.

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
Use 'bd' for task tracking

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->
