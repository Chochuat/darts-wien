# AGENTS — `src/app/_components/tournaments/`

> Scoped agent rules for tournament display logic.
> Read the root `AGENTS.md` first, then this file before editing anything in this directory.

## Files

| File | Role |
|------|------|
| `format-constants.ts` | Game format constants: `GROUP_FORMAT`, `PLAYOFF_FORMAT`, `GRAND_FINAL_FORMAT`, `BONUS_180`. |
| `perspective-utils.ts` | `toPerspective()` / `groupMatchesFromPerspective()` — reinterpret a match row from one player's viewpoint. |
| `playoff-bracket.tsx` | Presentational helpers: `cell`, `SetsDiff`, `PlayoffMatch`, `PlayoffRound`, `FinalStandingsRow`. |
| `tournament-detail.tsx` | Full tournament detail page: group standings tables, playoff rounds, final standings. |

## Rules

- **Format constants are the single source of truth** for legs/maxThrows/scoring. The detail page renders them via i18n strings; do not hardcode leg counts in components.
- Tournament lifecycle and advancement rules are documented in the root `AGENTS.md` (Tournament Format Constants) and `docs/conventions.md`. Re-read them before touching bracket/seeding logic.
- `toPerspective` returns `null` when the match does not involve the named player — always narrow the result.
- Group standings sort: points → set difference → (server side handles tiebreakers). The client re-sorts only for display when needed.
- Playoff bracket pairing is determined server-side (`sort_order` on matches). The client groups by `tournament_round_name`; do not recompute pairings on the client.
- All components here are `"use client"` because they consume React Query hooks and i18n.
- The detail page distinguishes `grand_final` from `regular` tournaments via `summary.type` and switches the format info box and group section accordingly.

## i18n

- Every user-facing string goes through `t("...")`. Tournament strings live under the `tournamentDetail.*` and `tournamentsList.*` namespaces in `src/app/_i18n/locales/*.json`.
- When you add a format constant usage, add the matching translation key to **all three** locale files (en, de, sk).
