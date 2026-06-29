import type { tiebreakerDimension } from "@/lib/validation";

/** Stats for a single player within a group, used for tiebreaker comparison. */
export interface GroupPlayerStats {
  playerId: number;
  points: number;
  legsWon: number;
  legsLost: number;
  legDiff: number;
  one80s: number;
  headToHead: Record<number, { wins: number; losses: number }>;
}

/** A player with their resolved rank after tiebreaking. */
export interface RankedPlayerResult {
  playerId: number;
  rank: number;
  tied: boolean;
  tiedWith: number[];
}

const DIMENSION_COMPARATORS: Record<
  tiebreakerDimension,
  (a: GroupPlayerStats, b: GroupPlayerStats) => number
> = {
  head_to_head: (a, b) => {
    const h2hA = a.headToHead[b.playerId];
    const h2hB = b.headToHead[a.playerId];
    if (!h2hA && !h2hB) return 0;
    const winsA = h2hA?.wins ?? 0;
    const winsB = h2hB?.wins ?? 0;
    return winsA - winsB;
  },
  leg_diff: (a, b) => a.legDiff - b.legDiff,
  legs_won: (a, b) => a.legsWon - b.legsWon,
  legs_lost: (a, b) => b.legsLost - a.legsLost,
  one80s: (a, b) => a.one80s - b.one80s,
};

/**
 * Ranks players within a group using the tiebreaker dimension order.
 * Players that are identical on all dimensions are marked as tied.
 *
 * @param stats - Stats for each player in the group.
 * @param tiebreakerOrder - Ordered array of tiebreaker dimensions.
 * @returns Players with resolved ranks (1-based) and tie information.
 */
export function rankWithTiebreakers(
  stats: GroupPlayerStats[],
  tiebreakerOrder: tiebreakerDimension[],
): RankedPlayerResult[] {
  const sorted = [...stats].sort((a, b) => {
    for (const dim of tiebreakerOrder) {
      const cmp = DIMENSION_COMPARATORS[dim]!(a, b);
      if (cmp !== 0) return -cmp;
    }
    return 0;
  });

  const results: RankedPlayerResult[] = sorted.map((player, i) => ({
    playerId: player.playerId,
    rank: i + 1,
    tied: false,
    tiedWith: [],
  }));

  for (let i = 1; i < sorted.length; i++) {
    if (isTied(sorted[i - 1]!, sorted[i]!, tiebreakerOrder)) {
      results[i]!.tied = true;
      results[i - 1]!.tied = true;
      const allTied = [...new Set([
        ...results[i]!.tiedWith,
        ...results[i - 1]!.tiedWith,
        results[i]!.playerId,
        results[i - 1]!.playerId,
      ])];
      results[i]!.tiedWith = allTied;
      results[i - 1]!.tiedWith = allTied;
    }
  }

  return results;
}

function isTied(
  a: GroupPlayerStats,
  b: GroupPlayerStats,
  tiebreakerOrder: tiebreakerDimension[],
): boolean {
  for (const dim of tiebreakerOrder) {
    if (DIMENSION_COMPARATORS[dim]!(a, b) !== 0) return false;
  }
  return true;
}

/**
 * Checks if the tiebreaker can be resolved for a set of players competing
 * for advancement slots. Returns the players that are tied and cannot be
 * separated.
 *
 * @param results - Ranked results from `rankWithTiebreakers`.
 * @param slotsAvailable - Number of advancement slots.
 * @returns Array of player IDs that are tied at the cutoff, or empty if resolvable.
 */
export function unresolvableTies(
  results: RankedPlayerResult[],
  slotsAvailable: number,
): number[] {
  const cutoff = results[slotsAvailable - 1];
  const next = results[slotsAvailable];
  if (!cutoff || !next) return [];
  if (cutoff.tied && cutoff.tiedWith.includes(next.playerId)) {
    return [...new Set([...cutoff.tiedWith, next.playerId])];
  }
  return [];
}
