"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import de from "./locales/de.json";
import sk from "./locales/sk.json";

export
/**
 * Language codes supported by the app, in cycle order for the language switcher.
 */
const SUPPORTED_LANGUAGES = ["en", "de", "sk"] as const;

/**
 * Supported language code derived from {@link SUPPORTED_LANGUAGES}.
 */
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export
/**
 * Language used on first load and when the requested language is unsupported.
 */
const DEFAULT_LANGUAGE: SupportedLanguage = "sk";

export
/**
 * Short uppercase labels shown in the language switcher, keyed by language code.
 */
const LANG_LABELS: Record<SupportedLanguage, string> = {
  en: "EN",
  de: "DE",
  sk: "SK",
};

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      sk: { translation: sk },
    },
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

/**
 * Resolves a language string to a supported language code.
 *
 * @param lang - The language code to resolve.
 */
export function resolveLanguage(lang: string | null): SupportedLanguage {
  if (lang && (SUPPORTED_LANGUAGES as readonly string[]).includes(lang)) {
    return lang as SupportedLanguage;
  }
  return DEFAULT_LANGUAGE;
}

export default i18n;