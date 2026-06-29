"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { colors } from "@/lib/design-tokens";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { createClient } from "@/lib/supabase/client";

interface MatchRow {
  id: number;
  match_type: string;
  status: string;
  player1_id: number | null;
  player2_id: number | null;
  legs_player1: number | null;
  legs_player2: number | null;
  legs_target: number;
  tournament_round_name: string | null;
  tournament_group_id: number | null;
}

const STATUS_COLORS: Record<string, "default" | "primary" | "success" | "warning"> = {
  pending: "warning",
  completed: "success",
  no_show: "default",
};

/**
 * Tournament matches list page. Shows all matches grouped by phase/round.
 */
const MatchesPage = () => {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const tournamentId = Number(params.id);

  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [playerMap, setPlayerMap] = useState<Map<number, string>>(new Map());
  const [groupLabels, setGroupLabels] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data: matchRows } = await supabase
      .from("matches")
      .select("id, match_type, status, player1_id, player2_id, legs_player1, legs_player2, legs_target, tournament_round_name, tournament_group_id")
      .eq("tournament_id", tournamentId)
      .order("match_type")
      .order("sort_order", { ascending: true, nullsFirst: false });

    const playerIds = new Set<number>();
    const groupIds = new Set<number>();
    for (const m of matchRows ?? []) {
      if (m.player1_id) playerIds.add(m.player1_id);
      if (m.player2_id) playerIds.add(m.player2_id);
      if (m.tournament_group_id) groupIds.add(m.tournament_group_id);
    }

    const ids = [...playerIds];
    const gIds = [...groupIds];

    const [playersRes, groupsRes] = await Promise.all([
      supabase.from("players").select("id, name").in("id", ids.length ? ids : [0]),
      supabase.from("tournament_groups").select("id, label").in("id", gIds.length ? gIds : [0]),
    ]);

    setPlayerMap(new Map((playersRes.data ?? []).map((p) => [p.id, p.name])));
    setGroupLabels(new Map((groupsRes.data ?? []).map((g) => [g.id, g.label])));
    setMatches((matchRows ?? []) as MatchRow[]);
    setLoading(false);
  }, [supabase, tournamentId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void fetchData(); }, [fetchData]);

  if (loading) return <Typography sx={{ color: "#fff" }}>Loading…</Typography>;

  const groupMatches = matches.filter((m) => m.match_type === "tournament_group");
  const playoffMatches = matches.filter((m) => m.match_type === "tournament_playoff");

  const playoffRounds = ["Quarter-Finals", "Semi-Finals", "3rd Place", "Final", "Consolation-SF", "5th Place", "7th Place"];

  const renderMatch = (m: MatchRow) => {
    const p1Name = m.player1_id ? (playerMap.get(m.player1_id) ?? "Unknown") : "TBD";
    const p2Name = m.player2_id ? (playerMap.get(m.player2_id) ?? "Unknown") : "TBD";
    const score = m.status !== "pending" ? `${m.legs_player1 ?? 0}-${m.legs_player2 ?? 0}` : "vs";
    const groupLabel = m.tournament_group_id ? groupLabels.get(m.tournament_group_id) : null;

    return (
      <Link href={`/admin/tournaments/${tournamentId}/matches/${m.id}`} key={m.id} style={{ textDecoration: "none" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderRadius: 1,
            bgcolor: "rgba(255,255,255,0.03)",
            cursor: "pointer",
            "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
            transition: "background 0.15s",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: 1 }}>
            {groupLabel ? (
              <Box sx={{ minWidth: 24, height: 24, borderRadius: 0.5, bgcolor: colors.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "#fff" }}>
                {groupLabel}
              </Box>
            ) : null}
            <Typography sx={{ color: "#fff", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p1Name} vs {p2Name}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography sx={{ color: m.status === "pending" ? "rgba(255,255,255,0.4)" : "#fff", fontSize: "0.85rem", fontWeight: 600 }}>
              {score}
            </Typography>
            <Chip
              color={STATUS_COLORS[m.status] ?? "default"}
              label={m.status === "no_show" ? "no-show" : m.status}
              size="small"
              sx={{ textTransform: "capitalize" }}
            />
          </Box>
        </Box>
      </Link>
    );
  };

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Button onClick={() => router.push(`/admin/tournaments/${tournamentId}`)} size="small" startIcon={<ArrowBackIcon />} sx={{ color: "rgba(255,255,255,0.5)", mb: 2, textTransform: "none" }} type="button">
        Back to Tournament
      </Button>

      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem", mb: 3 }}>
        Matches
      </Typography>

      {matches.length === 0 ? (
        <Typography sx={{ color: "rgba(255,255,255,0.4)" }}>No matches generated yet.</Typography>
      ) : null}

      {groupMatches.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ color: colors.accent, fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1, mb: 1 }}>
            Group Phase
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {groupMatches.map(renderMatch)}
          </Box>
        </Box>
      ) : null}

      {playoffMatches.length > 0 ? (
        <Box>
          <Typography sx={{ color: colors.accent, fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1, mb: 1 }}>
            Playoffs
          </Typography>
          {playoffRounds.map((roundName) => {
            const roundMatches = playoffMatches.filter((m) => m.tournament_round_name === roundName);
            if (roundMatches.length === 0) return null;
            return (
              <Box key={roundName} sx={{ mb: 2 }}>
                <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", fontWeight: 600, mb: 0.5 }}>
                  {roundName}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {roundMatches.map(renderMatch)}
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
};

export default MatchesPage;
