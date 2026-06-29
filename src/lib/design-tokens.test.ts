import { describe, it, expect } from "vitest";
import {
  colors,
  borderRadius,
  spacing,
  borderForRank,
  rankBadgeBg,
  rankBadgeColor,
} from "./design-tokens";

describe("design-tokens", () => {
  describe("colors", () => {
    it("has expected color keys", () => {
      expect(colors.background).toBe("#000");
      expect(colors.surface).toBe("#e8e8e8");
      expect(colors.card).toBe("#f7f7f7");
      expect(colors.accent).toBe("#7c5cff");
      expect(colors.accent15).toBe("#7c5cff15");
      expect(colors.accent4d).toBe("#7c5cff4d");
      expect(colors.green).toBe("#16a34a");
      expect(colors.red).toBe("#dc2626");
      expect(colors.gold).toBe("#fbbf24");
      expect(colors.goldText).toBe("#c8961e");
      expect(colors.silver).toBe("#a1a1aa");
      expect(colors.bronze).toBe("#cd7f32");
    });

    it("has text color sub-object", () => {
      expect(colors.text.primary).toBe("#18181b");
      expect(colors.text.secondary).toBe("#3f3f46");
      expect(colors.text.muted).toBe("#a1a1aa");
      expect(colors.text.subtle).toBe("#71717a");
    });
  });

  describe("borderRadius", () => {
    it("has expected values", () => {
      expect(borderRadius.sm).toBe(4);
      expect(borderRadius.md).toBe(6);
      expect(borderRadius.lg).toBe(8);
      expect(borderRadius.xl).toBe(12);
      expect(borderRadius.xxl).toBe(20);
    });
  });

  describe("spacing", () => {
    it("has expected values", () => {
      expect(spacing.xs).toBe(4);
      expect(spacing.sm).toBe(8);
      expect(spacing.md).toBe(12);
      expect(spacing.lg).toBe(16);
      expect(spacing.xl).toBe(24);
      expect(spacing.xxl).toBe(32);
    });
  });

  describe("borderForRank", () => {
    it("returns gold for rank 1", () => {
      expect(borderForRank(1)).toBe(colors.gold);
    });

    it("returns silver for rank 2", () => {
      expect(borderForRank(2)).toBe(colors.silver);
    });

    it("returns bronze for rank 3", () => {
      expect(borderForRank(3)).toBe(colors.bronze);
    });

    it("returns accent4d for rank 4+", () => {
      expect(borderForRank(4)).toBe(colors.accent4d);
      expect(borderForRank(10)).toBe(colors.accent4d);
      expect(borderForRank(100)).toBe(colors.accent4d);
    });

    it("returns accent4d for rank 0 or negative", () => {
      expect(borderForRank(0)).toBe(colors.accent4d);
      expect(borderForRank(-1)).toBe(colors.accent4d);
    });
  });

  describe("rankBadgeBg", () => {
    it("returns accent for rank 1", () => {
      expect(rankBadgeBg(1)).toBe(colors.accent);
    });

    it("returns accent15 for ranks 2 and 3", () => {
      expect(rankBadgeBg(2)).toBe(colors.accent15);
      expect(rankBadgeBg(3)).toBe(colors.accent15);
    });

    it("returns #f4f4f5 for rank 4+", () => {
      expect(rankBadgeBg(4)).toBe("#f4f4f5");
    });

    it("returns accent15 for rank 0 (since 0 <= 3)", () => {
      expect(rankBadgeBg(0)).toBe(colors.accent15);
    });
  });

  describe("rankBadgeColor", () => {
    it("returns white for rank 1", () => {
      expect(rankBadgeColor(1)).toBe("#fff");
    });

    it("returns accent for ranks 2 and 3", () => {
      expect(rankBadgeColor(2)).toBe(colors.accent);
      expect(rankBadgeColor(3)).toBe(colors.accent);
    });

    it("returns text.subtle for rank 4+", () => {
      expect(rankBadgeColor(4)).toBe(colors.text.subtle);
    });

    it("returns accent for rank 0 (since 0 <= 3)", () => {
      expect(rankBadgeColor(0)).toBe(colors.accent);
    });
  });
});
