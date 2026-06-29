"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { colors } from "@/lib/design-tokens";
import { AdminSessionResponse } from "@/lib/validation";
import AdminSidebar from "@/app/_components/ui/admin-sidebar";
import { SIDEBAR_WIDTH } from "@/app/_components/ui/sidebar";
import { useTranslation } from "react-i18next";

/**
 * Admin dashboard layout with sidebar navigation and top bar.
 *
 * @param props - Component properties.
 */
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [session, setSession] = useState<AdminSessionResponse | null>(null);
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
        <Typography sx={{ color: "#fff" }}>{t("common.loading")}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: "100dvh", display: "flex" }}>
      <AdminSidebar
        onLogout={handleLogout}
        pathname={pathname}
        session={session}
      />

      {/* Main content */}
      <Box sx={{ flex: 1, ml: { md: `${SIDEBAR_WIDTH}px` }, minHeight: "100dvh" }}>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
