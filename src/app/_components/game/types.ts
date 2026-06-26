export type OutcomeType =
  | "inner_bull"
  | "outer_bull"
  | "single"
  | "double"
  | "triple"
  | "miss";

export interface DartOutcome {
  type: OutcomeType;
  score: number;
  label: string;
  number?: number;
}

export interface GameState {
  outcomes: DartOutcome[];
  totalScore: number;
  roundHistory: number[];
  isThrowing: boolean;
  landedCount: number;
  roundKey: number;
  playerName: string | null;
  keypadOpen: boolean;
  resultOpen: boolean;
  resultScore: number;
  leaderboardDirtyKey: number;
}

export type Direction = "up" | "down" | "left" | "right";

export interface FlightInput {
  impulses: Direction[];
  held: Set<Direction>;
}

export type GameAction =
  | { type: "THROW_START" }
  | { type: "DART_LANDED"; outcome: DartOutcome }
  | { type: "OPEN_KEYPAD" }
  | { type: "CLOSE_KEYPAD" }
  | { type: "SET_PLAYER_NAME"; name: string }
  | { type: "DISMISS_RESULT" };