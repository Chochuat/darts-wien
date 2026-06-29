"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import ExpandMore from "@mui/icons-material/ExpandMore";
import SettingsIcon from "@mui/icons-material/Settings";
import { Roboto_Condensed } from "next/font/google";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";
import i18n, { SUPPORTED_LANGUAGES, LANG_LABELS } from "@/app/_i18n/i18n";
import type { SupportedLanguage } from "@/app/_i18n/i18n";

const robotoCondensed = Roboto_Condensed({ subsets: ["latin"], weight: ["700"] });

/**
 * Collapsible language picker shown at the bottom of the desktop sidebar.
 */
export const LanguageSettings = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { t } = useTranslation();
  const currentLang = i18n.language as SupportedLanguage;

  return (
    <Box sx={{ width: "100%", px: 1.5, pb: 2 }}>
      <Box
        className={robotoCondensed.className}
        onClick={() => setSettingsOpen(!settingsOpen)}
        sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, py: 0.75, cursor: "pointer", color: settingsOpen ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.3)", transition: "color 0.15s", "&:hover": { color: "rgba(255,255,255,0.55)" } }}
      >
        <SettingsIcon sx={{ fontSize: "1.1rem" }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.5rem", letterSpacing: 1, textTransform: "uppercase", lineHeight: 1, color: "inherit" }}>
            {t("nav.settings")}
          </Typography>
          <ExpandMore sx={{ fontSize: "0.65rem", color: "inherit", transition: "transform 0.25s", transform: settingsOpen ? "rotate(180deg)" : "none" }} />
        </Box>
      </Box>

      <Collapse in={settingsOpen} timeout={250}>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isCurrent = lang === currentLang;
            return (
              <Box
                className={robotoCondensed.className}
                key={lang}
                onClick={() => { void i18n.changeLanguage(lang); setSettingsOpen(false); }}
                sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 24, borderRadius: 0.5, cursor: "pointer", bgcolor: isCurrent ? colors.accent : "transparent", color: isCurrent ? "#fff" : "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: "0.6rem", letterSpacing: 1, transition: "all 0.15s", "&:hover": { bgcolor: isCurrent ? colors.accent : "rgba(255,255,255,0.1)", color: "#fff" } }}
              >
                {LANG_LABELS[lang]}
              </Box>
            );
          })}
        </Box>
      </Collapse>
    </Box>
  );
};
