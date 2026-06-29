import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUseQuery = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: mockUseQuery,
}));

const { usePlayers, usePlayerBySlug, usePlayerMatches } = await import("./use-players");
const { queryKeys } = await import("@/lib/query/keys");

const validPlayersResponse = {
  players: [{ id: 1, name: "Mike Thorn", slug: "mike-thorn" }],
};

const validPlayerDetail = {
  player: {
    id: 1,
    name: "Mike",
    slug: "mike-thorn",
    pos: 1,
    played: 10,
    wins: 8,
    losses: 2,
    setsFor: 24,
    setsAgainst: 6,
    points: 16,
    one80s: 3,
    form: ["W", "W", "L"],
  },
  matches: [
    {
      id: 1,
      opponentName: "Dave",
      opponentSlug: "dave-steel",
      score: "3-1",
      result: "W",
      date: "2025-09-18",
      one80: 1,
      matchType: "league",
    },
  ],
};

describe("use-players hooks", () => {
  beforeEach(() => {
    mockUseQuery.mockClear();
  });

  describe("usePlayers", () => {
    it("calls useQuery with correct query key and options", () => {
      usePlayers();
      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: queryKeys.player.all,
        queryFn: expect.any(Function) as unknown,
        staleTime: 60_000,
      });
    });
  });

  describe("usePlayerBySlug", () => {
    it("calls useQuery with slug-based query key", () => {
      usePlayerBySlug("john-doe");
      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: queryKeys.player.bySlug("john-doe"),
        queryFn: expect.any(Function) as unknown,
        staleTime: 30_000,
      });
    });
  });

  describe("usePlayerMatches", () => {
    it("calls useQuery with matches query key", () => {
      usePlayerMatches("jane");
      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: queryKeys.player.matches("jane"),
        queryFn: expect.any(Function) as unknown,
        staleTime: 30_000,
      });
    });
  });
});

describe("usePlayers fetch logic via queryFn", () => {
  beforeEach(() => {
    mockUseQuery.mockClear();
  });

  it("queryFn fetches and parses players", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validPlayersResponse),
    });

    usePlayers();
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    const result = await queryFn();
    expect(result).toHaveProperty("players");
  });

  it("queryFn throws on non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    usePlayers();
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    await expect(queryFn()).rejects.toThrow("Failed to fetch players");
  });
});

describe("usePlayerBySlug fetch logic via queryFn", () => {
  beforeEach(() => {
    mockUseQuery.mockClear();
  });

  it("queryFn fetches and parses player detail", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validPlayerDetail),
    });

    usePlayerBySlug("mike-thorn");
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    const result = await queryFn();
    expect(result).toHaveProperty("player");
    expect(result).toHaveProperty("matches");
  });

  it("queryFn throws on non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    usePlayerBySlug("nobody");
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    await expect(queryFn()).rejects.toThrow("Failed to fetch player");
  });
});

describe("usePlayerMatches fetch logic via queryFn", () => {
  beforeEach(() => {
    mockUseQuery.mockClear();
  });

  it("queryFn fetches and parses player matches", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validPlayerDetail.matches),
    });

    usePlayerMatches("mike-thorn");
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    const result = await queryFn();
    expect(Array.isArray(result)).toBe(true);
    expect((result as typeof validPlayerDetail.matches)[0]?.opponentName).toBe("Dave");
  });

  it("queryFn throws on non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    usePlayerMatches("mike-thorn");
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    await expect(queryFn()).rejects.toThrow("Failed to fetch player matches");
  });
});
