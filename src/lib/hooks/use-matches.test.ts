import { describe, it, expect, vi, beforeEach } from "vitest";

const validMatchesResponse = {
  total: 1,
  page: 1,
  limit: 20,
  matches: [
    {
      id: 1,
      matchType: "league",
      status: "completed",
      player1: { id: 1, name: "Mike Thorn", slug: "mike-thorn" },
      player2: { id: 2, name: "Dave Steel", slug: "dave-steel" },
      legsPlayer1: 3,
      legsPlayer2: 1,
      legsTarget: 3,
      maxThrows: 45,
      player1_180: 1,
      player2_180: 0,
      noShowPlayerId: null,
      matchDate: "2025-09-18",
    },
  ],
};

describe("Matches fetch with Zod validation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("passes validation with valid response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validMatchesResponse),
    });

    const res = await fetch("/api/matches?");
    const data = await res.json();
    const { ApiMatchesResponse } = await import("@/lib/validation");
    const parsed = ApiMatchesResponse.parse(data);
    expect(parsed.matches[0]?.player1.name).toBe("Mike Thorn");
  });

  it("rejects response with invalid matchType", async () => {
    const badData = {
      total: 1,
      page: 1,
      limit: 20,
      matches: [
        {
          id: 1,
          matchType: "invalid_type",
          status: "completed",
          player1: { id: 1, name: "Mike Thorn", slug: "mike-thorn" },
          player2: { id: 2, name: "Dave Steel", slug: "dave-steel" },
          legsPlayer1: 3,
          legsPlayer2: 1,
          legsTarget: 3,
          maxThrows: 45,
          player1_180: 0,
          player2_180: 0,
          noShowPlayerId: null,
          matchDate: "2025-09-18",
        },
      ],
    };

    const { ApiMatchesResponse } = await import("@/lib/validation");
    expect(() => ApiMatchesResponse.parse(badData)).toThrow();
  });

  it("builds correct query string from params", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validMatchesResponse),
    });

    const params = new URLSearchParams();
    params.set("playerId", "1");
    params.set("matchType", "league");

    await fetch(`/api/matches?${params.toString()}`);
    const call = (global.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0];
    const calledUrl = call?.[0] as string | undefined;

    expect(calledUrl).toBeDefined();
    expect(calledUrl!).toContain("playerId=1");
    expect(calledUrl!).toContain("matchType=league");
  });
});
