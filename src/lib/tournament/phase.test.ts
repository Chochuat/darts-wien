import { describe, it, expect } from "vitest";
import { detectPhase, type TournamentMatchSummary } from "./phase";

function makeSummary(
  overrides: Partial<TournamentMatchSummary> = {},
): TournamentMatchSummary {
  return {
    status: "in_progress",
    hasGroupMatches: false,
    hasPlayoffMatches: false,
    pendingGroupMatches: 0,
    completedGroupMatches: 0,
    pendingPlayoffMatches: 0,
    completedPlayoffMatches: 0,
    hasUnresolvableTiebreaker: false,
    ...overrides,
  };
}

describe("detectPhase", () => {
  it("returns 'registration' for registration status", () => {
    expect(detectPhase(makeSummary({ status: "registration" }))).toBe("registration");
  });

  it("returns 'ready' for ready status", () => {
    expect(detectPhase(makeSummary({ status: "ready" }))).toBe("ready");
  });

  it("returns 'completed' for completed status", () => {
    expect(detectPhase(makeSummary({ status: "completed" }))).toBe("completed");
  });

  it("returns 'group_phase' when group matches are pending and no playoffs", () => {
    expect(
      detectPhase(
        makeSummary({
          hasGroupMatches: true,
          pendingGroupMatches: 3,
          completedGroupMatches: 1,
        }),
      ),
    ).toBe("group_phase");
  });

  it("returns 'tiebreaker_pending' when groups done but unresolvable tie", () => {
    expect(
      detectPhase(
        makeSummary({
          hasGroupMatches: true,
          pendingGroupMatches: 0,
          completedGroupMatches: 6,
          hasUnresolvableTiebreaker: true,
        }),
      ),
    ).toBe("tiebreaker_pending");
  });

  it("returns 'playoff_seeding' when groups done and tiebreaker resolvable", () => {
    expect(
      detectPhase(
        makeSummary({
          hasGroupMatches: true,
          pendingGroupMatches: 0,
          completedGroupMatches: 6,
          hasUnresolvableTiebreaker: false,
        }),
      ),
    ).toBe("playoff_seeding");
  });

  it("returns 'playoff_phase' when playoff matches exist with pending", () => {
    expect(
      detectPhase(
        makeSummary({
          hasPlayoffMatches: true,
          pendingPlayoffMatches: 2,
          completedPlayoffMatches: 2,
        }),
      ),
    ).toBe("playoff_phase");
  });

  it("returns 'awaiting_close' when all matches completed", () => {
    expect(
      detectPhase(
        makeSummary({
          hasPlayoffMatches: true,
          pendingPlayoffMatches: 0,
          completedPlayoffMatches: 8,
        }),
      ),
    ).toBe("awaiting_close");
  });
});
