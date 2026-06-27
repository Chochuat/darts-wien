"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import i18n, { resolveLanguage } from "@/app/_i18n/i18n";

export default function LocaleProvider() {
  const params = useSearchParams();
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const lang = resolveLanguage(params.get("lang"));
    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }
  }, [params]);

  return null;
}