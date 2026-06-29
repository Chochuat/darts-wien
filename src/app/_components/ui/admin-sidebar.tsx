"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import { colors } from "@/lib/design-tokens";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import People from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import Logout from "@mui/icons-material/Logout";
import Home from "@mui/icons-material/Home";
import TrackChanges from "@mui/icons-material/TrackChanges";
import { Orbitron, Roboto_Condensed } from "next/font/google";
import type { AdminSessionResponse } from "@/lib/validation";
import Sidebar, { type NavLink, SIDEBAR_WIDTH } from "./sidebar";
import { useTranslation } from "react-i18next";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["700", "900"] });
const robotoCondensed = Roboto_Condensed({ subsets: ["latin"], weight: ["700"] });

interface AdminSidebarProps {
  session: AdminSessionResponse;
  pathname: string;
  onLogout: () => void;
}

/**
 * Admin dashboard sidebar that reuses the shared {@link Sidebar} component for
 * desktop, and provides its own compact top bar for mobile.
 *
 * @param props - Component properties (session, current pathname, logout handler).
 * @returns Rendered admin sidebar (desktop + mobile).
 */
const AdminSidebar = ({ session, pathname, onLogout }: AdminSidebarProps) => {
  const { t } = useTranslation();
  const isAdmin = session.role === "admin";

  const navLinks: NavLink[] = [
    { label: t("admin.tournaments"), href: "/admin/tournaments", icon: <EmojiEvents sx={{ fontSize: "1.3rem" }} /> },
    ...(isAdmin ? [{ label: t("admin.players"), href: "/admin/players", icon: <People sx={{ fontSize: "1.3rem" }} /> }] : []),
    ...(isAdmin ? [{ label: t("admin.users"), href: "/admin/users", icon: <PersonIcon sx={{ fontSize: "1.3rem" }} /> }] : []),
    { label: t("admin.home"), href: "/", icon: <Home sx={{ fontSize: "1.3rem" }} /> },
  ];

  const adminLogo = (
    <Link href="/admin" style={{ textDecoration: "none" }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
        <TrackChanges sx={{ color: colors.accent, fontSize: "1.5rem" }} />
        <Typography className={orbitron.className} sx={{ color: "#fff", fontWeight: 900, fontSize: "0.65rem", letterSpacing: 3, textTransform: "uppercase", textAlign: "center", lineHeight: 1.1 }}>
          {t("admin.adminTitle")}
        </Typography>
      </Box>
    </Link>
  );

  const adminFooter = (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75, py: 1, width: "100%" }}>
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          bgcolor: colors.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "#fff",
        }}
      >
        {session.displayName?.[0]?.toUpperCase() ?? "U"}
      </Box>
      <Typography className={robotoCondensed.className} sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.5rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", lineHeight: 1, textAlign: "center", maxWidth: SIDEBAR_WIDTH - 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {session.displayName ?? "User"}
      </Typography>
      <Button
        onClick={onLogout}
        size="small"
        sx={{ minWidth: 0, p: 0.5, color: "rgba(255,255,255,0.3)", "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.05)" } }}
        type="button"
        variant="text"
      >
        <Logout sx={{ fontSize: "0.9rem" }} />
      </Button>
    </Box>
  );

  return (
    <>
      {/* Desktop sidebar — reuses the shared Sidebar component */}
      <Sidebar
        footer={adminFooter}
        logo={adminLogo}
        navLinks={navLinks}
        width={SIDEBAR_WIDTH}
      />

      {/* Mobile top nav */}
      <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", width: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "0.85rem", letterSpacing: 2, textTransform: "uppercase" }}>
            {t("admin.adminTitle")}
          </Typography>
          <Button onClick={onLogout} size="small" sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }} type="button">
            {t("admin.logout")}
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5, px: 1, py: 1, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link href={link.href} key={link.href} style={{ textDecoration: "none" }}>
                <Typography sx={{ color: isActive ? "#fff" : "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 1, px: 1.5, py: 0.5, cursor: "pointer" }}>
                  {link.label}
                </Typography>
              </Link>
            );
          })}
        </Box>
      </Box>
    </>
  );
};

export default AdminSidebar;
