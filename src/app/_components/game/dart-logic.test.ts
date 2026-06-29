import { describe, it, expect, vi } from "vitest";
import {
  DART_NUMBERS,
  BOARD_RADIUS,
  BOARD_POSITION,
  BOARD_FACE_Z,
  HAND_POS,
  WEDGE_HALF,
  WEDGE_SPAN,
  wedgeCenterAngle,
  randomOutcome,
  computeOutcomeFromBoardPosition,
} from "./dart-logic";

describe("dart-logic constants", () => {
  it("DART_NUMBERS has correct ordering", () => {
    expect(DART_NUMBERS).toEqual([
      20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
    ]);
    expect(DART_NUMBERS).toHaveLength(20);
  });

  it("BOARD_RADIUS is 0.9", () => {
    expect(BOARD_RADIUS).toBe(0.9);
  });

  it("BOARD_POSITION is a Vector3", () => {
    expect(BOARD_POSITION.x).toBe(0);
    expect(BOARD_POSITION.y).toBe(0.45);
    expect(BOARD_POSITION.z).toBe(-0.42);
  });

  it("BOARD_FACE_Z is computed from BOARD_POSITION", () => {
    expect(BOARD_FACE_Z).toBe(BOARD_POSITION.z + 0.03);
  });

  it("HAND_POS is a Vector3", () => {
    expect(HAND_POS.x).toBe(0.2);
    expect(HAND_POS.y).toBe(-0.55);
    expect(HAND_POS.z).toBe(1.7);
  });

  it("WEDGE_HALF is Math.PI / 20", () => {
    expect(WEDGE_HALF).toBe(Math.PI / 20);
  });

  it("WEDGE_SPAN is Math.PI / 10", () => {
    expect(WEDGE_SPAN).toBe(Math.PI / 10);
  });
});

describe("wedgeCenterAngle", () => {
  it("returns correct angle for index 0", () => {
    expect(wedgeCenterAngle(0)).toBeCloseTo(Math.PI / 2, 10);
  });

  it("returns correct angle for index 10 (bull segment)", () => {
    const expected = Math.PI / 2 - 10 * WEDGE_SPAN;
    expect(wedgeCenterAngle(10)).toBeCloseTo(expected, 10);
  });

  it("returns negative angle for large indices", () => {
    expect(wedgeCenterAngle(19)).toBeCloseTo(Math.PI / 2 - 19 * WEDGE_SPAN, 10);
  });
});

describe("randomOutcome", () => {
  it("returns a valid DartOutcome", () => {
    const outcome = randomOutcome();
    expect(outcome).toHaveProperty("type");
    expect(outcome).toHaveProperty("score");
    expect(outcome).toHaveProperty("label");
    expect(["inner_bull", "outer_bull", "single", "double", "triple", "miss"]).toContain(outcome.type);
  });

  it("returns inner_bull when Math.random is low", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.01);
    const outcome = randomOutcome();
    expect(outcome).toEqual({ type: "inner_bull", score: 50, label: "BULL" });
    vi.restoreAllMocks();
  });

  it("returns outer_bull when Math.random in range", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.05);
    const outcome = randomOutcome();
    expect(outcome).toEqual({ type: "outer_bull", score: 25, label: "25" });
    vi.restoreAllMocks();
  });

  it("returns miss when Math.random in range", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.11);
    const outcome = randomOutcome();
    expect(outcome).toEqual({ type: "miss", score: 0, label: "MISS" });
    vi.restoreAllMocks();
  });

  it("returns a numbered outcome for high random values", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.999)
      .mockReturnValueOnce(0.5);
    const outcome = randomOutcome();
    expect(outcome.type).toBe("single");
    expect(outcome.number).toBeGreaterThanOrEqual(1);
    expect(outcome.number).toBeLessThanOrEqual(20);
    expect(outcome.score).toBe(outcome.number);
    vi.restoreAllMocks();
  });

  it("returns triple when second random in range", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.999)
      .mockReturnValueOnce(0.1);
    const outcome = randomOutcome();
    expect(outcome.type).toBe("triple");
    expect(outcome.number).toBeGreaterThanOrEqual(1);
    expect(outcome.number).toBeLessThanOrEqual(20);
    expect(outcome.label).toBe("T" + outcome.number);
    vi.restoreAllMocks();
  });

  it("returns double when second random in range", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.999)
      .mockReturnValueOnce(0.25);
    const outcome = randomOutcome();
    expect(outcome.type).toBe("double");
    expect(outcome.label).toBe("D" + outcome.number);
    vi.restoreAllMocks();
  });
});

describe("computeOutcomeFromBoardPosition", () => {
  it("returns miss for positions far from board center", () => {
    const outcome = computeOutcomeFromBoardPosition(5, 5);
    expect(outcome).toEqual({ type: "miss", score: 0, label: "MISS" });
  });

  it("returns inner_bull for positions very close to center", () => {
    const x = BOARD_POSITION.x + 0.02;
    const y = BOARD_POSITION.y + 0.02;
    const outcome = computeOutcomeFromBoardPosition(x, y);
    expect(outcome).toEqual({ type: "inner_bull", score: 50, label: "BULL" });
  });

  it("returns outer_bull for positions in outer bull area", () => {
    const x = BOARD_POSITION.x + 0.1;
    const y = BOARD_POSITION.y;
    const outcome = computeOutcomeFromBoardPosition(x, y);
    expect(outcome).toEqual({ type: "outer_bull", score: 25, label: "25" });
  });

  it("returns double for positions in double ring", () => {
    const x = BOARD_POSITION.x + 0.76;
    const y = BOARD_POSITION.y;
    const outcome = computeOutcomeFromBoardPosition(x, y);
    expect(outcome.type).toBe("double");
    expect(outcome.score).toBe(outcome.number! * 2);
    expect(outcome.label).toBe("D" + outcome.number);
  });

  it("returns triple for positions in triple ring", () => {
    const x = BOARD_POSITION.x + 0.5;
    const y = BOARD_POSITION.y;
    const outcome = computeOutcomeFromBoardPosition(x, y);
    expect(outcome.type).toBe("triple");
    expect(outcome.score).toBe(outcome.number! * 3);
    expect(outcome.label).toBe("T" + outcome.number);
  });

  it("returns single for positions in fat area", () => {
    const x = BOARD_POSITION.x + 0.6;
    const y = BOARD_POSITION.y;
    const outcome = computeOutcomeFromBoardPosition(x, y);
    expect(outcome.type).toBe("single");
    expect(outcome.score).toBe(outcome.number);
    expect(outcome.label).toBe(String(outcome.number));
  });
});
