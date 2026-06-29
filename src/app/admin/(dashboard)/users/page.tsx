"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";
import { createClient } from "@/lib/supabase/client";

interface ProfileRow {
  user_id: string;
  role: string;
  player_id: number | null;
  display_name: string | null;
  created_at: string;
}

const darkField = {
  "& .MuiInputBase-root": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
  "& .MuiSelect-icon": { color: "rgba(255,255,255,0.5)" },
};

const ROLE_COLORS: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info"> = {
  admin: "success",
  scorekeeper: "primary",
  pending: "warning",
};

/**
 * Admin user management page. Shows all profiles and allows role changes.
 */
const UsersPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const supabase = createClient();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const roleLabels: Record<string, string> = {
    pending: t("admin.pending"),
    scorekeeper: t("admin.scorekeeper"),
    admin: t("admin.adminRole"),
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/admin/login"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!profile || profile.role !== "admin") { router.push("/admin/403"); return; }
      setIsAdmin(true);
    };
    void checkSession();
  }, [router, supabase]);

  const fetchProfiles = useCallback(async () => {
    const res = await fetch("/api/admin/profiles");
    if (!res.ok) {
      setError(t("admin.loadFailed"));
      setLoading(false);
      return;
    }
    const data = await res.json();
    setProfiles(data.profiles ?? []);
    setLoading(false);
  }, [t]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (isAdmin) void fetchProfiles(); }, [isAdmin, fetchProfiles]);

  const updateRole = async (userId: string, role: string) => {
    const res = await fetch(`/api/admin/profiles/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      setError(t("admin.updateFailed"));
      return;
    }
    void fetchProfiles();
  };

  if (loading || !isAdmin) return <Typography sx={{ color: "#fff" }}>{t("common.loading")}</Typography>;

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem", mb: 3 }}>
        {t("admin.users")}
      </Typography>

      {error ? <Typography sx={{ color: colors.red, mb: 2 }} variant="body2">{error}</Typography> : null}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {profiles.map((p) => (
          <Box
            key={p.user_id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1.5,
              borderRadius: 1,
              bgcolor: "rgba(255,255,255,0.03)",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 0, flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ color: "#fff", fontSize: "0.9rem", fontWeight: 600 }}>
                  {p.display_name ?? t("admin.unnamed")}
                </Typography>
                <Chip
                  color={ROLE_COLORS[p.role] ?? "default"}
                  label={roleLabels[p.role] ?? p.role}
                  size="small"
                  sx={{ textTransform: "capitalize" }}
                />
              </Box>
              <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>
                {p.user_id.slice(0, 8)}…
              </Typography>
            </Box>
            <TextField
              onChange={(e) => updateRole(p.user_id, e.target.value)}
              select
              size="small"
              sx={{ ...darkField, minWidth: 130 }}
              value={p.role}
            >
              <MenuItem value="pending">{t("admin.pending")}</MenuItem>
              <MenuItem value="scorekeeper">{t("admin.scorekeeper")}</MenuItem>
              <MenuItem value="admin">{t("admin.adminRole")}</MenuItem>
            </TextField>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default UsersPage;
