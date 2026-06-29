# Coding Conventions

> This file records coding conventions for darts-wien.  
> When new patterns or style rules are established, add them here.

---

## TypeScript

- All code in TypeScript. Strict mode (`strict: true`) with these additional checks:
  - `noUncheckedIndexedAccess` — guard all array/object indexed access
  - `noUnusedLocals` — no dead code
  - `noUnusedParameters` — prefix unused params with `_`
  - `noImplicitOverride` — use `override` keyword for class method overrides
  - `verbatimModuleSyntax` — use `import type` for type-only imports
  - `forceConsistentCasingInFileNames` — case-sensitive imports
- Avoid `any` — use `unknown` and type guards instead.
- Prefer `interface` over `type` for object shapes, unless union/intersection is needed.
- All type-only imports must use `import type { ... }` syntax (enforced by `@typescript-eslint/consistent-type-imports`).
- Target `ES2022`.

## ESLint

- Rules enforced via `eslint.config.mjs` (flat config).
- Key rules: `@typescript-eslint/no-explicit-any` (error), `@typescript-eslint/no-unused-vars` (error), `@typescript-eslint/consistent-type-imports` (error).
- React: `react/jsx-no-useless-fragment`, `react/self-closing-comp`, `react/no-array-index-key` (warn).
- No `console.log` in committed code (`no-console` warn).
- Prefer `eslint-disable-next-line` for intentional violations (e.g. array index keys in static lists).
- Run `npm run lint` before committing.

## React Components

