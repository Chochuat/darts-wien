"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TrackChanges from "@mui/icons-material/TrackChanges";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Orbitron, Roboto_Condensed } from "next/font/google";
import { colors } from "@/lib/design-tokens";
import i18n, { SUPPORTED_LANGUAGES, LANG_LABELS } from "@/app/_i18n/i18n";
import type { SupportedLanguage } from "@/app/_i18n/i18n";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["700", "900"] });
const robotoCondensed = Roboto_Condensed({ subsets: ["latin"], weight: ["700"] });

const AppBar = () => {
  const pathname = usePathname();
  const { t } = useTranslation();

  const tabs = [
    { label: t("nav.standings"), href: "/" },
    { label: t("nav.matches"), href: "/matches" },
    { label: t("nav.tournaments"), href: "/tournaments" },
    { label: t("nav.game"), href: "/game" },
    { label: t("nav.about"), href: "/about" },
  ];

  const cycleLang = () => {
    const current = i18n.language as SupportedLanguage;
    const idx = SUPPORTED_LANGUAGES.indexOf(current);
    const next = SUPPORTED_LANGUAGES[(idx + 1) % SUPPORTED_LANGUAGES.length];
    void i18n.changeLanguage(next);
  };

  return (
    <Box
      sx={{
        display: { xs: "flex", lg: "none" },
        flexDirection: "column",
        alignItems: "center",
        px: 2,
        pt: 1.5,
        pb: 1,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <TrackChanges sx={{ color: colors.accent, fontSize: "1.2rem" }} />
            <Typography
              className={orbitron.className}
              sx={{
                color: "#fff",
                fontWeight: 900,
                fontSize: "0.9rem",
                letterSpacing: 5,
                textTransform: "uppercase",
              }}
            >
              darts wien
            </Typography>
          </Box>
        </Link>

        <Box
          className={robotoCondensed.className}
          onClick={cycleLang}
          sx={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: 1,
            cursor: "pointer",
            px: 1,
            py: 0.25,
            borderRadius: 0.5,
            transition: "all 0.15s",
            "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
          }}
        >
          {LANG_LABELS[i18n.language as SupportedLanguage] ?? "SK"}
        </Box>
      </Box>

      {/* Tabs — mobile only */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, width: "100%" }}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href + "/"));

          return (
            <Link href={tab.href} key={tab.href} style={{ textDecoration: "none" }}>
              <Box
                className={robotoCondensed.className}
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  px: 1.5,
                  py: 0.5,
                  cursor: "pointer",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: 2,
                    borderRadius: 1,
                    bgcolor: isActive ? colors.accent : "transparent",
                    transition: "background-color 0.2s",
                  },
                }}
              >
                {tab.label}
              </Box>
            </Link>
          );
        })}
      </Box>
    </Box>
  );
}

export default AppBar;
