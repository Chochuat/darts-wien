"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import { colors } from "@/lib/design-tokens";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "react-i18next";

interface Player { id: number; name: string; slug: string; }
interface Registration { player_id: number; checked_in: boolean; }

/**
 * Tournament registrations management page.
 */
const RegistrationsPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const tournamentId = Number(params.id);

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [playerMap, setPlayerMap] = useState<Map<number, Player>>(new Map());
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const { data: regs } = await supabase
      .from("tournament_registrations")
      .select("player_id, checked_in")
      .eq("tournament_id", tournamentId);

    const { data: players } = await supabase
      .from("players")
      .select("id, name, slug")
      .order("name");

    const pMap = new Map((players ?? []).map((p) => [p.id, p]));
    setRegistrations((regs ?? []) as Registration[]);
    setAllPlayers((players ?? []) as Player[]);
    setPlayerMap(pMap);
    setLoading(false);
  }, [supabase, tournamentId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void fetchData(); }, [fetchData]);

  const registeredIds = new Set(registrations.map((r) => r.player_id));
  const availablePlayers = allPlayers.filter((p) => !registeredIds.has(p.id));

  const addPlayer = async () => {
    if (!selectedPlayer) return;
    setError(null);
    const res = await fetch(`/api/tournaments/${tournamentId}/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: Number(selectedPlayer) }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: t("admin.failedToAddPlayer") }));
      setError(err.error ?? t("admin.failedToAddPlayer"));
      return;
    }
    setSelectedPlayer("");
    void fetchData();
  };

  const removePlayer = async (playerId: number) => {
    setError(null);
    const res = await fetch(`/api/tournaments/${tournamentId}/registrations/${playerId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: t("admin.failedToRemovePlayer") }));
      setError(err.error ?? t("admin.failedToRemovePlayer"));
      return;
    }
    void fetchData();
  };

  const toggleCheckIn = async (playerId: number, checkedIn: boolean) => {
    await fetch(`/api/tournaments/${tournamentId}/registrations/${playerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkedIn }),
    });
    void fetchData();
  };

  if (loading) return <Typography sx={{ color: "#fff" }}>{t("common.loading")}</Typography>;

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Button onClick={() => router.push(`/admin/tournaments/${tournamentId}`)} size="small" startIcon={<ArrowBackIcon />} sx={{ color: "rgba(255,255,255,0.5)", mb: 2, textTransform: "none" }} type="button">
        {t("admin.backToTournament")}
      </Button>

      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem", mb: 1 }}>
        {t("admin.registrations")}
      </Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", mb: 3 }}>
        {t("admin.playerRegistrations", { count: registrations.length })}
      </Typography>

      {error ? <Typography sx={{ color: colors.red, mb: 2 }} variant="body2">{error}</Typography> : null}

      {availablePlayers.length > 0 ? (
        <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
          <Box
            component="select"
            onChange={(e) => setSelectedPlayer(e.target.value)}
            sx={{
              flex: 1,
              bgcolor: "rgba(255,255,255,0.06)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 1,
              px: 1.5,
              py: 1,
              fontSize: "0.9rem",
            }}
            value={selectedPlayer}
          >
            <option value="">{t("admin.selectPlayer")}</option>
            {availablePlayers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Box>
          <Button disabled={!selectedPlayer} onClick={addPlayer} size="small" startIcon={<AddIcon />} type="button" variant="contained">
            {t("admin.add")}
          </Button>
        </Box>
      ) : null}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {registrations.length === 0 ? (
          <Typography sx={{ color: "rgba(255,255,255,0.4)" }}>{t("admin.noPlayersRegistered")}</Typography>
        ) : null}

        {registrations.map((reg) => {
          const player = playerMap.get(reg.player_id);
          return (
            <Box
              key={reg.player_id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1.5,
                borderRadius: 1,
                bgcolor: "rgba(255,255,255,0.03)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Checkbox
                  checked={reg.checked_in}
                  onChange={(e) => toggleCheckIn(reg.player_id, e.target.checked)}
                  size="small"
                  sx={{ color: "rgba(255,255,255,0.3)" }}
                />
                <Typography sx={{ color: "#fff", fontSize: "0.9rem" }}>
                  {player?.name ?? t("admin.playerLabel", { id: reg.player_id })}
                </Typography>
              </Box>
              <Button onClick={() => removePlayer(reg.player_id)} size="small" startIcon={<RemoveIcon />} sx={{ color: colors.red, textTransform: "none" }} type="button">
                {t("admin.remove")}
              </Button>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default RegistrationsPage;
