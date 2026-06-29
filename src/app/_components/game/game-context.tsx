"use client";

import {
  createContext,
  useReducer,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import type {
  DartOutcome,
  GameState,
  GameAction,
  Direction,
  FlightInput,
} from "./types";
import { saveThrow } from "./leaderboard-api";

const initialState: GameState = {
  outcomes: [],
  totalScore: 0,
  roundHistory: [],
  isThrowing: false,
  landedCount: 0,
  roundKey: 0,
  playerName: null,
  keypadOpen: false,
  resultOpen: false,
  resultScore: 0,
  leaderboardDirtyKey: 0,
};

/**
 * Game state reducer handling all game actions.
 *
 * @param state - The current game state.
 * @param action - The dispatched action.
 */
function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "THROW_START": {
      return {
        ...state,
        isThrowing: true,
        outcomes: [],
        roundKey: state.roundKey + 1,
        landedCount: 0,
        resultOpen: false,
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
        resultOpen: done ? true : state.resultOpen,
        resultScore: done ? roundScore : state.resultScore,
        leaderboardDirtyKey: done ? state.leaderboardDirtyKey + 1 : state.leaderboardDirtyKey,
      };
    }
    case "OPEN_KEYPAD":
      return { ...state, keypadOpen: true };
    case "CLOSE_KEYPAD":
      return { ...state, keypadOpen: false };
    case "SET_PLAYER_NAME":
      return { ...state, playerName: action.name, keypadOpen: false };
    case "DISMISS_RESULT":
      return { ...state, resultOpen: false };
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
  openKeypad: () => void;
  closeKeypad: () => void;
  setPlayerName: (name: string) => void;
  dismissResult: () => void;
  inputRef: { current: FlightInput };
}

const GameContext = createContext<GameContextValue | null>(null);


/**
 * Game state provider component.
 *
 * @param props - Component properties.
 */
export const GameProvider = ({ children }: { children: ReactNode }) => {
  /** Application state and dispatch. */
  const [state, dispatch] = useReducer(reducer, initialState);
  /** Reference to flight input state. */
  const inputRef = useRef<FlightInput>({
    impulses: [],
    held: new Set(),
  });

  /** Starts a new throw round. */
  const throwDarts = useCallback(() => {
    inputRef.current.impulses.length = 0;
    inputRef.current.held.clear();
    dispatch({ type: "THROW_START" });
  }, [inputRef]);

  /** Applies a directional nudge to the dart. */
  const nudge = useCallback(
    (dir: Direction) => {
      inputRef.current.impulses.push(dir);
    },
    [inputRef],
  );

  /** Sets a held direction state. */
  const setHeld = useCallback(
    (dir: Direction, on: boolean) => {
      if (on) inputRef.current.held.add(dir);
      else inputRef.current.held.delete(dir);
    },
    [inputRef],
  );

  /** Records a landed dart outcome. */
  const dartLanded = useCallback((outcome: DartOutcome) => {
    dispatch({ type: "DART_LANDED", outcome });
  }, []);

  /** Opens the player name keypad. */
  const openKeypad = useCallback(() => dispatch({ type: "OPEN_KEYPAD" }), []);
  /** Closes the player name keypad. */
  const closeKeypad = useCallback(() => dispatch({ type: "CLOSE_KEYPAD" }), []);
  /** Sets the current player name. */
  const setPlayerName = useCallback(
    (name: string) => dispatch({ type: "SET_PLAYER_NAME", name }),
    [],
  );
  /** Dismisses the round result dialog. */
  const dismissResult = useCallback(
    () => dispatch({ type: "DISMISS_RESULT" }),
    [],
  );

  /** Memoized context value. */
  const value = useMemo<GameContextValue>(
    () => ({
      state,
      throwDarts,
      nudge,
      setHeld,
      dartLanded,
      openKeypad,
      closeKeypad,
      setPlayerName,
      dismissResult,
      inputRef,
    }),
    [state, throwDarts, nudge, setHeld, dartLanded, openKeypad, closeKeypad, setPlayerName, dismissResult, inputRef],
  );

  // Persist completed round to Supabase exactly once per round.
  useEffect(() => {
    if (!state.resultOpen) return;
    if (state.roundHistory.length === 0) return;
    if (state.playerName == null) return;
    void saveThrow(state.playerName, state.resultScore).catch(() => {
      /* ignore network errors silently */
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.leaderboardDirtyKey]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// eslint-disable-next-line jsdoc/require-throws-type
/**
 * Returns the game context value.
 *
 * @throws An error if used outside of GameProvider.
 */
export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}