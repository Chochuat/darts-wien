# Architecture Decision Records (ADRs)

> This file records architectural decisions for darts-wien.  
> Each entry explains **why** a decision was made, not just **what** was done.  
> Agents MUST read this file before making architectural changes and MUST append new decisions here.

---

## Format

```
## ADR-NNN: Title
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXX  
**Date:** YYYY-MM-DD  
**Context:** What problem are we solving?  
**Decision:** What did we decide and why?  
**Consequences:** What are the trade-offs?
```

---

## Records

## ADR-001: Standings Stats Include All Match Types
**Status:** Accepted  
**Date:** 2026-06-28  
**Context:** The standings page displayed "last 5 matches" showing only league matches (filtered by `match_type = 'league'`), while the player detail page showed all completed matches. This caused confusion — tournament group, playoff, and final matches were excluded from standings stats (wins, losses, sets, 180s, form, recent matches).  
**Decision:** The standings API now queries all completed matches with no `match_type` filter. Stats, form, and recent matches are computed from every completed match in the season (league, tournament group, playoff, final, grand final) ordered by `match_date DESC`.  
**Consequences:** Standings stats now reflect a player's full performance across all match types. The trade-off is that the standings no longer isolate league-only performance, but this matches user expectation that "all matches count."

---

## ADR-002: i18n via i18next + Query-Param Language Switching
**Status:** Accepted  
**Date:** 2026-06-26  
**Context:** The app needs three languages (English, German, Slovak) with Slovak as default. Next.js's built-in i18n router imposes URL-prefix routing (`/en/...`, `/sk/...`) and requires a middleware/redirect layer that complicates the existing App Router structure and the Supabase cookie flow.  
**Decision:** Use `i18next` + `react-i18next` directly (no Next.js i18n router). Language is selected via a `?lang=` query parameter read by `LocaleProvider`, which calls `i18n.changeLanguage`. Locales live in `src/app/_i18n/locales/{en,de,sk}.json`. `resolveLanguage()` guards against unsupported codes and falls back to `sk`.  
**Consequences:** No URL rewrites or middleware needed; the Supabase cookie/session flow stays untouched. Trade-off: language is not reflected in the URL path, so deep links don't encode language (the `?lang=` param is opt-in). SEO per-language is weaker than prefix routing, but the audience is a single club and this is acceptable.

---

## ADR-003: Vitest for Unit Testing
**Status:** Accepted  
**Date:** 2026-06-28  
**Context:** The project needed a test runner for the `src/lib/` validation/query/hook layer (pure logic, no DOM). Jest adds a Babel transform layer that conflicts with the project's ESM + TypeScript + Vite-adjacent tooling.  
**Decision:** Use Vitest (`vitest.config.ts`), colocating `*.test.ts` files next to the module they cover. Environment is `node` by default. `@testing-library/react` + `jsdom` are installed for future component tests but no DOM tests exist yet. `vitest.config.ts` inlines `@exodus/bytes` (a transitive Supabase dep) to work around a Vite CJS interop warning.  
**Consequences:** Fast startup, native ESM/TS, shared config with Vite. Coverage is at 100% for `src/lib/`. The trade-off is no DOM coverage yet — when component tests are added, per-file `environment: "jsdom"` overrides or a separate config may be needed.

---

## ADR-004: JSDoc/TSDoc Enforcement via ESLint Plugins
**Status:** Accepted  
**Date:** 2026-06-28  
**Context:** Cheaper-model code generation and multi-author edits produced inconsistent documentation — some exports had no JSDoc, others had malformed `@param`/`@returns`. A machine-checkable rule was needed to keep API/library docs reliable without relying on reviewer discipline.  
**Decision:** Enforce `eslint-plugin-jsdoc` (`flat/recommended-typescript`) plus `eslint-plugin-tsdoc`. Every public exported `const` schema and `z.infer` type alias in `validation.ts` must carry a JSDoc block; `@param`/`@returns` descriptions are required; `@throws` is required when a function throws. The `jsdoc/require-jsdoc` auto-fixer places the JSDoc block between `export` and the declaration (`export\n/** ... */\nconst x = ...`), and this is the required form.  
**Consequences:** Documentation is checked by `npm run lint` and auto-fixed on save. Trade-off: the `export\n/** */\nconst` placement is non-idiomatic and surprises tooling (e.g. TypeDoc), but changing it would require disabling the auto-fixer or reconfiguring the rule. Worth the trade-off for enforced coverage.

---

## ADR-005: Supabase Env Var Renamed to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
**Status:** Accepted  
**Date:** 2026-06-28  
**Context:** Supabase historically named the browser/anon key env var `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Recent Supabase docs and templates use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to distinguish the publishable (anon) key from the secret service-role key, and to align with the publishable/secret naming used by other BaaS SDKs.  
**Decision:** Standardise on `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (alongside `NEXT_PUBLIC_SUPABASE_URL`) in `.env.local`, `.env.example`, and both client factories in `src/lib/supabase/`.  
**Consequences:** Naming aligns with current Supabase conventions and reduces confusion with the service-role key. Trade-off: any existing local `.env.local` or CI config must be migrated from the old name — documented in `.env.example`.
