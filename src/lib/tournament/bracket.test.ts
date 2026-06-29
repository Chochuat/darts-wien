import { describe, it, expect } from "vitest";
import {
  REGULAR_BRACKET,
  GRAND_FINAL_BRACKET,
  getBracket,
  upstreamLinks,
  downstreamLinks,
  resolveAdvancingPlayer,
  QF_SEED_PAIRINGS,
} from "./bracket";

describe("QF_SEED_PAIRINGS", () => {
  it("has 4 QF pairings in standard seeding order", () => {
    expect(QF_SEED_PAIRINGS).toEqual([
      [1, 8],
      [4, 5],
      [2, 7],
      [3, 6],
    ]);
  });
});

describe("REGULAR_BRACKET", () => {
  it("has 8 total matches", () => {
    expect(REGULAR_BRACKET.totalMatches).toBe(8);
  });

  it("has 4 rounds", () => {
    expect(REGULAR_BRACKET.rounds).toHaveLength(4);
  });

  it("has 8 links", () => {
    expect(REGULAR_BRACKET.links).toHaveLength(8);
  });

  it("links QF0 to SF0 as player1 winner", () => {
    const link = REGULAR_BRACKET.links.find(
      (l) => l.fromMatchIndex === 0 && l.toMatchIndex === 4,
    );
    expect(link).toEqual({
      fromMatchIndex: 0,
      toMatchIndex: 4,
      slot: "player1",
      advances: "winner",
    });
  });

  it("links SF0 to 3rd place as player2 loser", () => {
    const link = REGULAR_BRACKET.links.find(
      (l) => l.fromMatchIndex === 4 && l.toMatchIndex === 6,
    );
    expect(link).toEqual({
      fromMatchIndex: 4,
      toMatchIndex: 6,
      slot: "player2",
      advances: "loser",
    });
  });
});

describe("GRAND_FINAL_BRACKET", () => {
  it("has 12 total matches", () => {
    expect(GRAND_FINAL_BRACKET.totalMatches).toBe(12);
  });

  it("has 7 rounds", () => {
    expect(GRAND_FINAL_BRACKET.rounds).toHaveLength(7);
  });

  it("has 16 links", () => {
    expect(GRAND_FINAL_BRACKET.links).toHaveLength(16);
  });

  it("links QF0 loser to Consolation-SF0 (match 8) as player1", () => {
    const link = GRAND_FINAL_BRACKET.links.find(
      (l) => l.fromMatchIndex === 0 && l.advances === "loser",
    );
    expect(link).toEqual({
      fromMatchIndex: 0,
      toMatchIndex: 8,
      slot: "player1",
      advances: "loser",
    });
  });

  it("links Consolation-SF0 to 5th place as winner", () => {
    const link = GRAND_FINAL_BRACKET.links.find(
      (l) => l.fromMatchIndex === 8 && l.toMatchIndex === 10,
    );
    expect(link).toEqual({
      fromMatchIndex: 8,
      toMatchIndex: 10,
      slot: "player1",
      advances: "winner",
    });
  });

  it("links Consolation-SF0 to 7th place as loser", () => {
    const link = GRAND_FINAL_BRACKET.links.find(
      (l) => l.fromMatchIndex === 8 && l.toMatchIndex === 11,
    );
    expect(link).toEqual({
      fromMatchIndex: 8,
      toMatchIndex: 11,
      slot: "player2",
      advances: "loser",
    });
  });
});

describe("getBracket", () => {
  it("returns regular bracket for 'regular'", () => {
    expect(getBracket("regular")).toBe(REGULAR_BRACKET);
  });

  it("returns grand final bracket for 'grand_final'", () => {
    expect(getBracket("grand_final")).toBe(GRAND_FINAL_BRACKET);
  });
});

describe("upstreamLinks", () => {
  it("returns 2 upstream links for SF0 in regular bracket", () => {
    const links = upstreamLinks(REGULAR_BRACKET, 4);
    expect(links).toHaveLength(2);
    expect(links.map((l) => l.fromMatchIndex)).toEqual([0, 1]);
  });

  it("returns 0 upstream links for QF0", () => {
    const links = upstreamLinks(REGULAR_BRACKET, 0);
    expect(links).toHaveLength(0);
  });
});

describe("downstreamLinks", () => {
  it("returns 2 downstream links for QF0 in grand final (SF + Cons-SF)", () => {
    const links = downstreamLinks(GRAND_FINAL_BRACKET, 0);
    expect(links).toHaveLength(2);
    expect(links.map((l) => l.toMatchIndex)).toEqual([4, 8]);
  });

  it("returns 0 downstream links for Final in regular bracket", () => {
    const links = downstreamLinks(REGULAR_BRACKET, 7);
    expect(links).toHaveLength(0);
  });
});

describe("resolveAdvancingPlayer", () => {
  it("returns winner when advances is 'winner' (player1 wins)", () => {
    expect(resolveAdvancingPlayer(1, 2, 3, 1, "winner")).toBe(1);
  });

  it("returns winner when advances is 'winner' (player2 wins)", () => {
    expect(resolveAdvancingPlayer(1, 2, 1, 3, "winner")).toBe(2);
  });

  it("returns loser when advances is 'loser' (player1 wins, so player2 is loser)", () => {
    expect(resolveAdvancingPlayer(1, 2, 3, 1, "loser")).toBe(2);
  });

  it("returns loser when advances is 'loser' (player2 wins, so player1 is loser)", () => {
    expect(resolveAdvancingPlayer(1, 2, 1, 3, "loser")).toBe(1);
  });
});
