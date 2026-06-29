import { describe, it, expect } from "vitest";
import { queryKeys } from "./keys";

describe("queryKeys", () => {
  it("season keys", () => {
    expect(queryKeys.season.all).toEqual(["seasons"]);
    expect(queryKeys.season.standings(1)).toEqual(["seasons", 1, "standings"]);
  });

  it("player keys", () => {
    expect(queryKeys.player.all).toEqual(["players"]);
    expect(queryKeys.player.bySlug("john")).toEqual(["players", "john"]);
    expect(queryKeys.player.byId(5)).toEqual(["players", 5]);
    expect(queryKeys.player.matches("john")).toEqual(["players", "john", "matches"]);
  });

  it("match keys", () => {
    expect(queryKeys.match.all).toEqual(["matches"]);
    expect(queryKeys.match.list({ seasonId: "1", page: 1 })).toEqual([
      "matches",
      "list",
      { seasonId: "1", page: 1 },
    ]);
    expect(queryKeys.match.detail(42)).toEqual(["matches", 42]);
  });

  it("tournament keys", () => {
    expect(queryKeys.tournament.all).toEqual(["tournaments"]);
    expect(queryKeys.tournament.list()).toEqual(["tournaments", "list", undefined]);
    expect(queryKeys.tournament.list(1)).toEqual(["tournaments", "list", 1]);
    expect(queryKeys.tournament.detail(7)).toEqual(["tournaments", 7]);
    expect(queryKeys.tournament.registrations(3)).toEqual([
      "tournaments",
      3,
      "registrations",
    ]);
  });
});
