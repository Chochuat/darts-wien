"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Link from "next/link";
import AddIcon from "@mui/icons-material/Add";
import { colors } from "@/lib/design-tokens";
import { createClient } from "@/lib/supabase/client";
import { AdminSessionResponse } from "@/lib/validation";

interface TournamentListItem {
  id: number;
  week_number: number;
  date: string;
  type: string;
  status: string;
  season_id: number;
}

const STATUS_COLORS: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info"> = {
  registration: "warning",
  ready: "info",
  in_progress: "primary",
  completed: "success",
};

/**
 * Admin tournament list page. Shows all tournaments in the active season.
 */
const TournamentsPage = () => {
  const router = useRouter();
  const supabase = createClient();
  const [tournaments, setTournaments] = useState<TournamentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<AdminSessionResponse | null>(null);

  const fetchSession = useCallback(async () => {
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
    if (parsed.success) setSession(parsed.data);

    return profile;
  }, [router, supabase]);

  const fetchTournaments = useCallback(async () => {
    const { data: seasons } = await supabase
      .from("seasons")
      .select("id, is_active")
      .eq("is_active", true)
      .maybeSingle();

    const sid = seasons?.id;
    if (!sid) {
      setError("No active season found");
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("tournaments")
      .select("id, week_number, date, type, status, season_id")
      .eq("season_id", sid)
      .order("week_number");

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setTournaments((data ?? []) as TournamentListItem[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void (async () => {
      await fetchSession();
      await fetchTournaments();
    })();
  }, [fetchSession, fetchTournaments]);

  if (loading) {
    return (
      <Typography sx={{ color: "#fff" }}>Loading…</Typography>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography sx={{ color: colors.red }}>{error}</Typography>
      </Box>
    );
  }

  const isAdmin = session?.role === "admin";
  const isScorekeeper = session?.role === "scorekeeper";

  const visibleTournaments = isScorekeeper
    ? tournaments.filter((t) => t.status === "in_progress" || t.status === "ready" || t.status === "completed")
    : tournaments;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
          Tournaments
        </Typography>
        {isAdmin ? (
          <Link href="/admin/tournaments/new">
            <Button startIcon={<AddIcon />} type="button" variant="contained">
              New Tournament
            </Button>
          </Link>
        ) : null}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {visibleTournaments.length === 0 ? (
          <Typography sx={{ color: "rgba(255,255,255,0.5)" }}>No tournaments yet.</Typography>
        ) : null}

        {visibleTournaments.map((t) => (
          <Link href={`/admin/tournaments/${t.id}`} key={t.id} style={{ textDecoration: "none" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2.5,
                py: 2,
                borderRadius: 1.5,
                bgcolor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                cursor: "pointer",
                transition: "all 0.15s",
                "&:hover": { bgcolor: "rgba(255,255,255,0.07)", borderColor: "rgba(124,92,255,0.3)" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1,
                    bgcolor: t.type === "grand_final" ? colors.gold : colors.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "#fff",
                  }}
                >
                  {t.week_number}
                </Box>
                <Box>
                  <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>
                    {t.type === "grand_final" ? "Grand Final" : `Week ${t.week_number}`}
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>
                    {t.date}
                  </Typography>
                </Box>
              </Box>
              <Chip
                color={STATUS_COLORS[t.status] ?? "default"}
                label={t.status.replace("_", " ")}
                size="small"
                sx={{ textTransform: "capitalize" }}
              />
            </Box>
          </Link>
        ))}
      </Box>
    </Box>
  );
};

export default TournamentsPage;
