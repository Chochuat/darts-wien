# AGENTS — `src/app/api/`

> Scoped agent rules for Next.js Route Handlers.
> Read the root `AGENTS.md` first, then this file before editing anything in `src/app/api/`.

## Layout

```
api/
├── matches/
│   ├── route.ts                      # GET  /api/matches (list, filtered + paginated)
│   └── [id]/
│       ├── route.ts                  # PATCH /api/matches/:id (record result)
│       └── no-show/route.ts          # PATCH /api/matches/:id/no-show (walkover)
├── players/
│   ├── route.ts                      # GET  /api/players
│   └── [slug]/
│       ├── route.ts                  # GET  /api/players/:slug (stats + matches)
│       └── matches/route.ts          # GET  /api/players/:slug/matches
├── seasons/[id]/standings/route.ts   # GET  /api/seasons/:id/standings
└── tournaments/
    ├── route.ts                      # GET (list) / POST (create)
    └── [id]/
        ├── route.ts                  # GET (detail) / PATCH (update)
        ├── complete/route.ts         # POST (close tournament, set winner)
        ├── generate/route.ts         # POST (transition to "ready")
        └── registrations/
            ├── route.ts              # GET (list) / POST (register)
            └── [playerId]/route.ts   # DELETE (unregister) / PATCH (check-in)
```

## Conventions

- Every handler is a named `export async function GET|POST|PATCH|DELETE`.
- Get the Supabase client via `getSupabase()` from `@/lib/api-utils`. Never call `createClient()` directly in a Route Handler.
- Parse request bodies and query params with the matching Zod schema from `@/lib/validation`. On failure, return `validationError(issues)` (HTTP 400).
- Numeric path params: `Number(id)` then `Number.isNaN` guard → 400. The shared helper `requireNumericParam` exists for this.
- Errors: use `errorResponse(error, status)` for unknown failures; return explicit `NextResponse.json({ error: "..." }, { status })` for known business-rule failures (404 not found, 409 wrong state).
- Supabase queries that filter by joined columns are done in two steps (fetch IDs, then fetch related rows) because the anon client cannot use server-side joins. Keep this pattern.
- Match results and no-shows are only allowed when `status === "pending"` — return 409 otherwise.
- Tournament completion requires zero pending matches — return 409 otherwise.

## Response shapes

- All response bodies are validated on the client by Zod schemas in `validation.ts`. When you change a response shape, update the matching `Api*` schema there **and** the consuming hook in `src/lib/hooks/`.
- Standings (ADR-001): no `match_type` filter — every completed match in the season counts toward stats/form/recent matches.
