"use client";

import {
  createContext,
  useReducer,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { DartOutcome, GameState, GameAction } from "./types";
import { randomOutcome } from "./dart-logic";

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
        outcomes: action.outcomes,
        roundKey: state.roundKey + 1,
        landedCount: 0,
      };
    }
    case "DART_LANDED": {
      const landedCount = state.landedCount + 1;
      const done = landedCount >= 3;
      const roundScore = state.outcomes.reduce((s, o) => s + o.score, 0);
      return {
        ...state,
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
    case "RESTART": {
      return {
        ...initialState,
        roundKey: state.roundKey + 1,
      };
    }
    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  throwDarts: () => void;
  restart: () => void;
  dartLanded: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const throwDarts = useCallback(() => {
    const outcomes: DartOutcome[] = [
      randomOutcome(),
      randomOutcome(),
      randomOutcome(),
    ];
    dispatch({ type: "THROW_START", outcomes });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: "RESTART" });
  }, []);

  const dartLanded = useCallback(() => {
    dispatch({ type: "DART_LANDED" });
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({ state, throwDarts, restart, dartLanded }),
    [state, throwDarts, restart, dartLanded],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}