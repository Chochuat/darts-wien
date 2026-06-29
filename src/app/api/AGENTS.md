# AGENTS — `src/app/api/`

> Scoped agent rules for Next.js Route Handlers.
> Read the root `AGENTS.md` first, then this file before editing anything in `src/app/api/`.

## Layout

```
api/
├── admin/                              # Admin API routes (secret-key client + auth guards)
│   ├── auth/
│   │   ├── login/route.ts              # POST (sign in with email+password)
│   │   ├── signup/route.ts             # POST (create auth user + pending profile)
│   │   ├── forgot-password/route.ts    # POST (send reset email)
│   │   ├── reset-password/route.ts     # POST (set new password)
│   │   └── signout/route.ts            # POST (sign out)
│   ├── session/route.ts                # GET (current user + profile + role)
│   ├── profiles/
│   │   ├── route.ts                    # GET (list all profiles — admin only)
│   │   └── [userId]/route.ts           # PATCH (promote/demote, link player)
│   ├── club-settings/route.ts          # GET / PATCH (tiebreaker order)
│   ├── players/
│   │   ├── create/route.ts             # POST (create player — admin only)
│   │   └── [id]/route.ts               # PATCH (update) / DELETE (remove)
│   ├── matches/
│   │   └── [id]/
│   │       ├── route.ts                # PATCH (record result + cascade locks + auto-QF)
│   │       └── no-show/route.ts        # PATCH (walkover + bracket advancement)
│   └── tournaments/[id]/
│       ├── generate/route.ts           # POST (create groups, matches, snapshot, bracket)
│       ├── seed-playoffs/route.ts      # POST (manual QF seeding for unresolvable ties)
│       ├── close/route.ts              # POST (close tournament, set winner)
│       └── format/route.ts             # GET / PUT (per-phase format config)
├── matches/
│   ├── route.ts                      # GET  /api/matches (list, filtered + paginated)
│   └── [id]/
│       ├── route.ts                  # PATCH /api/matches/:id (record result — legacy, use admin route)
│       └── no-show/route.ts          # PATCH /api/matches/:id/no-show (walkover — legacy, use admin route)
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
        ├── complete/route.ts         # POST (close tournament — legacy, use admin route)
        ├── generate/route.ts         # POST (transition to "ready" — legacy, use admin route)
        └── registrations/
            ├── route.ts              # GET (list) / POST (register)
            └── [playerId]/route.ts   # DELETE (unregister) / PATCH (check-in)
```

## Conventions

- Every handler is a named `export async function GET|POST|PATCH|DELETE`.
- **Public routes** use `getSupabase()` (anon key, RLS-subject) from `@/lib/api-utils`.
- **Admin routes** use `createAdminClient()` (secret key, bypasses RLS) from `@/lib/supabase/server-admin` + `requireAdmin()` or `requireAdminOrScorekeeper()` guards. Always check with `isAuthError()` before proceeding.
- Parse request bodies and query params with the matching Zod schema from `@/lib/validation`. On failure, return `validationError(issues)` (HTTP 400).
- Numeric path params: `Number(id)` then `Number.isNaN` guard → 400. The shared helper `requireNumericParam` exists for this.
- Errors: use `errorResponse(error, status)` for unknown failures; return explicit `NextResponse.json({ error: "..." }, { status })` for known business-rule failures (404 not found, 409 wrong state).
- Supabase queries that filter by joined columns are done in two steps (fetch IDs, then fetch related rows) because the anon client cannot use server-side joins. Keep this pattern.
- Match results and no-shows are only allowed when `status === "pending"` — return 409 otherwise.
- **Cascade locks** (admin match route): check `checkCascadeLock()` before updating. Group matches locked if any QF has results; playoff matches locked if downstream has results (see ADR-009).
- **Auto-QF seeding**: when the last group match gets a result, `tryAutoSeedQF()` creates QF matches automatically. If tiebreakers are unresolvable, the admin must use `/api/admin/tournaments/[id]/seed-playoffs`.
- Tournament close requires zero pending matches — return 409 otherwise. Close is manual, no auto-close (see ADR-010).

## Response shapes

- All response bodies are validated on the client by Zod schemas in `validation.ts`. When you change a response shape, update the matching `Api*` schema there **and** the consuming hook in `src/lib/hooks/`.
- Standings (ADR-001): no `match_type` filter — every completed match in the season counts toward stats/form/recent matches.
