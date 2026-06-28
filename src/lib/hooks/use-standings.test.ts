import { describe, it, expect, vi, beforeEach } from "vitest";

const validStandingsResponse = {
  season: { id: 1, name: "Season 2 – 2025", isActive: true },
  players: [
    {
      pos: 1,
      playerId: 1,
      name: "Mike Thorn",
      slug: "mike-thorn",
      played: 19,
      wins: 19,
      losses: 0,
      setsFor: 57,
      setsAgainst: 0,
      points: 38,
      one80s: 2,
      form: ["W", "W", "W", "W", "W"],
    },
  ],
};

describe("Standings fetch with Zod validation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("passes validation with valid response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validStandingsResponse),
    });

    const res = await fetch("/api/seasons/1/standings");
    const data = await res.json();
    const { StandingsResponse } = await import("@/lib/validation");
    const parsed = StandingsResponse.parse(data);
    expect(parsed.players[0]?.name).toBe("Mike Thorn");
  });

  it("rejects response with negative points", async () => {
    const badData = {
      season: { id: 1, name: "Season", isActive: true },
      players: [
        {
          pos: 1,
          playerId: 1,
          name: "Mike",
          slug: "mike",
          played: 1,
          wins: 0,
          losses: 1,
          setsFor: 0,
          setsAgainst: 3,
          points: -1,
          one80s: 0,
          form: ["L"],
        },
      ],
    };

    const { StandingsResponse } = await import("@/lib/validation");
    expect(() => StandingsResponse.parse(badData)).toThrow();
  });

  it("rejects response with missing required fields", async () => {
    const badData = { season: {}, players: [] };

    const { StandingsResponse } = await import("@/lib/validation");
    expect(() => StandingsResponse.parse(badData)).toThrow();
  });
});
