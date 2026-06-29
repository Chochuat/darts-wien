# darts-wien — Project Memory & Rules

> This is the primary rules file for OpenCode.  
> Agents MUST read this file first in every session.  
> Agents MUST update this file when important decisions, patterns, or context emerge.

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Project Identity

- **Name:** darts-wien
- **Description:** [Describe what this app does]
- **Type:** Next.js App Router web application

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.9 |
| UI | React | 19.2.4 |
| Language | TypeScript (strict) | 5.x |
| Linting | ESLint (`eslint-config-next`) | 9.x |
| Package Manager | npm | — |
| Styling | MUI (Material UI) + CSS Modules | 9.x |
| Forms | React Hook Form | 7.x |
| Validation | Zod | 4.x |
| Server State | TanStack React Query | 5.x |
| Database | Supabase (PostgreSQL + PostGIS) | — |
| Auth | Supabase Auth (`@supabase/ssr`) | — |
| i18n | i18next + react-i18next | 26.x / 17.x |
| Testing | Vitest + @testing-library | 3.x |
| 3D Graphics | Three.js | 0.185.x |
| 3D React Renderer | @react-three/fiber | 9.x |
| 3D Helpers | @react-three/drei | 10.x |
| 3D Animation | @react-spring/three | 10.x |
| Linting (docs) | eslint-plugin-jsdoc + eslint-plugin-tsdoc | — |
| Test DOM | jsdom + @testing-library/react | 29.x / 16.x |

---

## Project Structure

```
darts-wien/
├── src/
│   ├── app/                  # App Router pages and layouts
│   │   ├── _components/
│   │   │   ├── game/              # 3D darts game (Three.js / R3F)
│   │   │   ├── standings/         # API-backed standings display
│   │   │   ├── tournaments/       # Format constants, bracket, detail page
│   │   │   └── ui/                # Shared components (Card, Section, Sidebar, AdminSidebar, etc.)
│   │   ├── _i18n/                 # i18next init, LocaleProvider, locales/{en,de,sk}.json
│   │   ├── about/                 # About page
│   │   ├── admin/                 # Admin area (auth pages + dashboard route group)
│   │   │   ├── (dashboard)/        # Sidebar-layout admin pages
│   │   │   │   ├── tournaments/   # Tournament CRUD, setup, groups, matches, close
│   │   │   │   ├── players/       # Player CRUD
│   │   │   │   └── users/         # Profile/role management
│   │   │   ├── login/             # Auth pages (login, signup, forgot, reset, 403, callback)
│   │   │   └── layout.tsx         # Minimal layout (auth pages bypass sidebar)
│   │   ├── api/                   # Route Handlers (see src/app/api/AGENTS.md)
│   │   │   ├── admin/             # Admin API routes (auth, profiles, generate, etc.)
│   │   │   └── ...                # Public API routes
│   │   ├── game/                  # 3D darts game page
│   │   ├── matches/
│   │   │   ├── page.tsx           # Filterable all-matches view (20/page)
│   │   │   └── [slug]/page.tsx    # Player match history
│   │   ├── tournaments/
│   │   │   └── page.tsx           # Tournament list (past + future)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Home page (Standings)
│   │   └── providers.tsx
│   ├── lib/
│   │   ├── AGENTS.md              # Scoped rules for src/lib/
│   │   ├── api-utils.ts           # Supabase server client, param parsing, error helpers, auth guards
│   │   ├── design-tokens.ts       # Colors, spacing, borderRadius, helpers
│   │   ├── validation.ts          # All Zod schemas + inferred types (single source of truth)
│   │   ├── hooks/                 # use* hooks (React Query + fetch + Zod parse)
│   │   ├── query/keys.ts          # Centralised React Query key factory
│   │   ├── supabase/              # Browser + server + server-admin client factories, Database types
│   │   └── tournament/            # Pure-logic generation engine (see AGENTS.md)
│   │       ├── generation.ts      # Group assignment algorithms (4 strategies)
│   │       ├── bracket.ts         # Bracket adjacency graph (regular + grand final)
│   │       ├── tiebreaker.ts      # 5-dimension configurable ranking
│   │       ├── phase.ts           # Derived tournament phase detection
│   │       └── AGENTS.md          # Scoped rules for tournament engine
├── docs/
│   ├── architecture.md
│   └── conventions.md
├── public/
├── supabase/                      # Migrations + seed SQL + README
├── proxy.ts                      # Admin route gating (session + role check)
├── opencode.json
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.mjs
└── package.json
```

