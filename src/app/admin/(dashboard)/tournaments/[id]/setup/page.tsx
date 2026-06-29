"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { colors } from "@/lib/design-tokens";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface FormatEntry {
  phase: string;
  legsTarget: number;
  startingScore: number;
  maxThrows: number;
}

const REGULAR_PHASES = [
  { key: "group", label: "Group Phase" },
  { key: "playoff", label: "Playoffs (QF/SF)" },
  { key: "third_place", label: "3rd Place" },
  { key: "final", label: "Final" },
];

const GRAND_FINAL_PHASES = [
  { key: "grand_final_qf", label: "Quarter-Finals" },
  { key: "grand_final_sf", label: "Semi-Finals" },
  { key: "grand_final_third", label: "3rd Place" },
  { key: "grand_final_final", label: "Final" },
  { key: "grand_final_consolation_sf", label: "Consolation SF" },
  { key: "grand_final_5th", label: "5th Place" },
  { key: "grand_final_7th", label: "7th Place" },
];

const DEFAULTS: Record<string, FormatEntry> = {
  group: { phase: "group", legsTarget: 2, startingScore: 501, maxThrows: 45 },
  playoff: { phase: "playoff", legsTarget: 3, startingScore: 501, maxThrows: 45 },
  third_place: { phase: "third_place", legsTarget: 3, startingScore: 501, maxThrows: 45 },
  final: { phase: "final", legsTarget: 3, startingScore: 501, maxThrows: 45 },
  grand_final_qf: { phase: "grand_final_qf", legsTarget: 4, startingScore: 501, maxThrows: 45 },
  grand_final_sf: { phase: "grand_final_sf", legsTarget: 5, startingScore: 501, maxThrows: 45 },
  grand_final_third: { phase: "grand_final_third", legsTarget: 5, startingScore: 501, maxThrows: 45 },
  grand_final_final: { phase: "grand_final_final", legsTarget: 6, startingScore: 501, maxThrows: 45 },
  grand_final_consolation_sf: { phase: "grand_final_consolation_sf", legsTarget: 3, startingScore: 501, maxThrows: 45 },
  grand_final_5th: { phase: "grand_final_5th", legsTarget: 3, startingScore: 501, maxThrows: 45 },
  grand_final_7th: { phase: "grand_final_7th", legsTarget: 3, startingScore: 501, maxThrows: 45 },
};

const darkField = {
  "& .MuiInputBase-root": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
};

/**
 * Tournament setup page — format config (legs, starting score, max throws per phase).
 */
const SetupPage = () => {
  const params = useParams();
  const router = useRouter();
  const tournamentId = Number(params.id);

  const [entries, setEntries] = useState<FormatEntry[]>([]);
  const [tournamentType, setTournamentType] = useState<string>("regular");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchFormat = useCallback(async () => {
    const tRes = await fetch(`/api/tournaments/${tournamentId}`).then((r) => r.json()).catch(() => null);
    const fmtRes = await fetch(`/api/admin/tournaments/${tournamentId}/format`).then((r) => r.json()).catch(() => ({ formats: [] }));
    
    const type = (tRes as { tournament?: { type?: string } })?.tournament?.type ?? "regular";
    setTournamentType(type);

    const phases = type === "grand_final" ? GRAND_FINAL_PHASES : REGULAR_PHASES;
    const existing = (fmtRes as { formats?: FormatEntry[] })?.formats ?? [];
    const map = new Map(existing.map((e) => [e.phase, e]));

    const result = phases.map((p) => map.get(p.key) ?? DEFAULTS[p.key]!);
    setEntries(result);
    setLoading(false);
  }, [tournamentId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void fetchFormat(); }, [fetchFormat]);

  const updateEntry = (phase: string, field: keyof FormatEntry, value: number) => {
    setEntries((prev) => prev.map((e) => e.phase === phase ? { ...e, [field]: value } : e));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const res = await fetch(`/api/admin/tournaments/${tournamentId}/format`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
    });

    setSaving(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to save" }));
      setError(err.error ?? "Failed to save");
      return;
    }

    setSuccess(true);
  };

  if (loading) return <Typography sx={{ color: "#fff" }}>Loading…</Typography>;

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Button onClick={() => router.push(`/admin/tournaments/${tournamentId}`)} size="small" startIcon={<ArrowBackIcon />} sx={{ color: "rgba(255,255,255,0.5)", mb: 2, textTransform: "none" }} type="button">
        Back to Tournament
      </Button>

      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem", mb: 3 }}>
        Tournament Setup — Format Configuration
      </Typography>

      {error ? <Typography sx={{ color: colors.red, mb: 2 }} variant="body2">{error}</Typography> : null}
      {success ? <Typography sx={{ color: colors.green, mb: 2 }} variant="body2">Saved successfully.</Typography> : null}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {entries.map((entry) => (
          <Box
            key={entry.phase}
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", mb: 1.5 }}>
              {(tournamentType === "grand_final" ? GRAND_FINAL_PHASES : REGULAR_PHASES).find((p) => p.key === entry.phase)?.label ?? entry.phase}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="Legs"
                onChange={(e) => updateEntry(entry.phase, "legsTarget", Number(e.target.value))}
                sx={darkField}
                size="small"
                type="number"
                value={entry.legsTarget}
              />
              <TextField
                label="Starting Score"
                onChange={(e) => updateEntry(entry.phase, "startingScore", Number(e.target.value))}
                sx={darkField}
                size="small"
                type="number"
                value={entry.startingScore}
              />
              <TextField
                label="Max Throws"
                onChange={(e) => updateEntry(entry.phase, "maxThrows", Number(e.target.value))}
                sx={darkField}
                size="small"
                type="number"
                value={entry.maxThrows}
              />
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
        <Button disabled={saving} onClick={handleSave} type="button" variant="contained">
          {saving ? "Saving…" : "Save Format"}
        </Button>
      </Box>
    </Box>
  );
};

export default SetupPage;
