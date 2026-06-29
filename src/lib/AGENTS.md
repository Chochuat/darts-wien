# AGENTS — `src/lib/`

> Scoped agent rules for the `src/lib/` shared library.
> Read the root `AGENTS.md` first, then this file before editing anything in `src/lib/`.

## What lives here

| Path | Responsibility |
|------|---------------|
| `validation.ts` | The single source of truth for all Zod schemas + inferred types. Every API request/response body and every database row shape is defined here. |
| `api-utils.ts` | Helpers for Route Handlers: Supabase server client, numeric param parsing, JSON error/validation responses. |
| `design-tokens.ts` | Colours, spacing, border-radius, and rank-colour helpers. Consumed by both server and client components. |
| `query/keys.ts` | Centralised React Query key factory. **Never inline query keys** — always go through `queryKeys`. |
| `hooks/` | `use*` hooks wrapping React Query + `fetch` + `*.parse()` from `validation.ts`. |
| `supabase/` | Supabase client factories (`client.ts` for browser, `server.ts` for Route Handlers/Server Components) and the `Database` type definitions. |

## Rules

- **`validation.ts` is append-only in spirit.** Add new schemas at the bottom of their section. Never weaken an existing schema without checking every consumer.
- Every exported `const` schema and its `z.infer` `type` alias MUST keep a JSDoc block (enforced by `jsdoc/require-jsdoc`). The `const` doc describes the schema; the `type` doc describes the inferred type.
- Zod schemas that mirror database columns use `snake_case` (e.g. `player1_id`). API-facing schemas use `camelCase` (e.g. `player1`). Do not mix the two in one object.
- Hooks always `parse()` the fetch response with the matching Zod schema before returning — never trust raw JSON.
- `queryKeys` entries are hierarchical `as const` arrays. Parameterised keys are functions returning a new array so cache identity stays stable.
- Supabase browser client (`createClient()` from `client.ts`) may return null when env vars are missing; always guard.
- Supabase server client must be awaited: `const supabase = await getSupabase()` (it reads the async cookie store).

## Tests

- `*.test.ts` files sit next to the module they cover (Vitest).
- Zod schema tests assert both valid and invalid cases, including the `.refine()` cross-field rules.
- Do not add a new Zod schema without adding at least one happy-path and one failure-path test.
