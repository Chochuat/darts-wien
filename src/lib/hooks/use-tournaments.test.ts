import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUseQuery = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: mockUseQuery,
}));

const { useTournaments, useTournamentDetail, useTournamentRegistrations } =
  await import("./use-tournaments");
const { queryKeys } = await import("@/lib/query/keys");

const validTournamentsResponse = {
  tournaments: [
    {
      id: 1,
      weekNumber: 1,
      date: "2025-09-18",
      type: "regular",
      status: "completed",
      winner: { id: 1, name: "Mike Thorn", slug: "mike-thorn" },
      generationType: "1A_4A_8A_12A",
      playerCount: 20,
      groupMatchCount: 40,
      playoffMatchCount: 8,
      total180s: 3,
    },
  ],
};

const validTournamentDetail = {
  tournament: {
    id: 1,
    weekNumber: 1,
    date: "2025-09-18",
    type: "regular",
    status: "completed",
    winner: { id: 1, name: "Mike Thorn", slug: "mike-thorn" },
    generationType: "1A_4A_8A_12A",
    playerCount: 20,
    groupMatchCount: 40,
    playoffMatchCount: 8,
    total180s: 3,
  },
  groups: [],
  playoffs: [],
  finalStandings: [],
};

const validRegistrationsResponse = {
  registrations: [
    {
      player: { id: 1, name: "Mike", slug: "mike-thorn" },
      checkedIn: true,
      createdAt: "2025-09-18T00:00:00Z",
    },
  ],
};

describe("Tournaments fetch with Zod validation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("passes validation with valid response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validTournamentsResponse),
    });

    const res = await fetch("/api/tournaments?");
    const data = await res.json();
    const { TournamentSummary } = await import("@/lib/validation");
    const parsed = TournamentSummary.parse(data.tournaments[0]);
    expect(parsed.weekNumber).toBe(1);
  });

  it("rejects tournament with invalid type", async () => {
    const { TournamentSummary } = await import("@/lib/validation");
    expect(() =>
      TournamentSummary.parse({
        id: 1,
        weekNumber: 1,
        date: "2025-09-18",
        type: "invalid",
        status: "completed",
        winner: null,
        generationType: null,
        playerCount: 0,
        groupMatchCount: 0,
        playoffMatchCount: 0,
        total180s: 0,
      }),
    ).toThrow();
  });
});

describe("useTournaments hook", () => {
  beforeEach(() => {
    mockUseQuery.mockClear();
  });

  it("calls useQuery with correct key and options", () => {
    useTournaments();
    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: queryKeys.tournament.list(undefined),
      queryFn: expect.any(Function) as unknown,
      staleTime: 60_000,
    });
  });

  it("calls useQuery with seasonId filter", () => {
    useTournaments(1);
    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: queryKeys.tournament.list(1),
      queryFn: expect.any(Function) as unknown,
      staleTime: 60_000,
    });
  });
});

describe("useTournamentDetail hook", () => {
  beforeEach(() => {
    mockUseQuery.mockClear();
  });

  it("calls useQuery with tournament id", () => {
    useTournamentDetail(5);
    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: queryKeys.tournament.detail(5),
      queryFn: expect.any(Function) as unknown,
      staleTime: 60_000,
    });
  });
});

describe("useTournamentRegistrations hook", () => {
  beforeEach(() => {
    mockUseQuery.mockClear();
  });

  it("calls useQuery with tournament id", () => {
    useTournamentRegistrations(3);
    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: queryKeys.tournament.registrations(3),
      queryFn: expect.any(Function) as unknown,
      staleTime: 30_000,
    });
  });
});

describe("useTournaments fetch logic via queryFn", () => {
  beforeEach(() => {
    mockUseQuery.mockClear();
  });

  it("queryFn fetches and parses tournaments", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validTournamentsResponse),
    });

    useTournaments(1);
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    const result = await queryFn();
    expect(result).toHaveProperty("tournaments");
    expect(
      (result as typeof validTournamentsResponse).tournaments[0]?.weekNumber,
    ).toBe(1);
  });

  it("queryFn throws on non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    useTournaments();
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    await expect(queryFn()).rejects.toThrow("Failed to fetch tournaments");
  });

  it("queryFn fetches without seasonId (no query param)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validTournamentsResponse),
    });

    useTournaments();
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    const result = await queryFn();
    expect(result).toHaveProperty("tournaments");
  });
});

describe("useTournamentDetail fetch logic via queryFn", () => {
  beforeEach(() => {
    mockUseQuery.mockClear();
  });

  it("queryFn fetches and parses tournament detail", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validTournamentDetail),
    });

    useTournamentDetail(1);
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    const result = await queryFn();
    expect(result).toHaveProperty("tournament");
    expect(
      (result as typeof validTournamentDetail).tournament.id,
    ).toBe(1);
  });

  it("queryFn throws on non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    useTournamentDetail(999);
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    await expect(queryFn()).rejects.toThrow("Failed to fetch tournament detail");
  });
});

describe("useTournamentRegistrations fetch logic via queryFn", () => {
  beforeEach(() => {
    mockUseQuery.mockClear();
  });

  it("queryFn fetches and parses registrations", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validRegistrationsResponse),
    });

    useTournamentRegistrations(1);
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    const result = await queryFn();
    expect(result).toHaveProperty("registrations");
  });

  it("queryFn throws on non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    useTournamentRegistrations(1);
    const callArgs = mockUseQuery.mock.calls[0]?.[0];
    const queryFn = callArgs?.queryFn as () => Promise<unknown>;
    await expect(queryFn()).rejects.toThrow("Failed to fetch registrations");
  });
});

