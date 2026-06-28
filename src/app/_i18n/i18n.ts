"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import de from "./locales/de.json";
import sk from "./locales/sk.json";

export 
/**
 * SUPPORTED_LANGUAGES component.
 */
const SUPPORTED_LANGUAGES = ["en", "de", "sk"] as const;

/**
 * SupportedLanguage component.
 */
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export 
/**
 * DEFAULT_LANGUAGE component.
 */
const DEFAULT_LANGUAGE: SupportedLanguage = "sk";

export 
/**
 * LANG_LABELS component.
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
 * @param lang - The language code to resolve.
 */
export function resolveLanguage(lang: string | null): SupportedLanguage {
  if (lang && (SUPPORTED_LANGUAGES as readonly string[]).includes(lang)) {
    return lang as SupportedLanguage;
  }
  return DEFAULT_LANGUAGE;
}

export default i18n;