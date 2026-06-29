import { describe, it, expect } from "vitest";
import { toPerspective, groupMatchesFromPerspective } from "./perspective-utils";
import type { ApiMatchRow, ApiTournamentGroup } from "@/lib/validation";

const makeMatch = (overrides: Partial<ApiMatchRow> = {}): ApiMatchRow =>
  ({
    id: 1,
    match_type: "league",
    match_date: "2025-01-01",
    status: "completed",
    player1: { id: 1, name: "Alice" },
    player2: { id: 2, name: "Bob" },
    legsPlayer1: 2,
    legsPlayer2: 1,
    player1_180: 1,
    player2_180: 0,
    ...overrides,
  }) as ApiMatchRow;

describe("toPerspective", () => {
  it("returns null when player is not in the match", () => {
    const m = makeMatch();
    const result = toPerspective(m, "Charlie");
    expect(result).toBeNull();
  });

  it("returns perspective for player1 (winner)", () => {
    const m = makeMatch();
    const result = toPerspective(m, "Alice");
    expect(result).toEqual({
      playerName: "Alice",
      opponent: "Bob",
      score: "2-1",
      result: "W",
      one80: 1,
    });
  });

  it("returns perspective for player2 (loser)", () => {
    const m = makeMatch();
    const result = toPerspective(m, "Bob");
    expect(result).toEqual({
      playerName: "Bob",
      opponent: "Alice",
      score: "1-2",
      result: "L",
      one80: 0,
    });
  });

  it("handles null legs gracefully", () => {
    const m = makeMatch({ legsPlayer1: null as unknown as number, legsPlayer2: null as unknown as number });
    const result = toPerspective(m, "Alice");
    expect(result).toEqual({
      playerName: "Alice",
      opponent: "Bob",
      score: "0-0",
      result: "L",
      one80: 1,
    });
  });
});

describe("groupMatchesFromPerspective", () => {
  it("returns empty array for group with no matches", () => {
    const g: ApiTournamentGroup = {
      group_label: "A",
      players: [],
      matches: [],
      standings: [],
    } as unknown as ApiTournamentGroup;
    expect(groupMatchesFromPerspective(g)).toEqual([]);
  });

  it("returns perspectives for all matches in a group", () => {
    const g: ApiTournamentGroup = {
      group_label: "A",
      players: [],
      matches: [
        makeMatch({ id: 1 }),
        makeMatch({ id: 2, player1: { id: 3, name: "Charlie" }, player2: { id: 4, name: "Dave" }, legsPlayer1: 0, legsPlayer2: 2 }),
      ],
      standings: [],
    } as unknown as ApiTournamentGroup;

    const results = groupMatchesFromPerspective(g);
    expect(results).toHaveLength(4);
    expect(results[0].playerName).toBe("Alice");
    expect(results[1].playerName).toBe("Bob");
    expect(results[2].playerName).toBe("Charlie");
    expect(results[3].playerName).toBe("Dave");
  });
});
