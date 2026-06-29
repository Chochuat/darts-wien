"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { colors } from "@/lib/design-tokens";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import People from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import Logout from "@mui/icons-material/Logout";
import { AdminSessionResponse } from "@/lib/validation";

interface SessionData {
  userId: string;
  role: "pending" | "scorekeeper" | "admin";
  playerId: number | null;
  displayName: string | null;
}

/**
 * Admin dashboard layout with sidebar navigation and top bar.
 *
 * @param props - Component properties.
 */
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, role, player_id, display_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile || (profile.role !== "admin" && profile.role !== "scorekeeper")) {
        router.push("/admin/403");
        return;
      }

      const parsed = AdminSessionResponse.safeParse({
        userId: profile.user_id,
        role: profile.role,
        playerId: profile.player_id,
        displayName: profile.display_name,
      });

      if (parsed.success) {
        setSession(parsed.data);
      }
      setLoading(false);
    };
    void fetchSession();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  if (loading || !session) {
    return (
      <Box sx={{ bgcolor: colors.background, minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ color: "#fff" }}>Loading…</Typography>
      </Box>
    );
  }

  const isAdmin = session.role === "admin";

  const navLinks = [
    { label: "Tournaments", href: "/admin/tournaments", icon: <EmojiEvents sx={{ fontSize: "1.3rem" }} />, show: true },
    { label: "Players", href: "/admin/players", icon: <People sx={{ fontSize: "1.3rem" }} />, show: isAdmin },
    { label: "Users", href: "/admin/users", icon: <PersonIcon sx={{ fontSize: "1.3rem" }} />, show: isAdmin },
  ].filter((l) => l.show);

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: "100dvh", display: "flex" }}>
      {/* Sidebar */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          width: 220,
          minWidth: 220,
          borderRight: "1px solid rgba(255,255,255,0.1)",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1100,
          bgcolor: "#0a0a0a",
        }}
      >
        <Box sx={{ px: 2.5, py: 2.5, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Link href="/admin" style={{ textDecoration: "none" }}>
            <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "0.9rem", letterSpacing: 2, textTransform: "uppercase" }}>
              darts wien
            </Typography>
            <Typography sx={{ color: colors.accent, fontSize: "0.65rem", letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>
              Admin Panel
            </Typography>
          </Link>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, p: 1.5, flex: 1 }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link href={link.href} key={link.href} style={{ textDecoration: "none" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.25,
                    borderRadius: 1,
                    cursor: "pointer",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                    bgcolor: isActive ? "rgba(124,92,255,0.12)" : "transparent",
                    transition: "all 0.15s",
                    "&:hover": {
                      bgcolor: isActive ? "rgba(124,92,255,0.18)" : "rgba(255,255,255,0.05)",
                      color: "#fff",
                    },
                  }}
                >
                  {link.icon}
                  <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                    {link.label}
                  </Typography>
                </Box>
              </Link>
            );
          })}
        </Box>

        <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: colors.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {session.displayName?.[0]?.toUpperCase() ?? "U"}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ color: "#fff", fontSize: "0.8rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.displayName ?? "User"}
              </Typography>
              <Typography sx={{ color: colors.accent, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                {session.role}
              </Typography>
            </Box>
          </Box>
          <Button
            fullWidth
            onClick={handleLogout}
            size="small"
            startIcon={<Logout sx={{ fontSize: "1rem" }} />}
            sx={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.75rem",
              textTransform: "none",
              justifyContent: "flex-start",
              "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.05)" },
            }}
            type="button"
            variant="text"
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Mobile top nav */}
      <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", width: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "0.85rem", letterSpacing: 2, textTransform: "uppercase" }}>
            Admin
          </Typography>
          <Button onClick={handleLogout} size="small" sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }} type="button">
            Logout
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

      {/* Main content */}
      <Box sx={{ flex: 1, ml: { md: "220px" }, minHeight: "100dvh" }}>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
