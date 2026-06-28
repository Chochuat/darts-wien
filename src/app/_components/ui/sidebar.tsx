"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import ExpandMore from "@mui/icons-material/ExpandMore";
import BarChart from "@mui/icons-material/BarChart";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import TrackChanges from "@mui/icons-material/TrackChanges";
import Info from "@mui/icons-material/Info";
import SportsEsports from "@mui/icons-material/SportsEsports";
import SettingsIcon from "@mui/icons-material/Settings";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Orbitron, Roboto_Condensed } from "next/font/google";
import { colors } from "@/lib/design-tokens";
import i18n, { SUPPORTED_LANGUAGES, LANG_LABELS } from "@/app/_i18n/i18n";
import type { SupportedLanguage } from "@/app/_i18n/i18n";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["700", "900"] });
const robotoCondensed = Roboto_Condensed({ subsets: ["latin"], weight: ["700"] });

export const SIDEBAR_WIDTH = 100;

const Sidebar = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const currentLang = i18n.language as SupportedLanguage;

  const links = [
    { label: t("nav.standings"), href: "/", icon: <BarChart sx={{ fontSize: "1.3rem" }} /> },
    { label: t("nav.matches"), href: "/matches", icon: <TrackChanges sx={{ fontSize: "1.3rem" }} /> },
    { label: t("nav.tournaments"), href: "/tournaments", icon: <EmojiEvents sx={{ fontSize: "1.3rem" }} /> },
    { label: t("nav.game"), href: "/game", icon: <SportsEsports sx={{ fontSize: "1.3rem" }} /> },
    { label: t("nav.about"), href: "/about", icon: <Info sx={{ fontSize: "1.3rem" }} /> },
  ];

  return (
    <Box
      sx={{
        display: { xs: "none", lg: "flex" },
        flexDirection: "column",
        alignItems: "center",
        gap: 4.5,
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        borderRight: "1px solid rgba(255,255,255,0.15)",
        zIndex: 1100,
        pt: 3,
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
          <TrackChanges sx={{ color: colors.accent, fontSize: "1.5rem" }} />
          <Typography
            className={orbitron.className}
            sx={{
              color: "#fff",
              fontWeight: 900,
              fontSize: "0.65rem",
              letterSpacing: 3,
              textTransform: "uppercase",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            DARTS
            <br />
            WIEN
          </Typography>
        </Box>
      </Link>

      {/* Nav */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/"));

          return (
            <Link href={link.href} key={link.href} style={{ textDecoration: "none" }}>
              <Box
                className={robotoCondensed.className}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.8,
                  px: 2.5,
                  py: 1,
                  cursor: "pointer",
                  position: "relative",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.3)",
                  transition: "color 0.15s",
                  width: SIDEBAR_WIDTH,
                  "&:hover": {
                    color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: 2,
                    height: "100%",
                    borderRadius: 1,
                    bgcolor: isActive ? colors.accent : "transparent",
                    transition: "background-color 0.2s",
                  },
                  "&:hover::after": {
                    bgcolor: isActive ? colors.accent : "rgba(255,255,255,0.15)",
                  },
                }}
              >
                {link.icon}
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.6rem",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    lineHeight: 1,
                    color: "inherit",
                  }}
                >
                  {link.label}
                </Typography>
              </Box>
            </Link>
          );
        })}
      </Box>

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Language settings */}
      <Box sx={{ width: "100%", px: 1.5, pb: 2 }}>
        <Box
          className={robotoCondensed.className}
          onClick={() => setSettingsOpen(!settingsOpen)}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
            py: 0.75,
            cursor: "pointer",
            color: settingsOpen ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.3)",
            transition: "color 0.15s",
            "&:hover": { color: "rgba(255,255,255,0.55)" },
          }}
        >
          <SettingsIcon sx={{ fontSize: "1.1rem" }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.5rem",
                letterSpacing: 1,
                textTransform: "uppercase",
                lineHeight: 1,
                color: "inherit",
              }}
            >
              {t("nav.settings")}
            </Typography>
            <ExpandMore
              sx={{
                fontSize: "0.65rem",
                color: "inherit",
                transition: "transform 0.25s",
                transform: settingsOpen ? "rotate(180deg)" : "none",
              }}
            />
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
                  onClick={() => {
                    void i18n.changeLanguage(lang);
                    setSettingsOpen(false);
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 24,
                    borderRadius: 0.5,
                    cursor: "pointer",
                    bgcolor: isCurrent ? colors.accent : "transparent",
                    color: isCurrent ? "#fff" : "rgba(255,255,255,0.4)",
                    fontWeight: 700,
                    fontSize: "0.6rem",
                    letterSpacing: 1,
                    transition: "all 0.15s",
                    "&:hover": {
                      bgcolor: isCurrent ? colors.accent : "rgba(255,255,255,0.1)",
                      color: "#fff",
                    },
                  }}
                >
                  {LANG_LABELS[lang]}
                </Box>
              );
            })}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}

export default Sidebar;
