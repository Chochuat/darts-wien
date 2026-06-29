"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import SettingsIcon from "@mui/icons-material/Settings";
import { Roboto_Condensed } from "next/font/google";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";
import i18n, { SUPPORTED_LANGUAGES, LANG_LABELS } from "@/app/_i18n/i18n";
import type { SupportedLanguage } from "@/app/_i18n/i18n";

const robotoCondensed = Roboto_Condensed({ subsets: ["latin"], weight: ["700"] });

/**
 * Language picker popup at the bottom of the desktop sidebar.
 */
export const LanguageSettings = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const { t } = useTranslation();
  const currentLang = i18n.language as SupportedLanguage;

  return (
    <Box sx={{ width: "100%", px: 1.5, pb: 2 }}>
      <Box
        className={robotoCondensed.className}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, py: 0.75, cursor: "pointer", color: open ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.3)", transition: "color 0.15s", "&:hover": { color: "rgba(255,255,255,0.55)" } }}
      >
        <SettingsIcon sx={{ fontSize: "1.1rem" }} />
        <Typography sx={{ fontWeight: 700, fontSize: "0.5rem", letterSpacing: 1, textTransform: "uppercase", lineHeight: 1, color: "inherit" }}>
          {t("nav.settings")}
        </Typography>
      </Box>

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "center", horizontal: "right" }}
        onClose={() => setAnchorEl(null)}
        open={open}
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#1a1a2e",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 1,
              minWidth: 60,
            },
          },
        }}
        transformOrigin={{ vertical: "center", horizontal: "left" }}
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isCurrent = lang === currentLang;
          return (
            <MenuItem
              className={robotoCondensed.className}
              key={lang}
              onClick={() => { void i18n.changeLanguage(lang); setAnchorEl(null); }}
              selected={isCurrent}
              sx={{
                fontWeight: 700,
                fontSize: "0.75rem",
                letterSpacing: 1,
                textTransform: "uppercase",
                color: isCurrent ? "#fff" : "rgba(255,255,255,0.4)",
                bgcolor: isCurrent ? colors.accent : "transparent",
                "&:hover": {
                  bgcolor: isCurrent ? colors.accent : "rgba(255,255,255,0.1)",
                  color: "#fff",
                },
                "&.Mui-selected": {
                  bgcolor: colors.accent,
                  color: "#fff",
                  "&:hover": { bgcolor: colors.accent },
                },
              }}
            >
              {LANG_LABELS[lang]}
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};
