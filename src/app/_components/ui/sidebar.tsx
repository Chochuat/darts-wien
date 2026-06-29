"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BarChart from "@mui/icons-material/BarChart";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import TrackChanges from "@mui/icons-material/TrackChanges";
import Info from "@mui/icons-material/Info";
import SportsEsports from "@mui/icons-material/SportsEsports";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Orbitron, Roboto_Condensed } from "next/font/google";
import { colors } from "@/lib/design-tokens";
import { LanguageSettings } from "./language-settings";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["700", "900"] });
const robotoCondensed = Roboto_Condensed({ subsets: ["latin"], weight: ["700"] });

/**
 * Fixed sidebar width in pixels (desktop navigation).
 */
export const SIDEBAR_WIDTH = 100;

/**
 * Sidebar component that provides main navigation links.
 *
 * @returns The rendered Sidebar component.
 */
const Sidebar = () => {
  const pathname = usePathname();
  const { t } = useTranslation();

  const links = [
    { label: t("nav.standings"), href: "/", icon: <BarChart sx={{ fontSize: "1.3rem" }} /> },
    { label: t("nav.matches"), href: "/matches", icon: <TrackChanges sx={{ fontSize: "1.3rem" }} /> },
    { label: t("nav.tournaments"), href: "/tournaments", icon: <EmojiEvents sx={{ fontSize: "1.3rem" }} /> },
    { label: t("nav.game"), href: "/game", icon: <SportsEsports sx={{ fontSize: "1.3rem" }} /> },
    { label: t("nav.about"), href: "/about", icon: <Info sx={{ fontSize: "1.3rem" }} /> },
  ];

  return (
    <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", alignItems: "center", gap: 4.5, position: "fixed", left: 0, top: 0, bottom: 0, width: SIDEBAR_WIDTH, borderRight: "1px solid rgba(255,255,255,0.15)", zIndex: 1100, pt: 3 }}>
      <Link href="/" style={{ textDecoration: "none" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
          <TrackChanges sx={{ color: colors.accent, fontSize: "1.5rem" }} />
          <Typography className={orbitron.className} sx={{ color: "#fff", fontWeight: 900, fontSize: "0.65rem", letterSpacing: 3, textTransform: "uppercase", textAlign: "center", lineHeight: 1.1 }}>
            DARTS<br />WIEN
          </Typography>
        </Box>
      </Link>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/"));
          return (
            <Link href={link.href} key={link.href} style={{ textDecoration: "none" }}>
              <Box className={robotoCondensed.className} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.8, px: 2.5, py: 1, cursor: "pointer", position: "relative", color: isActive ? "#fff" : "rgba(255,255,255,0.3)", transition: "color 0.15s", width: SIDEBAR_WIDTH, "&:hover": { color: isActive ? "#fff" : "rgba(255,255,255,0.55)" }, "&::after": { content: '""', position: "absolute", left: 0, top: 0, width: 2, height: "100%", borderRadius: 1, bgcolor: isActive ? colors.accent : "transparent", transition: "background-color 0.2s" }, "&:hover::after": { bgcolor: isActive ? colors.accent : "rgba(255,255,255,0.15)" } }}>
                {link.icon}
                <Typography sx={{ fontWeight: 700, fontSize: "0.6rem", letterSpacing: 1, textTransform: "uppercase", lineHeight: 1, color: "inherit" }}>
                  {link.label}
                </Typography>
              </Box>
            </Link>
          );
        })}
      </Box>

      <Box sx={{ flex: 1 }} />
      <LanguageSettings />
    </Box>
  );
}

export default Sidebar;