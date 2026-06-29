/** Derived sub-phase of a tournament, computed from match data. */
export type TournamentPhase =
  | "registration"
  | "ready"
  | "group_phase"
  | "playoff_seeding"
  | "tiebreaker_pending"
  | "playoff_phase"
  | "awaiting_close"
  | "completed";

/** Summary of match counts used for phase detection. */
export interface TournamentMatchSummary {
  status: "registration" | "ready" | "in_progress" | "completed";
  hasGroupMatches: boolean;
  hasPlayoffMatches: boolean;
  pendingGroupMatches: number;
  completedGroupMatches: number;
  pendingPlayoffMatches: number;
  completedPlayoffMatches: number;
  hasUnresolvableTiebreaker: boolean;
}

/**
 * Derives the tournament sub-phase from its status and match data.
 *
 * @param summary - The match summary for the tournament.
 * @returns The derived phase.
 */
export function detectPhase(summary: TournamentMatchSummary): TournamentPhase {
  switch (summary.status) {
    case "registration":
      return "registration";
    case "ready":
      return "ready";
    case "completed":
      return "completed";
    case "in_progress":
      if (summary.hasPlayoffMatches && summary.pendingPlayoffMatches > 0) {
        return "playoff_phase";
      }
      if (summary.hasPlayoffMatches && summary.pendingPlayoffMatches === 0) {
        return "awaiting_close";
      }
      if (summary.pendingGroupMatches > 0) {
        return "group_phase";
      }
      if (summary.hasUnresolvableTiebreaker) {
        return "tiebreaker_pending";
      }
      return "playoff_seeding";
  }
}
