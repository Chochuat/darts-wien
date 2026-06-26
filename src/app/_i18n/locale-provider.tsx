"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import i18n, { resolveLanguage, DEFAULT_LANGUAGE } from "@/app/_i18n/i18n";

export default function LocaleProvider() {
  const params = useSearchParams();

  useEffect(() => {
    const lang = resolveLanguage(params.get("lang"));
    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }
  }, [params]);

  useEffect(() => {
    if (i18n.language !== DEFAULT_LANGUAGE) {
      void i18n.changeLanguage(DEFAULT_LANGUAGE);
    }
  }, []);

  return null;
}