"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { colors } from "@/lib/design-tokens";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "react-i18next";

interface Season {
  id: number;
  name: string;
  is_active: boolean;
}

/**
 * Admin new tournament creation page. Admin only.
 */
const NewTournamentPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const supabase = createClient();

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [weekNumber, setWeekNumber] = useState("1");
  const [date, setDate] = useState("");
  const [type, setType] = useState("regular");
  const [numGroups, setNumGroups] = useState("2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchSeasons = async () => {
    if (fetched) return;
    setFetched(true);
    const { data } = await supabase.from("seasons").select("id, name, is_active").order("name");
    if (data) {
      setSeasons(data as Season[]);
      const active = (data as Season[]).find((s) => s.is_active);
      if (active) setSeasonId(String(active.id));
    }
  };

  void fetchSeasons();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const body = {
      seasonId: Number(seasonId),
      weekNumber: Number(weekNumber),
      date,
      type,
      numGroups: type === "grand_final" ? null : Number(numGroups),
    };

    const res = await fetch("/api/tournaments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: t("admin.createFailed") }));
      setError(err.error ?? t("admin.createFailed"));
      return;
    }

    router.push("/admin/tournaments");
    router.refresh();
  };

  return (
    <Box sx={{ maxWidth: 500 }}>
      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem", mb: 3 }}>
        New Tournament
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {error ? (
          <Typography sx={{ color: colors.red }} variant="body2">{error}</Typography>
        ) : null}

        <TextField
          fullWidth
          label={t("admin.season")}
          onChange={(e) => setSeasonId(e.target.value)}
          select
          required
          sx={darkField}
          value={seasonId}
        >
          {seasons.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}{s.is_active ? " (active)" : ""}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label={t("admin.weekNumber")}
          onChange={(e) => setWeekNumber(e.target.value)}
          required
          sx={darkField}
          type="number"
          value={weekNumber}
        />

        <TextField
          fullWidth
          label={t("admin.date")}
          onChange={(e) => setDate(e.target.value)}
          required
          sx={darkField}
          type="date"
          value={date}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          fullWidth
          label={t("admin.type")}
          onChange={(e) => setType(e.target.value)}
          select
          sx={darkField}
          value={type}
        >
          <MenuItem value="regular">{t("admin.regular")}</MenuItem>
          <MenuItem value="grand_final">{t("admin.grandFinal")}</MenuItem>
        </TextField>

        {type === "regular" ? (
          <TextField
            fullWidth
            label={t("admin.numGroups")}
            onChange={(e) => setNumGroups(e.target.value)}
            select
            sx={darkField}
            value={numGroups}
          >
            <MenuItem value="2">2</MenuItem>
            <MenuItem value="3">3</MenuItem>
            <MenuItem value="4">4</MenuItem>
          </TextField>
        ) : null}

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button disabled={loading} type="submit" variant="contained">
            {loading ? t("admin.creating") : t("admin.createTournament")}
          </Button>
          <Button onClick={() => router.back()} type="button" variant="outlined">
            {t("admin.cancel")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const darkField = {
  "& .MuiInputBase-root": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" },
  "& .MuiSelect-icon": { color: "rgba(255,255,255,0.5)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
};

export default NewTournamentPage;
