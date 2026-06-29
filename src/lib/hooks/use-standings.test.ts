import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUseQuery = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: mockUseQuery,
}));

const { useQuery } = await import("@tanstack/react-query");
const { useStandings } = await import("./use-standings");
const { queryKeys } = await import("@/lib/query/keys");

const validStandingsResponse = {
  season: { id: 1, name: "Season 2 \u2013 2025", isActive: true },
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

describe("useStandings hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls useQuery with correct query key and options", () => {
    useStandings(1);
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: queryKeys.season.standings(1),
      queryFn: expect.any(Function) as unknown,
      staleTime: 30_000,
    });
  });
});

describe("useStandings fetch logic via queryFn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queryFn fetches and parses standings correctly", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validStandingsResponse),
    });

    useStandings(1);
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    const result = await queryFn();
    expect(result).toHaveProperty("players");
    expect((result as typeof validStandingsResponse).players[0]?.name).toBe("Mike Thorn");
  });

  it("queryFn throws on non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    useStandings(1);
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    await expect(queryFn()).rejects.toThrow("Failed to fetch standings");
  });
});

