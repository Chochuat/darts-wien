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
}

export type GameAction =
  | { type: "THROW_START"; outcomes: DartOutcome[] }
  | { type: "DART_LANDED" };