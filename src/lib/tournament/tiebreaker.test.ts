import { describe, it, expect } from "vitest";
import {
  rankWithTiebreakers,
  unresolvableTies,
  type GroupPlayerStats,
} from "./tiebreaker";

const DEFAULT_ORDER = ["head_to_head", "leg_diff", "legs_won", "legs_lost", "one80s"] as const;

function makeStats(
  playerId: number,
  points: number,
  legsWon: number,
  legsLost: number,
  one80s: number,
  headToHead: Record<number, { wins: number; losses: number }> = {},
): GroupPlayerStats {
  return {
    playerId,
    points,
    legsWon,
    legsLost,
    legDiff: legsWon - legsLost,
    one80s,
    headToHead,
  };
}

describe("rankWithTiebreakers", () => {
  it("ranks by points when no ties", () => {
    const stats = [
      makeStats(1, 6, 4, 2, 1),
      makeStats(2, 4, 3, 3, 0),
      makeStats(3, 2, 2, 4, 0),
      makeStats(4, 0, 1, 5, 0),
    ];
    const result = rankWithTiebreakers(stats, [...DEFAULT_ORDER]);
    expect(result.map((r) => r.playerId)).toEqual([1, 2, 3, 4]);
    expect(result.every((r) => !r.tied)).toBe(true);
  });

  it("breaks ties by leg_diff when points are equal", () => {
    const stats = [
      makeStats(1, 4, 5, 3, 0),
      makeStats(2, 4, 4, 3, 0),
    ];
    const result = rankWithTiebreakers(stats, [...DEFAULT_ORDER]);
    expect(result[0]!.playerId).toBe(1);
    expect(result[1]!.playerId).toBe(2);
  });

  it("breaks ties by head-to-head when points and leg_diff are equal", () => {
    const stats = [
      makeStats(1, 4, 4, 4, 0, { 2: { wins: 1, losses: 0 } }),
      makeStats(2, 4, 4, 4, 0, { 1: { wins: 0, losses: 1 } }),
    ];
    const result = rankWithTiebreakers(stats, [...DEFAULT_ORDER]);
    expect(result[0]!.playerId).toBe(1);
  });

  it("marks players as tied when all dimensions are equal", () => {
    const stats = [
      makeStats(1, 4, 4, 4, 2, { 2: { wins: 1, losses: 1 } }),
      makeStats(2, 4, 4, 4, 2, { 1: { wins: 1, losses: 1 } }),
    ];
    const result = rankWithTiebreakers(stats, [...DEFAULT_ORDER]);
    expect(result[0]!.tied).toBe(true);
    expect(result[1]!.tied).toBe(true);
  });

  it("respects custom tiebreaker order (180s before leg_diff)", () => {
    const stats = [
      makeStats(1, 4, 4, 4, 3),
      makeStats(2, 4, 5, 3, 1),
    ];
    const order = ["head_to_head", "one80s", "leg_diff", "legs_won", "legs_lost"] as const;
    const result = rankWithTiebreakers(stats, [...order]);
    expect(result[0]!.playerId).toBe(1);
  });

  it("handles asymmetric head-to-head (one player has data, other does not)", () => {
    const stats = [
      makeStats(1, 4, 4, 4, 0, { 2: { wins: 2, losses: 0 } }),
      makeStats(2, 4, 4, 4, 0),
    ];
    const result = rankWithTiebreakers(stats, [...DEFAULT_ORDER]);
    expect(result[0]!.playerId).toBe(1);
  });
});

describe("unresolvableTies", () => {
  it("returns empty when no tie at the cutoff", () => {
    const stats = [
      makeStats(1, 6, 4, 2, 1),
      makeStats(2, 4, 3, 3, 0),
      makeStats(3, 2, 2, 4, 0),
      makeStats(4, 0, 1, 5, 0),
    ];
    const ranked = rankWithTiebreakers(stats, [...DEFAULT_ORDER]);
    expect(unresolvableTies(ranked, 2)).toEqual([]);
  });

  it("returns tied player IDs when tie spans the cutoff", () => {
    const stats = [
      makeStats(1, 6, 4, 2, 1),
      makeStats(2, 4, 4, 4, 2, { 3: { wins: 1, losses: 1 } }),
      makeStats(3, 4, 4, 4, 2, { 2: { wins: 1, losses: 1 } }),
      makeStats(4, 0, 1, 5, 0),
    ];
    const ranked = rankWithTiebreakers(stats, [...DEFAULT_ORDER]);
    const ties = unresolvableTies(ranked, 2);
    expect(ties).toContain(2);
    expect(ties).toContain(3);
  });

  it("returns empty when slots available exceeds player count", () => {
    const stats = [makeStats(1, 6, 4, 2, 1)];
    const ranked = rankWithTiebreakers(stats, [...DEFAULT_ORDER]);
    expect(unresolvableTies(ranked, 3)).toEqual([]);
  });
});
