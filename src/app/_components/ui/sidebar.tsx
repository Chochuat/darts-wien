"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BarChart from "@mui/icons-material/BarChart";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import TrackChanges from "@mui/icons-material/TrackChanges";
import Info from "@mui/icons-material/Info";
import SportsEsports from "@mui/icons-material/SportsEsports";
import LoginIcon from "@mui/icons-material/Login";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Orbitron, Roboto_Condensed } from "next/font/google";
import { colors } from "@/lib/design-tokens";
import { createClient } from "@/lib/supabase/client";
import { LanguageSettings } from "./language-settings";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["700", "900"] });
const robotoCondensed = Roboto_Condensed({ subsets: ["latin"], weight: ["700"] });

/**
 * Fixed sidebar width in pixels (desktop navigation).
 */
export const SIDEBAR_WIDTH = 100;

/**
 * Single navigation link definition used by both main and admin sidebars.
 */
export interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * Props for the reusable Sidebar component.
 */
export interface SidebarProps {
  /** Navigation links to display. Defaults to main app links (Standings, Matches, etc.). */
  navLinks?: NavLink[];
  /** Custom header/logo content. Defaults to the DARTS WIEN brand logo. */
  logo?: React.ReactNode;
  /** Custom footer content. Defaults to login/dashboard link + language picker. */
  footer?: React.ReactNode;
  /** Sidebar width in pixels. Defaults to {@link SIDEBAR_WIDTH}. */
  width?: number;
}

/**
 * Reusable sidebar component that provides desktop navigation.
 *
 * Renders a fixed vertical sidebar with configurable logo, nav links, and footer.
 * Default props produce the main public app sidebar.
 *
 * @param props - Sidebar configuration.
 * @returns The rendered Sidebar component.
 */
const Sidebar = ({ navLinks, logo, footer, width = SIDEBAR_WIDTH }: SidebarProps) => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setLoggedIn(!!session);
    };
    void check();
  }, []);

  const defaultLinks: NavLink[] = [
    { label: t("nav.standings"), href: "/", icon: <BarChart sx={{ fontSize: "1.3rem" }} /> },
    { label: t("nav.matches"), href: "/matches", icon: <TrackChanges sx={{ fontSize: "1.3rem" }} /> },
    { label: t("nav.tournaments"), href: "/tournaments", icon: <EmojiEvents sx={{ fontSize: "1.3rem" }} /> },
    { label: t("nav.game"), href: "/game", icon: <SportsEsports sx={{ fontSize: "1.3rem" }} /> },
    { label: t("nav.about"), href: "/about", icon: <Info sx={{ fontSize: "1.3rem" }} /> },
  ];

  const defaultLogo = (
    <Link href="/" style={{ textDecoration: "none" }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
        <TrackChanges sx={{ color: colors.accent, fontSize: "1.5rem" }} />
        <Typography className={orbitron.className} sx={{ color: "#fff", fontWeight: 900, fontSize: "0.65rem", letterSpacing: 3, textTransform: "uppercase", textAlign: "center", lineHeight: 1.1 }}>
          DARTS<br />WIEN
        </Typography>
      </Box>
    </Link>
  );

  const defaultFooter = (
    <>
      <Link href={loggedIn ? "/admin" : "/admin/login"} style={{ textDecoration: "none", width: "100%" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, py: 0.75, cursor: "pointer", color: "rgba(255,255,255,0.3)", transition: "color 0.15s", "&:hover": { color: "rgba(255,255,255,0.55)" } }}>
          {loggedIn ? <DashboardIcon sx={{ fontSize: "1.1rem" }} /> : <LoginIcon sx={{ fontSize: "1.1rem" }} />}
          <Typography className={robotoCondensed.className} sx={{ fontWeight: 700, fontSize: "0.5rem", letterSpacing: 1, textTransform: "uppercase", lineHeight: 1, color: "inherit" }}>
            {loggedIn ? t("nav.dashboard") : t("nav.login")}
          </Typography>
        </Box>
      </Link>
      <LanguageSettings />
    </>
  );

  const links = navLinks ?? defaultLinks;
  const logoContent = logo ?? defaultLogo;
  const footerContent = footer ?? defaultFooter;

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", alignItems: "center", gap: 4.5, position: "fixed", left: 0, top: 0, bottom: 0, width, borderRight: "1px solid rgba(255,255,255,0.15)", zIndex: 1100, pt: 3 }}>
      {logoContent}

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        {links.map((link) => {
          const active = isActive(link.href);
          return (
            <Link href={link.href} key={link.href} style={{ textDecoration: "none" }}>
              <Box className={robotoCondensed.className} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.8, px: 2.5, py: 1, cursor: "pointer", position: "relative", color: active ? "#fff" : "rgba(255,255,255,0.3)", transition: "color 0.15s", width, "&:hover": { color: active ? "#fff" : "rgba(255,255,255,0.55)" }, "&::after": { content: '""', position: "absolute", left: 0, top: 0, width: 2, height: "100%", borderRadius: 1, bgcolor: active ? colors.accent : "transparent", transition: "background-color 0.2s" }, "&:hover::after": { bgcolor: active ? colors.accent : "rgba(255,255,255,0.15)" } }}>
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
      {footerContent}
    </Box>
  );
};

export default Sidebar;
