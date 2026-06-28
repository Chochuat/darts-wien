# Coding Conventions

> This file records coding conventions for darts-wien.  
> When new patterns or style rules are established, add them here.

---

## TypeScript

- All code in TypeScript. Strict mode enabled.
- Avoid `any` — use `unknown` and type guards instead.
- Prefer `interface` over `type` for object shapes, unless union/intersection is needed.

## React Components

- React Server Components by default. Only add `"use client"` when:
  - Using event handlers (`onClick`, `onChange`, etc.)
  - Using hooks (`useState`, `useEffect`, etc.)
  - Using browser-only APIs
- Component files: one component per file (except small private helpers).
- Props type declared inline or as a named interface in the same file.

## Imports

- Group order: React/Next → external libraries → `@/` path alias → relative imports → styles.
- Use `@/` for all internal project imports.

## Styling

- Use CSS Modules for component-specific styles.
- Use `globals.css` only for CSS reset and CSS custom properties (design tokens).
- No inline styles except for truly dynamic values.

## Naming

| Thing | Convention | Example |
|-------|-----------|---------|
| Components | PascalCase | `PlayerCard.tsx` |
| Hooks | camelCase, `use` prefix | `usePlayers.ts` |
| Utilities | camelCase | `formatScore.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_PLAYERS` |
| Files/directories | kebab-case | `player-card/` |

## Git

- Commit messages: present tense, concise. Prefer conventional commits (`feat:`, `fix:`, `refactor:`, etc.).
- One logical change per commit.

## Libraries

### Supabase

- Browser client: `createClient()` from `@/lib/supabase/client` — use in Client Components / event handlers.
- Server client: `createClient()` from `@/lib/supabase/server` — use in Server Components, Route Handlers, Server Actions.
- Database types: define tables in `src/lib/supabase/types.ts` under the `Database` interface. PostGIS geometry types are re-exported from the same file.
- Environment vars: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

### React Query

- `QueryClient` is created once per render in `Providers` and passed via `QueryClientProvider`.
- Use hooks from `@tanstack/react-query` in Client Components.

### React Hook Form

- No global provider needed. Import `useForm` directly in forms.

### Three.js

- Import from `three` directly.
- Use a Client Component (with `"use client"`) for any Three.js rendering.
- Consider using `@react-three/fiber` if declarative scene management is desired (not installed by default).

### MUI

- Theme is defined in `src/app/providers.tsx` using `createTheme`.
- Use `ThemeProvider` and `AppRouterCacheProvider` from the same file.
- Component-level styling: prefer MUI's `sx` prop or CSS Modules over inline styles.

### Tournament Data

- Tournament data lives in `src/app/_components/tournaments/data.ts`, separate from standings data.
- **Schedule:** Tournaments happen on Thursdays.
- **Draw:** Based on current standings. Only players who accepted the Facebook event (confirmed attendance) are part of the draw.
- Match results are generated deterministically based on player rank (index in `standingsData`): lower rank = stronger player always wins against higher rank. Sets lost depend on rank difference.
- Group composition uses snake draft with a week-based rotation for variety.
- **Tournament lifecycle:** `registration` → `ready` (generate groups/matches) → `in_progress` → `completed` (auto-closed when all matches have results). Matches have their own status: `pending` (generated, ready to play) → `completed` (result filled) or `no_show` (walkover).
- **Group phase:** Top 2 from each group auto-advance (3+ groups) or top 4 from each (2 groups). For 3 groups of 5: 6 players advance, remaining 2 spots filled by best 3rd-place players. Tiebreaker: head-to-head → leg diff → legs won → legs lost → 180s.
- **Scoring:** Group win=2pts. Playoffs: QF win=3/loss=1, SF win=4/loss=2, Final win=10/ru=7, 3rd win=5/loss=3. 180 bonus = 5pts each.
- **Game formats:**
  - Group stage: first to 2 legs, 501 Double Out, max 45 throws
  - Playoffs: first to 3 legs, 501 Double Out, max 45 throws
  - Grand Final: QF first to 4, SF & 3rd first to 5, Final first to 6, 501 Double Out
- **Starting a game:** Bull challenge — one dart closest to bullseye throws first.
- **Simultaneous games:** 3 darts available, so 3 games run simultaneously.
- Playoff bracket: standard seeding (1v8, 4v5, 2v7, 3v6) with semi-finals and final. Two-group bracket: 1A v 4B / 2A v 3B / 1B v 4A / 2B v 3A.
- Final standings sort by: winner → finalist → semi-finalists → quarter-finalists, then by points.
- Future tournaments use lifecycle states; `tournaments.status` in DB is `'registration'` until generated, then `'ready'`, then `'in_progress'`, then `'completed'`.

## Testing

_No testing framework configured yet. Document the approach when one is added._
