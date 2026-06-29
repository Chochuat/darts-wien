import { describe, it, expect } from "vitest";
import {
  GROUP_FORMAT,
  PLAYOFF_FORMAT,
  GRAND_FINAL_FORMAT,
  BONUS_180,
} from "./format-constants";

describe("format-constants", () => {
  it("GROUP_FORMAT has correct values", () => {
    expect(GROUP_FORMAT).toEqual({ game: "501", legs: 2, maxThrows: 45 });
  });

  it("PLAYOFF_FORMAT has correct values", () => {
    expect(PLAYOFF_FORMAT).toEqual({ game: "501", legs: 3, maxThrows: 45 });
  });

  it("GRAND_FINAL_FORMAT has correct values", () => {
    expect(GRAND_FINAL_FORMAT).toEqual({
      quarterfinal: { game: "501", legs: 4, maxThrows: 45 },
      semifinal: { game: "501", legs: 5, maxThrows: 45 },
      thirdPlace: { game: "501", legs: 5, maxThrows: 45 },
      final: { game: "501", legs: 6, maxThrows: 45 },
    });
  });

  it("BONUS_180 is 5", () => {
    expect(BONUS_180).toBe(5);
  });
});
