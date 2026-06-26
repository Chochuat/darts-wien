"use client";

import {
  createContext,
  useReducer,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type {
  DartOutcome,
  GameState,
  GameAction,
  Direction,
  FlightInput,
} from "./types";

const initialState: GameState = {
  outcomes: [],
  totalScore: 0,
  roundHistory: [],
  isThrowing: false,
  landedCount: 0,
  roundKey: 0,
};

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "THROW_START": {
      return {
        ...state,
        isThrowing: true,
        outcomes: [],
        roundKey: state.roundKey + 1,
        landedCount: 0,
      };
    }
    case "DART_LANDED": {
      const outcomes = [...state.outcomes, action.outcome];
      const landedCount = state.landedCount + 1;
      const done = landedCount >= 3;
      const roundScore = outcomes.reduce((s, o) => s + o.score, 0);
      return {
        ...state,
        outcomes,
        landedCount,
        isThrowing: done ? false : state.isThrowing,
        totalScore:
          done && state.isThrowing
            ? state.totalScore + roundScore
            : state.totalScore,
        roundHistory:
          done && state.isThrowing
            ? [...state.roundHistory, roundScore]
            : state.roundHistory,
      };
    }
    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  throwDarts: () => void;
  nudge: (dir: Direction) => void;
  setHeld: (dir: Direction, on: boolean) => void;
  dartLanded: (outcome: DartOutcome) => void;
  inputRef: { current: FlightInput };
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const inputRef = useRef<FlightInput>({ impulses: [], held: new Set() });

  const throwDarts = useCallback(() => {
    inputRef.current.impulses.length = 0;
    inputRef.current.held.clear();
    dispatch({ type: "THROW_START" });
  }, [inputRef]);

  const nudge = useCallback(
    (dir: Direction) => {
      inputRef.current.impulses.push(dir);
    },
    [inputRef],
  );

  const setHeld = useCallback(
    (dir: Direction, on: boolean) => {
      if (on) inputRef.current.held.add(dir);
      else inputRef.current.held.delete(dir);
    },
    [inputRef],
  );

  const dartLanded = useCallback((outcome: DartOutcome) => {
    dispatch({ type: "DART_LANDED", outcome });
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({ state, throwDarts, nudge, setHeld, dartLanded, inputRef }),
    [state, throwDarts, nudge, setHeld, dartLanded, inputRef],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}