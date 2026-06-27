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
- Match results are generated deterministically based on player rank (index in `standingsData`): lower rank = stronger player always wins against higher rank. Sets lost depend on rank difference.
- Group composition uses snake draft with a week-based rotation for variety.
- Top 8 players across all groups (by group-stage points, then sets diff) advance to playoffs.
- Playoff bracket: standard seeding (1v8, 4v5, 2v7, 3v6) with semi-finals and final.
- Final standings sort by: winner → finalist → semi-finalists → quarter-finalists, then by points.
- Future tournaments are static entries with `status: "future"`, empty groups/playoffs, and a locked UI state.

## Testing

_No testing framework configured yet. Document the approach when one is added._