---

## Commands

```bash
npm run dev       # Dev server → http://localhost:3000
npm run build     # Production build
npm run lint      # ESLint
npm test          # Vitest (332 tests across 23 test files; no UI component tests yet — npm run test:watch for dev)
npm run test:watch# Vitest watch mode
npx vitest run --coverage  # Coverage report (lib/ = 100%)
```

---

## Conventions (quick reference)

> Full detail in `docs/conventions.md`

- **TypeScript:** Strict. No `any` without justification. `@/*` alias for `src/*`.
- **Components:** Server Components by default. `"use client"` only when using hooks/events/browser APIs.
- **Imports:** React/Next → external libs → `@/` alias → relative → styles.
- **Styling:** CSS Modules for components, `globals.css` for reset + design tokens.
- **Naming:** PascalCase components, camelCase functions, kebab-case files.
- **Git:** Conventional commits (`feat:`, `fix:`, etc.).

---

## Architecture Decisions

> See `docs/architecture.md` for full records.

- **ADR-001:** Standings stats include all match types (no `match_type` filter).
- **ADR-002:** i18n via i18next + query-param language switching (no Next.js i18n router).
- **ADR-003:** Vitest for unit testing, colocated `*.test.ts` files.
- **ADR-004:** JSDoc/TSDoc enforcement via eslint-plugin-jsdoc + eslint-plugin-tsdoc.
- **ADR-005:** Supabase env var renamed to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **ADR-006:** Admin auth via Supabase + profiles table + proxy-gated `/admin/*`.
- **ADR-007:** Secret-key client for admin writes (bypasses RLS, server-only).
- **ADR-008:** Tournament generation engine: 4 algorithms + bracket adjacency + format config.
- **ADR-009:** Cascade lock model — upstream edits blocked once downstream is played.
- **ADR-010:** No retroactive editing — completed tournaments are permanently frozen.

---

## Available Skills

| Skill | Location | Use Case |
|-------|----------|----------|
| `grill-me` | `.opencode/skills/grill-me/` | Load this skill when the user says "grill me", "stress test", or wants to relentlessly interrogate a plan or design before implementing. Interviews the user branch-by-branch until shared understanding is reached. |

---

## Nested AGENTS.md (scoped rules)

The following subdirectories contain their own `AGENTS.md` with area-specific conventions. **Read the relevant one before editing files in that area.**

| Location | Scope |
|----------|-------|
| `src/lib/AGENTS.md` | Shared library: Zod validation schemas, API utils, auth guards, query keys, hooks, Supabase clients. |
| `src/lib/tournament/AGENTS.md` | Tournament generation engine: algorithms, bracket adjacency, tiebreaker, phase detection. |
| `src/app/api/AGENTS.md` | Next.js Route Handlers: handler conventions, error/validation patterns, response shapes, admin API. |
| `src/app/_components/game/AGENTS.md` | 3D darts game: Three.js/R3F architecture, reducer/context, physics, textures, performance. |
| `src/app/_components/tournaments/AGENTS.md` | Tournament display: format constants, perspective utils, playoff bracket, detail page. |

When adding a new self-contained area, create a scoped `AGENTS.md` there and add a row to this table.

---

## Memory & Agent Instructions

### What to update and when

| File | When to update |
|------|---------------|
| **AGENTS.md** (this file) | New dependency, new pattern, structure change, ADR summary, new convention |
| `docs/architecture.md` | Any architectural decision (why X over Y) |
| `docs/conventions.md` | New coding conventions or style rules |

### Workflow

1. **Read this file** at the start of every session.
2. **Read `docs/architecture.md`** before making architectural changes.
3. **Read `docs/conventions.md`** for full convention details.
4. After making changes, **run `npm test` and `npm run lint`** — fix all issues. If coverage drops below existing thresholds, add tests before committing.
5. **Update memory files** if your changes introduced anything worth remembering for future sessions.
6. **Be concise.** Don't explain code unless asked. Don't add comments unless logic is non-obvious.
