
/**
 * Kind of dartboard region a dart can land in.
 */
export type OutcomeType =
  | "inner_bull"
  | "outer_bull"
  | "single"
  | "double"
  | "triple"
  | "miss";

export interface DartOutcome {
  /** Outcome type (single/double/triple/bull/miss). */
  type: OutcomeType;
  /** Points scored. */
  score: number;
  /** Display label (e.g. "T20", "D16", "BULL"). */
  label: string;
  /** Target number (undefined for bull/miss). */
  number?: number;
}

export interface GameState {
  /** Dart outcomes in the current round. */
  outcomes: DartOutcome[];
  /** Cumulative score across all rounds. */
  totalScore: number;
  /** Scores from previous rounds. */
  roundHistory: number[];
  /** Whether darts are currently being thrown. */
  isThrowing: boolean;
  /** Number of darts that have landed this round. */
  landedCount: number;
  /** Incremented each round to force re-renders. */
  roundKey: number;
  /** Current player name, or null if not set. */
  playerName: string | null;
  /** Whether the keypad dialog is open. */
  keypadOpen: boolean;
  /** Whether the round result dialog is open. */
  resultOpen: boolean;
  /** Score for the just-completed round. */
  resultScore: number;
  /** Incremented on completed rounds to trigger leaderboard save. */
  leaderboardDirtyKey: number;
}


/**
 * Cardinal direction used for dart steering input.
 */
export type Direction = "up" | "down" | "left" | "right";

export interface FlightInput {
  /** Pending directional impulses. */
  impulses: Direction[];
  /** Directions currently being held. */
  held: Set<Direction>;
}


/**
 * Discriminated union of actions dispatchable to the game reducer.
 */
export type GameAction =
  | { type: "THROW_START" }
  | { type: "DART_LANDED"; outcome: DartOutcome }
  | { type: "OPEN_KEYPAD" }
  | { type: "CLOSE_KEYPAD" }
  | { type: "SET_PLAYER_NAME"; name: string }
  | { type: "DISMISS_RESULT" };