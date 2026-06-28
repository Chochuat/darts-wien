import { describe, it, expect, vi, beforeEach } from "vitest";

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
