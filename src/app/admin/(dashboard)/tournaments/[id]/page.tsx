"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { colors } from "@/lib/design-tokens";
import { createClient } from "@/lib/supabase/client";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslation } from "react-i18next";

interface TournamentDetail {
  id: number;
  week_number: number;
  date: string;
  type: string;
  status: string;
  season_id: number;
  num_groups: number | null;
  generation_type: string | null;
}

interface MatchSummary {
  totalMatches: number;
  pendingMatches: number;
  completedMatches: number;
  groupMatches: number;
  playoffMatches: number;
}

const STATUS_COLORS: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info"> = {
  registration: "warning",
  ready: "info",
  in_progress: "primary",
  completed: "success",
};

/**
 * Tournament dashboard page. Shows status, match summary, and contextual actions.
 */
const TournamentDashboardPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const tournamentId = Number(params.id);

  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [matchSummary, setMatchSummary] = useState<MatchSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const { data: tournamentData, error: tErr } = await supabase
      .from("tournaments")
      .select("id, week_number, date, type, status, season_id, num_groups, generation_type")
      .eq("id", tournamentId)
      .single();

    if (tErr || !tournamentData) {
      setError(t("common.tournamentNotFound"));
      setLoading(false);
      return;
    }
    setTournament(tournamentData as TournamentDetail);

    const { data: matches } = await supabase
      .from("matches")
      .select("id, status, match_type")
      .eq("tournament_id", tournamentId);

    const all = matches ?? [];
    setMatchSummary({
      totalMatches: all.length,
      pendingMatches: all.filter((m) => m.status === "pending").length,
      completedMatches: all.filter((m) => m.status !== "pending").length,
      groupMatches: all.filter((m) => m.match_type === "tournament_group").length,
      playoffMatches: all.filter((m) => m.match_type === "tournament_playoff").length,
    });

    setLoading(false);
  }, [supabase, tournamentId, t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, [fetchData]);

  if (loading) return <Typography sx={{ color: "#fff" }}>{t("common.loading")}</Typography>;
  if (error || !tournament) return <Typography sx={{ color: colors.red }}>{error ?? t("common.error")}</Typography>;

  const isCompleted = tournament.status === "completed";
  const isRegistration = tournament.status === "registration";
  const isReady = tournament.status === "ready";
  const isInProgress = tournament.status === "in_progress";
  const isGrandFinal = tournament.type === "grand_final";

  const statusLabels: Record<string, string> = {
    registration: t("admin.statusRegistration"),
    ready: t("admin.statusReady"),
    in_progress: t("admin.statusInProgress"),
    completed: t("admin.statusCompleted"),
  };

  const actions = [
    { label: t("admin.setup"), href: `/admin/tournaments/${tournamentId}/setup`, show: isRegistration, variant: "outlined" as const },
    { label: t("admin.registrations"), href: `/admin/tournaments/${tournamentId}/registrations`, show: isRegistration || isReady, variant: "outlined" as const },
    { label: t("admin.generateGroups"), href: `/admin/tournaments/${tournamentId}/groups`, show: isRegistration && !isGrandFinal, variant: "contained" as const },
    { label: t("admin.generateBracket"), href: `/admin/tournaments/${tournamentId}/groups`, show: isRegistration && isGrandFinal, variant: "contained" as const },
    { label: t("admin.viewGroups"), href: `/admin/tournaments/${tournamentId}/groups`, show: isReady || isInProgress, variant: "outlined" as const },
    { label: t("admin.enterResults"), href: `/admin/tournaments/${tournamentId}/matches`, show: isInProgress, variant: "contained" as const },
    { label: t("admin.viewResults"), href: `/admin/tournaments/${tournamentId}/matches`, show: isCompleted, variant: "outlined" as const },
    { label: t("admin.standings"), href: `/admin/tournaments/${tournamentId}/standings`, show: isReady || isInProgress || isCompleted, variant: "outlined" as const },
    { label: t("admin.closeTournament"), href: `/admin/tournaments/${tournamentId}/close`, show: isInProgress && matchSummary?.pendingMatches === 0, variant: "contained" as const },
  ].filter((a) => a.show);

  return (
    <Box>
      <Button onClick={() => router.push("/admin/tournaments")} size="small" startIcon={<ArrowBackIcon />} sx={{ color: "rgba(255,255,255,0.5)", mb: 2, textTransform: "none" }} type="button">
        {t("admin.backToTournaments")}
      </Button>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            bgcolor: isGrandFinal ? colors.gold : colors.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "#fff",
          }}
        >
          {tournament.week_number}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem" }}>
            {isGrandFinal ? t("admin.grandFinal") : t("common.week", { week: tournament.week_number })}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
            {tournament.date}
          </Typography>
        </Box>
        <Chip
          color={STATUS_COLORS[tournament.status] ?? "default"}
          label={statusLabels[tournament.status] ?? tournament.status}
          size="small"
        />
      </Box>

      {matchSummary && matchSummary.totalMatches > 0 ? (
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <StatCard label={t("admin.totalMatches")} value={matchSummary.totalMatches} />
          <StatCard label={t("admin.pendingMatches")} value={matchSummary.pendingMatches} />
          <StatCard label={t("admin.completedMatches")} value={matchSummary.completedMatches} />
          {matchSummary.groupMatches > 0 ? <StatCard label={t("admin.groupMatches")} value={matchSummary.groupMatches} /> : null}
          {matchSummary.playoffMatches > 0 ? <StatCard label={t("admin.playoffMatches")} value={matchSummary.playoffMatches} /> : null}
        </Box>
      ) : null}

      {tournament.generation_type ? (
        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", mb: 2 }}>
          Generation: {tournament.generation_type.replace(/_/g, " ")}
          {tournament.num_groups ? ` · ${tournament.num_groups} groups` : ""}
        </Typography>
      ) : null}

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        {actions.map((a) => (
          <Link href={a.href} key={a.href + a.label}>
            <Button size="small" type="button" variant={a.variant ?? "outlined"}>
              {a.label}
            </Button>
          </Link>
        ))}
      </Box>
    </Box>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <Box
    sx={{
      px: 2.5,
      py: 2,
      borderRadius: 1.5,
      bgcolor: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.06)",
      minWidth: 120,
    }}
  >
    <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.5rem" }}>
      {value}
    </Typography>
  </Box>
);

export default TournamentDashboardPage;
