# AGENTS — `src/lib/tournament/`

> Scoped agent rules for the tournament generation engine and bracket logic.
> Read the root `AGENTS.md` first, then this file before editing anything in this directory.

## Files

| File | Role |
|------|------|
| `generation.ts` | Group assignment algorithms (`split_contiguous`, `interleaved_strict`, `snake`), extra-match pairing computation (`top_vs_bottom`, `top_vs_top`, `cross`, `manual`), round-robin pairings, group sizing validation. |
| `bracket.ts` | Bracket definitions (`REGULAR_BRACKET` = 8 matches, `GRAND_FINAL_BRACKET` = 12 matches), `BracketLink` adjacency graph, `QF_SEED_PAIRINGS`, `resolveAdvancingPlayer`. |
| `tiebreaker.ts` | `rankWithTiebreakers` — sorts group players by configurable tiebreaker dimension order. `unresolvableTies` — detects ties at the advancement cutoff. |
| `phase.ts` | `detectPhase` — derives the tournament sub-phase (`group_phase`, `playoff_seeding`, `tiebreaker_pending`, `playoff_phase`, `awaiting_close`, etc.) from match data. |
| `index.ts` | Barrel re-export. |

## Rules

- **All functions here are pure** — no side effects, no I/O, no Supabase calls. They take data and return data. This makes them fully testable with Vitest at 100% coverage.
- **Generation algorithms** take `RankedPlayer[]` (sorted by rank ascending) and `numGroups` (2–4) and return `GroupAssignment[]`. The `manual` strategy throws — manual assignments are passed directly, not computed.
- **Extra-match pairing**: when groups are unequal in size, smaller groups get extra matches so every player plays `(maxGroupSize - 1)` matches. The `suggestExtraMatches` function returns index pairs (0-based within the group); the caller maps indices to player IDs. The `manual` pairing returns `[]` — the admin provides pairings explicitly.
- **Bracket adjacency**: the `BracketLink` graph is the single source of truth for which match feeds into which downstream match. QF seeding is `[1v8, 4v5, 2v7, 3v6]` (1 and 2 on opposite halves, meet only in the final). The grand final adds a consolation bracket (5th/7th place) fed by QF losers.
- **Tiebreaker**: the five dimensions (`head_to_head`, `leg_diff`, `legs_won`, `legs_lost`, `one80s`) are applied in the order stored in `club_settings.tiebreaker_order`. `legs_lost` is ascending (fewer lost is better). When all dimensions are equal between consecutive ranked players, both are marked `tied` with shared `tiedWith` arrays.
- **Phase detection** is a derived view, not stored. The tournament `status` (4-value enum) is the source of truth; the sub-phase is computed from match counts. See `detectPhase` for the full state table.

## Tests

- Each module has a colocated `*.test.ts` file.
- Coverage target: 100% for all files in this directory.
- Generation tests cover all four strategies with known player counts and assert exact group assignments.
- Bracket tests assert the total match count, link count, and specific link structures (QF→SF, SF→Final, SF→3rd, QF→Consolation).
- Tiebreaker tests cover: no-tie ranking, dimension-by-dimension resolution, custom order, asymmetric head-to-head, and unresolvable-tie detection at the cutoff.
- Phase tests cover every phase transition.