- React Server Components by default. Only add `"use client"` when:
  - Using event handlers (onClick, onChange, etc.)
  - Using hooks (useState, useEffect, etc.)
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
- Admin client: `createAdminClient()` from `@/lib/supabase/server-admin` — use in admin Route Handlers for write operations (bypasses RLS, server-only, uses `SUPABASE_SERVICE_ROLE_KEY`).
- Database types: define tables in `src/lib/supabase/types.ts` under the `Database` interface. PostGIS geometry types are re-exported from the same file.
- Environment vars: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` (see ADR-005). Plus `SUPABASE_SERVICE_ROLE_KEY` (server-only, never `NEXT_PUBLIC_`-prefixed) for admin writes (see ADR-007).

### Admin Auth & RLS

- `profiles` table links `auth.users.id` to a role (`pending`, `scorekeeper`, `admin`) and optionally to `players.id` (see ADR-006).
- Middleware (`src/middleware.ts`) gates `/admin/*` — redirects unauthenticated to `/admin/login`, unauthorized to `/admin/403`.
- Auth guards: `requireAdmin()`, `requireAdminOrScorekeeper()`, `isAuthError()` from `@/lib/api-utils`. Always check the result with `isAuthError()` before proceeding.
- RLS write policies check `EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin','scorekeeper'))`. Scorekeeper match-write is additionally scoped to `in_progress` tournaments.
- Admin API routes live under `/api/admin/*` and use the service-role client + auth guards. Public API routes remain under `/api/*`.
- Self-signup creates `pending` profiles; admins promote via the Users screen (`/admin/users`).

### React Query

- `QueryClient` is created once per render in `Providers` and passed via `QueryClientProvider`.
- Use hooks from `@tanstack/react-query` in Client Components.

### React Hook Form

- No global provider needed. Import `useForm` directly in forms.

### Three.js

- Import from `three` directly.
- Use a Client Component (with `"use client"`) for any Three.js rendering.
- Declarative scene management uses `@react-three/fiber` (installed) with helpers from `@react-three/drei` and animation via `@react-spring/three`. See `src/app/_components/game/AGENTS.md` for the 3D architecture.

### MUI

- Theme is defined in `src/app/providers.tsx` using `createTheme`.
- Use `ThemeProvider` and `AppRouterCacheProvider` from the same file.
- Component-level styling: prefer MUI's `sx` prop or CSS Modules over inline styles.

### Tournament Format Constants

- Game format constants live in `src/app/_components/tournaments/format-constants.ts`.
- **Schedule:** Tournaments happen on Thursdays.
- **Tournament lifecycle:** `registration` → `ready` (generate groups/matches) → `in_progress` → `completed` (admin clicks "Close Tournament"). Matches have their own status: `pending` (generated, ready to play) → `completed` (result filled) or `no_show` (walkover). No auto-close; close is manual and blocked while any match is `pending`.
- **Generation strategies:** `split_contiguous`, `interleaved_strict`, `snake`, `manual`. All parameterised by `num_groups` (2–4). Groups have 3–5 players each.
- **Equal-match guarantee:** Every player plays the same number of group matches, set by the largest group. Smaller groups get extra matches (admin-selected pairing: `top_vs_bottom`, `top_vs_top`, `cross`, or `manual`).
- **Group phase:** Top 2 from each group auto-advance (3+ groups) or top 4 from each (2 groups), filled to 8 with best 3rd-place players. Tiebreaker: head-to-head → leg diff → legs won → legs lost → 180s (order configurable in `club_settings`).
- **Scoring:** Group win=2pts. Playoffs: QF win=3/loss=1, SF win=4/loss=2, Final win=10/ru=7, 3rd win=5/loss=3. 180 bonus = 5pts each.
- **Game formats (defaults, configurable per tournament via `tournament_format` side table):**
  - Group stage: first to 2 legs, 501 Double Out, max 45 throws
  - Playoffs: first to 3 legs, 501 Double Out, max 45 throws
  - Grand Final: QF first to 4, SF & 3rd first to 5, Final first to 6, 501 Double Out
- Playoff bracket: standard seeding (1v8, 4v5, 2v7, 3v6) with semi-finals and final. 1 and 2 on opposite halves, meet only in final.
- Grand final bracket: QF(4) + SF(2) + 3rd(1) + Final(1) + Consolation-SF(2) + 5th(1) + 7th(1) = 12 matches. Exactly 8 players.
- Regular bracket: QF(4) + SF(2) + 3rd(1) + Final(1) = 8 matches. No consolation.
- **Cascade locks:** Upstream edits blocked once downstream matches have results (see ADR-009).
- **No retroactive editing:** Completed tournaments are permanently frozen (see ADR-010).
- **Next-tournament gate:** Within a season, groups for tournament N+1 cannot be generated while tournament N is not `completed`.
- Final standings sort by: winner → finalist → semi-finalists → quarter-finalists, then by points.

### i18n

- i18next + react-i18next, initialised in `src/app/_i18n/i18n.ts` (see ADR-002).
- Language switching is via a `?lang=` query parameter, read by `LocaleProvider` — **no** Next.js i18n router.
- Locales live in `src/app/_i18n/locales/{en,de,sk}.json`; `sk` is the default/fallback.
- `resolveLanguage(lang)` guards against unsupported codes; always route user input through it.
- Translation keys are flat, dot-namespaced within each locale file (e.g. `matches.title`).

### JSDoc / TSDoc

- Enforced by `eslint-plugin-jsdoc` (`flat/recommended-typescript`) + `eslint-plugin-tsdoc` (see ADR-004).
- Every exported `const` schema and its `z.infer` `type` alias in `validation.ts` MUST have a JSDoc block.
- The `jsdoc/require-jsdoc` auto-fixer places the JSDoc block **between** `export` and the declaration (e.g. `export\n/** ... */\nconst x = ...`). This is the required form — do **not** move the block above `export`, the rule will not detect it there.
- `@param` and `@returns` descriptions are required; `@throws` is required when a function throws.

### React (additional rules)

- Function components are arrow functions with a default export (`react/function-component-definition`).
- Props are destructured in the signature, not accessed via `props.x` (`react/destructuring-assignment`, `destructureInSignature: always`).
- JSX nesting depth ≤ 6 (`react/jsx-max-depth`).
- No leaked renders — use a ternary, not `&&` with non-boolean values (`react/jsx-no-leaked-render`).
- Buttons must declare `type` (`react/button-has-type`).

## Testing

- Vitest is the test runner (`vitest.config.ts`); colocated `*.test.ts` files next to the module they cover (see ADR-003).
- Run `npm test` (single run) or `npm run test:watch` (watch mode). Coverage via `npx vitest run --coverage` — `src/lib/` is at 100%.
- Environment is `node` by default; no DOM tests exist yet (`@testing-library/react` + `jsdom` are installed for future component tests).
- Zod schema tests must cover at least one valid and one invalid case, including `.refine()` cross-field rules.
- `vitest.config.ts` inlines `@exodus/bytes` (a transitive Supabase dep) to work around a Vite CJS interop warning; keep the override until the upstream issue resolves.
