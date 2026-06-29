import { describe, it, expect } from "vitest";
import {
  validateGroupSizing,
  splitContiguous,
  interleavedStrict,
  snake,
  generateGroups,
  maxGroupSize,
  roundRobinPairings,
  extraMatchCount,
  suggestExtraMatches,
  generateGroupMatches,
  type RankedPlayer,
} from "./generation";

function makePlayers(n: number): RankedPlayer[] {
  return Array.from({ length: n }, (_, i) => ({ playerId: i + 1, rank: i + 1 }));
}

describe("validateGroupSizing", () => {
  it("returns null for valid sizing (8 players, 2 groups)", () => {
    expect(validateGroupSizing(8, 2)).toBeNull();
  });

  it("returns null for valid sizing (15 players, 3 groups)", () => {
    expect(validateGroupSizing(15, 3)).toBeNull();
  });

  it("returns error for too few players", () => {
    expect(validateGroupSizing(5, 2)).toContain("Not enough");
  });

  it("returns error for too many players", () => {
    expect(validateGroupSizing(21, 4)).toContain("Too many");
  });

  it("returns error for invalid numGroups", () => {
    expect(validateGroupSizing(8, 5)).toContain("numGroups");
  });
});

describe("splitContiguous", () => {
  it("splits 8 players into 2 groups of 4", () => {
    const result = splitContiguous(makePlayers(8), 2);
    expect(result).toEqual([
      { label: "A", playerIds: [1, 2, 3, 4] },
      { label: "B", playerIds: [5, 6, 7, 8] },
    ]);
  });

  it("splits 11 players into 3 groups (4+4+3)", () => {
    const result = splitContiguous(makePlayers(11), 3);
    expect(result.map((g) => g.playerIds.length)).toEqual([4, 4, 3]);
    expect(result[0]!.playerIds).toEqual([1, 2, 3, 4]);
    expect(result[2]!.playerIds).toEqual([9, 10, 11]);
  });

  it("splits 15 players into 3 groups of 5", () => {
    const result = splitContiguous(makePlayers(15), 3);
    expect(result.map((g) => g.playerIds.length)).toEqual([5, 5, 5]);
  });
});

describe("interleavedStrict", () => {
  it("interleaves 12 players into 3 groups with stride 3", () => {
    const result = interleavedStrict(makePlayers(12), 3);
    expect(result[0]!.playerIds).toEqual([1, 4, 7, 10]);
    expect(result[1]!.playerIds).toEqual([2, 5, 8, 11]);
    expect(result[2]!.playerIds).toEqual([3, 6, 9, 12]);
  });

  it("interleaves 8 players into 2 groups", () => {
    const result = interleavedStrict(makePlayers(8), 2);
    expect(result[0]!.playerIds).toEqual([1, 3, 5, 7]);
    expect(result[1]!.playerIds).toEqual([2, 4, 6, 8]);
  });
});

describe("snake", () => {
  it("snakes 12 players into 3 groups", () => {
    const result = snake(makePlayers(12), 3);
    expect(result[0]!.playerIds).toEqual([1, 6, 7, 12]);
    expect(result[1]!.playerIds).toEqual([2, 5, 8, 11]);
    expect(result[2]!.playerIds).toEqual([3, 4, 9, 10]);
  });

  it("snakes 8 players into 2 groups", () => {
    const result = snake(makePlayers(8), 2);
    expect(result[0]!.playerIds).toEqual([1, 4, 5, 8]);
    expect(result[1]!.playerIds).toEqual([2, 3, 6, 7]);
  });
});

describe("generateGroups", () => {
  it("dispatches to split_contiguous", () => {
    const result = generateGroups("split_contiguous", makePlayers(8), 2);
    expect(result).toHaveLength(2);
  });

  it("dispatches to interleaved_strict", () => {
    const result = generateGroups("interleaved_strict", makePlayers(8), 2);
    expect(result[0]!.playerIds).toEqual([1, 3, 5, 7]);
  });

  it("dispatches to snake", () => {
    const result = generateGroups("snake", makePlayers(8), 2);
    expect(result[0]!.playerIds).toEqual([1, 4, 5, 8]);
  });

  it("throws for manual strategy", () => {
    expect(() => generateGroups("manual", makePlayers(8), 2)).toThrow();
  });
});

describe("maxGroupSize", () => {
  it("returns 4 for 8 players, 2 groups", () => {
    expect(maxGroupSize(8, 2)).toBe(4);
  });

  it("returns 5 for 11 players, 3 groups (4+4+3)", () => {
    expect(maxGroupSize(11, 3)).toBe(4);
  });

  it("returns 5 for 15 players, 3 groups", () => {
    expect(maxGroupSize(15, 3)).toBe(5);
  });
});

describe("roundRobinPairings", () => {
  it("returns 6 pairings for 4 players", () => {
    expect(roundRobinPairings(4)).toEqual([
      [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3],
    ]);
  });

  it("returns 3 pairings for 3 players", () => {
    expect(roundRobinPairings(3)).toEqual([[0, 1], [0, 2], [1, 2]]);
  });

  it("returns 0 pairings for 1 player", () => {
    expect(roundRobinPairings(1)).toEqual([]);
  });
});

describe("extraMatchCount", () => {
  it("returns 0 when group size equals max", () => {
    expect(extraMatchCount(5, 5)).toBe(0);
  });

  it("returns 2 for group of 4, max 5", () => {
    expect(extraMatchCount(4, 5)).toBe(2);
  });

  it("returns 3 for group of 3, max 5", () => {
    expect(extraMatchCount(3, 5)).toBe(3);
  });

  it("returns 2 for group of 3, max 4 (rounds up from 1.5)", () => {
    expect(extraMatchCount(3, 4)).toBe(2);
  });
});

describe("suggestExtraMatches", () => {
  it("returns 0 matches when group equals max", () => {
    expect(suggestExtraMatches(5, 5, "top_vs_bottom")).toEqual([]);
  });

  it("suggests top_vs_bottom for group of 4, max 5", () => {
    const result = suggestExtraMatches(4, 5, "top_vs_bottom");
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual([0, 3]);
  });

  it("suggests top_vs_top for group of 4, max 5", () => {
    const result = suggestExtraMatches(4, 5, "top_vs_top");
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual([0, 1]);
  });

  it("suggests cross for group of 4, max 5", () => {
    const result = suggestExtraMatches(4, 5, "cross");
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual([0, 2]);
    expect(result[1]).toEqual([1, 3]);
  });

  it("returns empty for manual pairing", () => {
    expect(suggestExtraMatches(4, 5, "manual")).toEqual([]);
  });

  it("suggests 3 matches for group of 3, max 5 (double RR)", () => {
    const result = suggestExtraMatches(3, 5, "top_vs_bottom");
    expect(result).toHaveLength(3);
  });
});

describe("generateGroupMatches", () => {
  it("generates 6 RR + 0 extra for a full-size group of 5", () => {
    const matches = generateGroupMatches([1, 2, 3, 4, 5], 5, "top_vs_bottom");
    expect(matches).toHaveLength(10);
  });

  it("generates 6 RR + 2 extra for group of 4, max 5", () => {
    const matches = generateGroupMatches([1, 2, 3, 4], 5, "top_vs_bottom");
    expect(matches).toHaveLength(8);
  });

  it("generates 3 RR + 3 extra for group of 3, max 5", () => {
    const matches = generateGroupMatches([1, 2, 3], 5, "cross");
    expect(matches).toHaveLength(6);
  });
});
