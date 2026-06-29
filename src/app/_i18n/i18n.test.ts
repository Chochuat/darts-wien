import { describe, it, expect } from "vitest";
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANG_LABELS,
  resolveLanguage,
} from "./i18n";

describe("i18n", () => {
  describe("SUPPORTED_LANGUAGES", () => {
    it("contains three languages", () => {
      expect(SUPPORTED_LANGUAGES).toEqual(["en", "de", "sk"]);
    });
  });

  describe("DEFAULT_LANGUAGE", () => {
    it("is sk", () => {
      expect(DEFAULT_LANGUAGE).toBe("sk");
    });
  });

  describe("LANG_LABELS", () => {
    it("has labels for all supported languages", () => {
      expect(LANG_LABELS).toEqual({ en: "EN", de: "DE", sk: "SK" });
    });
  });

  describe("resolveLanguage", () => {
    it("returns lang when it is a supported language", () => {
      expect(resolveLanguage("en")).toBe("en");
      expect(resolveLanguage("de")).toBe("de");
      expect(resolveLanguage("sk")).toBe("sk");
    });

    it("returns DEFAULT_LANGUAGE for null input", () => {
      expect(resolveLanguage(null)).toBe("sk");
    });

    it("returns DEFAULT_LANGUAGE for unsupported language", () => {
      expect(resolveLanguage("fr")).toBe("sk");
      expect(resolveLanguage("")).toBe("sk");
    });
  });
});
