"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { colors } from "@/lib/design-tokens";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { createClient } from "@/lib/supabase/client";

interface SnapshotRow {
  player_id: number;
  rank: number;
  points: number;
  leg_diff: number;
  legs_won: number;
  legs_lost: number;
  one80s: number;
}

/**
 * Tournament standings snapshot page. Shows the standings captured at generation time.
 */
const StandingsPage = () => {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const tournamentId = Number(params.id);

  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
  const [playerMap, setPlayerMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data: snaps } = await supabase
      .from("tournament_standings_snapshot")
      .select("player_id, rank, points, leg_diff, legs_won, legs_lost, one80s")
      .eq("tournament_id", tournamentId)
      .order("rank");

    const playerIds = (snaps ?? []).map((s) => s.player_id);
    const { data: players } = await supabase
      .from("players")
      .select("id, name")
      .in("id", playerIds.length ? playerIds : [0]);

    setPlayerMap(new Map((players ?? []).map((p) => [p.id, p.name])));
    setSnapshots((snaps ?? []) as SnapshotRow[]);
    setLoading(false);
  }, [supabase, tournamentId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void fetchData(); }, [fetchData]);

  if (loading) return <Typography sx={{ color: "#fff" }}>Loading…</Typography>;

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Button onClick={() => router.push(`/admin/tournaments/${tournamentId}`)} size="small" startIcon={<ArrowBackIcon />} sx={{ color: "rgba(255,255,255,0.5)", mb: 2, textTransform: "none" }} type="button">
        Back to Tournament
      </Button>

      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem", mb: 1 }}>
        Standings Snapshot
      </Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", mb: 3 }}>
        Rankings at the time of group generation
      </Typography>

      {snapshots.length === 0 ? (
        <Typography sx={{ color: "rgba(255,255,255,0.4)" }}>No snapshot available.</Typography>
      ) : null}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {snapshots.map((s) => (
          <Box
            key={s.player_id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: 2,
              py: 1.5,
              borderRadius: 1,
              bgcolor: s.rank <= 2 ? "rgba(124,92,255,0.08)" : "rgba(255,255,255,0.03)",
            }}
          >
            <Box
              sx={{
                minWidth: 28,
                height: 28,
                borderRadius: "50%",
                bgcolor: s.rank === 1 ? colors.gold : s.rank === 2 ? colors.silver : s.rank === 3 ? colors.bronze : "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {s.rank}
            </Box>
            <Typography sx={{ color: "#fff", flex: 1, fontSize: "0.9rem" }}>
              {playerMap.get(s.player_id) ?? "Unknown"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>
              {s.points}pts · {s.leg_diff > 0 ? "+" : ""}{s.leg_diff} diff · {s.one80s}×180
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default StandingsPage;
