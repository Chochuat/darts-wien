"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import { colors } from "@/lib/design-tokens";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { createClient } from "@/lib/supabase/client";

interface MatchData {
  id: number;
  status: string;
  player1_id: number | null;
  player2_id: number | null;
  legs_player1: number | null;
  legs_player2: number | null;
  legs_target: number;
  player1_180: number;
  player2_180: number;
  no_show_player_id: number | null;
  match_type: string;
}

const darkField = {
  "& .MuiInputBase-root": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
  "& .MuiSelect-icon": { color: "rgba(255,255,255,0.5)" },
};

/**
 * Match result entry page. Allows recording legs, 180s, or marking no-show.
 */
const MatchEntryPage = () => {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const tournamentId = Number(params.id);
  const matchId = Number(params.matchId);

  const [match, setMatch] = useState<MatchData | null>(null);
  const [p1Name, setP1Name] = useState("TBD");
  const [p2Name, setP2Name] = useState("TBD");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [legsP1, setLegsP1] = useState("0");
  const [legsP2, setLegsP2] = useState("0");
  const [p180, setP180] = useState("0");
  const [p280, setP280] = useState("0");
  const [noShowPlayer, setNoShowPlayer] = useState("");

  const fetchMatch = useCallback(async () => {
    const { data: m, error: mErr } = await supabase
      .from("matches")
      .select("id, status, player1_id, player2_id, legs_player1, legs_player2, legs_target, player1_180, player2_180, no_show_player_id, match_type")
      .eq("id", matchId)
      .single();

    if (mErr || !m) {
      setError("Match not found");
      setLoading(false);
      return;
    }

    const matchData = m as MatchData;
    setMatch(matchData);

    if (matchData.player1_id) {
      const { data: p1 } = await supabase.from("players").select("name").eq("id", matchData.player1_id).single();
      if (p1) setP1Name(p1.name);
    }
    if (matchData.player2_id) {
      const { data: p2 } = await supabase.from("players").select("name").eq("id", matchData.player2_id).single();
      if (p2) setP2Name(p2.name);
    }

    setLegsP1(String(matchData.legs_player1 ?? 0));
    setLegsP2(String(matchData.legs_player2 ?? 0));
    setP180(String(matchData.player1_180 ?? 0));
    setP280(String(matchData.player2_180 ?? 0));

    setLoading(false);
  }, [supabase, matchId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void fetchMatch(); }, [fetchMatch]);

  const handleSaveResult = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const res = await fetch(`/api/admin/matches/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        legs_player1: Number(legsP1),
        legs_player2: Number(legsP2),
        player1_180: Number(p180),
        player2_180: Number(p280),
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed" }));
      setError(err.error ?? "Failed to save result");
      return;
    }

    setSuccess("Result saved successfully.");
    void fetchMatch();
  };

  const handleNoShow = async () => {
    if (!noShowPlayer) {
      setError("Select which player did not show");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);

    const res = await fetch(`/api/admin/matches/${matchId}/no-show`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ no_show_player_id: Number(noShowPlayer) }),
    });

    setSaving(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed" }));
      setError(err.error ?? "Failed to mark no-show");
      return;
    }

    setSuccess("No-show recorded.");
    void fetchMatch();
  };

  if (loading) return <Typography sx={{ color: "#fff" }}>Loading…</Typography>;
  if (!match) return <Typography sx={{ color: colors.red }}>{error ?? "Error"}</Typography>;

  const isPending = match.status === "pending";
  const isLocked = !isPending;
  const hasPlayers = match.player1_id !== null && match.player2_id !== null;

  return (
    <Box sx={{ maxWidth: 500 }}>
      <Button onClick={() => router.push(`/admin/tournaments/${tournamentId}/matches`)} size="small" startIcon={<ArrowBackIcon />} sx={{ color: "rgba(255,255,255,0.5)", mb: 2, textTransform: "none" }} type="button">
        Back to Matches
      </Button>

      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem", mb: 1 }}>
        Match Result
      </Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", mb: 3 }}>
        First to {match.legs_target} legs
      </Typography>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

      {isLocked ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          This match is {match.status === "no_show" ? "a no-show" : "completed"} and cannot be edited.
        </Alert>
      ) : null}

      <Box sx={{ p: 2.5, borderRadius: 1.5, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography sx={{ color: "#fff", fontWeight: 600 }}>{p1Name}</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>vs</Typography>
          <Typography sx={{ color: "#fff", fontWeight: 600 }}>{p2Name}</Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            disabled={isLocked || !hasPlayers}
            fullWidth
            label={`${p1Name} — Legs`}
            onChange={(e) => setLegsP1(e.target.value)}
            sx={darkField}
            size="small"
            type="number"
            value={legsP1}
          />
          <TextField
            disabled={isLocked || !hasPlayers}
            fullWidth
            label={`${p2Name} — Legs`}
            onChange={(e) => setLegsP2(e.target.value)}
            sx={darkField}
            size="small"
            type="number"
            value={legsP2}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            disabled={isLocked || !hasPlayers}
            fullWidth
            label={`${p1Name} — 180s`}
            onChange={(e) => setP180(e.target.value)}
            sx={darkField}
            size="small"
            type="number"
            value={p180}
          />
          <TextField
            disabled={isLocked || !hasPlayers}
            fullWidth
            label={`${p2Name} — 180s`}
            onChange={(e) => setP280(e.target.value)}
            sx={darkField}
            size="small"
            type="number"
            value={p280}
          />
        </Box>

        <Button
          disabled={isLocked || !hasPlayers || saving}
          fullWidth
          onClick={handleSaveResult}
          type="button"
          variant="contained"
        >
          {saving ? "Saving…" : "Save Result"}
        </Button>
      </Box>

      {isPending && hasPlayers ? (
        <Box sx={{ p: 2.5, borderRadius: 1.5, bgcolor: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)" }}>
          <Typography sx={{ color: colors.red, fontWeight: 600, fontSize: "0.9rem", mb: 1.5 }}>
            No-Show (Walkover)
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <TextField
              fullWidth
              label="No-show player"
              onChange={(e) => setNoShowPlayer(e.target.value)}
              select
              sx={darkField}
              size="small"
              value={noShowPlayer}
            >
              <MenuItem value={match.player1_id ?? ""}>{p1Name}</MenuItem>
              <MenuItem value={match.player2_id ?? ""}>{p2Name}</MenuItem>
            </TextField>
            <Button
              color="error"
              disabled={saving || !noShowPlayer}
              onClick={handleNoShow}
              type="button"
              variant="outlined"
            >
              Mark
            </Button>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export default MatchEntryPage;
