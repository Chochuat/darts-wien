"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import { colors } from "@/lib/design-tokens";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { createClient } from "@/lib/supabase/client";

const darkField = {
  "& .MuiInputBase-root": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
  "& .MuiSelect-icon": { color: "rgba(255,255,255,0.5)" },
};

/**
 * Group generation page. Shows current groups or a generation form.
 */
const GroupsPage = () => {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const tournamentId = Number(params.id);
  const { t } = useTranslation();

  const [groups, setGroups] = useState<Array<{ id: number; label: string; players: Array<{ player_id: number; name: string }> }>>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasGroups, setHasGroups] = useState(false);
  const [tournamentStatus, setTournamentStatus] = useState("");
  const [tournamentType, setTournamentType] = useState("");

  // Generation form state
  const [genType, setGenType] = useState("snake");
  const [numGroups, setNumGroups] = useState("2");
  const [extraPairing, setExtraPairing] = useState("top_vs_bottom");

  const fetchData = useCallback(async () => {
    const { data: tournamentRow } = await supabase
      .from("tournaments")
      .select("status, type")
      .eq("id", tournamentId)
      .single();

    if (tournamentRow) {
      setTournamentStatus(tournamentRow.status);
      setTournamentType(tournamentRow.type);
    }

    const { data: groupRows } = await supabase
      .from("tournament_groups")
      .select("id, label")
      .eq("tournament_id", tournamentId)
      .order("label");

    if (groupRows && groupRows.length > 0) {
      setHasGroups(true);
      const groupIds = groupRows.map((g) => g.id);
      const { data: groupPlayers } = await supabase
        .from("tournament_group_players")
        .select("group_id, player_id")
        .in("group_id", groupIds);

      const playerIds = (groupPlayers ?? []).map((gp) => gp.player_id);
      const { data: players } = await supabase
        .from("players")
        .select("id, name")
        .in("id", playerIds.length ? playerIds : [0]);

      const playerMap = new Map((players ?? []).map((p) => [p.id, p.name]));
      const result = (groupRows as Array<{ id: number; label: string }>).map((g) => ({
        id: g.id,
        label: g.label,
        players: (groupPlayers ?? [])
          .filter((gp) => gp.group_id === g.id)
          .map((gp) => ({ player_id: gp.player_id, name: playerMap.get(gp.player_id) ?? t("admin.unknown") })),
      }));
      setGroups(result);
    }

    setLoading(false);
  }, [supabase, tournamentId, t]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void fetchData(); }, [fetchData]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setSuccess(null);

    const body: Record<string, unknown> = {
      generationType: genType,
      numGroups: Number(numGroups),
    };

    if (genType !== "manual") {
      body.extraMatchPairing = extraPairing;
    }

    const res = await fetch(`/api/admin/tournaments/${tournamentId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setGenerating(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: t("admin.failedToGenerate") }));
      setError(err.error ?? t("admin.failedToGenerate"));
      return;
    }

    const data = await res.json();
    setSuccess(t("admin.generatedSuccess", { groups: data.groupsCreated ?? 0, matches: data.matchesCreated ?? 0 }));
    void fetchData();
  };

  const canGenerate = tournamentStatus === "registration";
  const canRegenerate = tournamentStatus === "ready";

  if (loading) return <Typography sx={{ color: "#fff" }}>{t("common.loading")}</Typography>;

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Button onClick={() => router.push(`/admin/tournaments/${tournamentId}`)} size="small" startIcon={<ArrowBackIcon />} sx={{ color: "rgba(255,255,255,0.5)", mb: 2, textTransform: "none" }} type="button">
        {t("admin.backToTournament")}
      </Button>

      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem", mb: 3 }}>
        {tournamentType === "grand_final" ? t("admin.bracketGeneration") : t("admin.groupGeneration")}
      </Typography>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

      {hasGroups ? (
        <Box>
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", mb: 2 }}>
            {t("admin.groupsGenerated")} {canRegenerate ? t("admin.canRegenerate") : ""}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {groups.map((g) => (
              <Box
                key={g.id}
                sx={{
                  flex: "1 1 250px",
                  maxWidth: 300,
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Typography sx={{ color: colors.accent, fontWeight: 700, fontSize: "1.1rem", mb: 1.5 }}>
                  {t("admin.group")} {g.label}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {g.players.map((p) => (
                    <Typography key={p.player_id} sx={{ color: "#fff", fontSize: "0.85rem", py: 0.5 }}>
                      {p.name}
                    </Typography>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>

          {canRegenerate ? (
            <Box sx={{ mt: 3 }}>
              <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", mb: 2 }}>
                {t("admin.regenerateHint")}
              </Typography>
              <GenerationForm
                genType={genType}
                setGenType={setGenType}
                numGroups={numGroups}
                setNumGroups={setNumGroups}
                extraPairing={extraPairing}
                setExtraPairing={setExtraPairing}
                onSubmit={handleGenerate}
                loading={generating}
                isGrandFinal={tournamentType === "grand_final"}
                label={t("admin.regenerate")}
              />
            </Box>
          ) : null}
        </Box>
      ) : canGenerate ? (
        <Box>
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", mb: 2 }}>
            {tournamentType === "grand_final"
              ? t("admin.grandFinalHint")
              : t("admin.generateHint")}
          </Typography>

          <GenerationForm
            genType={genType}
            setGenType={setGenType}
            numGroups={numGroups}
            setNumGroups={setNumGroups}
            extraPairing={extraPairing}
            setExtraPairing={setExtraPairing}
            onSubmit={handleGenerate}
            loading={generating}
            isGrandFinal={tournamentType === "grand_final"}
            label={t("admin.generate")}
          />
        </Box>
      ) : (
        <Typography sx={{ color: "rgba(255,255,255,0.4)" }}>
          {t("admin.noGroupsAvailable")}
        </Typography>
      )}
    </Box>
  );
};

interface GenerationFormProps {
  genType: string;
  setGenType: (v: string) => void;
  numGroups: string;
  setNumGroups: (v: string) => void;
  extraPairing: string;
  setExtraPairing: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  isGrandFinal: boolean;
  label: string;
}

const GenerationForm = ({ genType, setGenType, numGroups, setNumGroups, extraPairing, setExtraPairing, onSubmit, loading, isGrandFinal, label }: GenerationFormProps) => {
  const { t } = useTranslation();
  return (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 400 }}>
    {!isGrandFinal ? (
      <>
        <TextField
          fullWidth
          label={t("admin.generationStrategy")}
          onChange={(e) => setGenType(e.target.value)}
          select
          sx={darkField}
          value={genType}
        >
          <MenuItem value="split_contiguous">Split Contiguous</MenuItem>
          <MenuItem value="interleaved_strict">Interleaved Strict</MenuItem>
          <MenuItem value="snake">Snake</MenuItem>
          <MenuItem value="manual">Manual</MenuItem>
        </TextField>

        <TextField
          fullWidth
          label={t("admin.numberOfGroups")}
          onChange={(e) => setNumGroups(e.target.value)}
          select
          sx={darkField}
          value={numGroups}
        >
          <MenuItem value="2">2</MenuItem>
          <MenuItem value="3">3</MenuItem>
          <MenuItem value="4">4</MenuItem>
        </TextField>

        {genType !== "manual" ? (
          <TextField
            fullWidth
            label={t("admin.extraMatchPairing")}
            onChange={(e) => setExtraPairing(e.target.value)}
            select
            sx={darkField}
            value={extraPairing}
          >
            <MenuItem value="top_vs_bottom">Top vs Bottom</MenuItem>
            <MenuItem value="top_vs_top">Top vs Top</MenuItem>
            <MenuItem value="cross">Cross</MenuItem>
            <MenuItem value="manual">Manual</MenuItem>
          </TextField>
        ) : null}
      </>
    ) : null}

    <Button disabled={loading} onClick={onSubmit} type="button" variant="contained">
      {loading ? t("admin.generating") : label}
    </Button>
  </Box>
  );
};

export default GroupsPage;
