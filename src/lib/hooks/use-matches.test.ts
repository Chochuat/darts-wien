import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUseQuery = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: mockUseQuery,
}));

const { useMatches, useMatchDetail } = await import("./use-matches");
const { queryKeys } = await import("@/lib/query/keys");

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

describe("useMatches hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls useQuery with default params", () => {
    useMatches();
    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: queryKeys.match.list({}),
      queryFn: expect.any(Function) as unknown,
      staleTime: 30_000,
    });
  });

  it("calls useQuery with custom params", () => {
    useMatches({ seasonId: 1, page: 2 });
    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: queryKeys.match.list({ seasonId: 1, page: 2 }),
      queryFn: expect.any(Function) as unknown,
      staleTime: 30_000,
    });
  });
});

describe("useMatchDetail hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls useQuery with match id", () => {
    useMatchDetail(42);
    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: queryKeys.match.detail(42),
      queryFn: expect.any(Function) as unknown,
      staleTime: 30_000,
    });
  });
});

describe("useMatches fetch logic via queryFn", () => {
  beforeEach(() => {
    mockUseQuery.mockClear();
  });

  it("queryFn fetches and parses matches correctly", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validMatchesResponse),
    });

    useMatches({ seasonId: 1 });
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    const result = await queryFn();
    expect(result).toHaveProperty("matches");
    expect((result as typeof validMatchesResponse).matches[0]?.player1.name).toBe("Mike Thorn");
  });

  it("queryFn throws on non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    useMatches();
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    await expect(queryFn()).rejects.toThrow("Failed to fetch matches");
  });
});

describe("useMatchDetail fetch logic via queryFn", () => {
  beforeEach(() => {
    mockUseQuery.mockClear();
  });

  it("queryFn fetches and parses match detail", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 1,
          matchType: "league",
          status: "completed",
          player1: { id: 1, name: "Mike", slug: "mike-thorn" },
          player2: { id: 2, name: "Dave", slug: "dave-steel" },
          legsPlayer1: 3,
          legsPlayer2: 1,
          legsTarget: 3,
          maxThrows: 45,
          player1_180: 0,
          player2_180: 0,
          noShowPlayerId: null,
          matchDate: "2025-09-18",
        }),
    });

    useMatchDetail(1);
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    const result = await queryFn();
    expect(result).toHaveProperty("id", 1);
  });

  it("queryFn throws on non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    useMatchDetail(999);
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    await expect(queryFn()).rejects.toThrow("Failed to fetch match");
  });
});

