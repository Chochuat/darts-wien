"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination";
import TrackChanges from "@mui/icons-material/TrackChanges";
import SportsScore from "@mui/icons-material/SportsScore";
import Person from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import Card from "@/app/_components/ui/card";
import PageLayout from "@/app/_components/ui/page-layout";
import PageHeader from "@/app/_components/ui/page-header";
import { DartLoading } from "@/app/_components/ui/dart-loading";
import { useMatches } from "@/lib/hooks/use-matches";
import { MatchFilters } from "@/app/_components/ui/match-filters";
import Badge180 from "@/app/_components/ui/badge-180";

interface MatchRow {
  player1: string;
  player2: string;
  score: string;
  date: string;
  p1_180: number;
  p2_180: number;
  id: number;
}

const MATCHES_PER_PAGE = 20;

/**
 * Filters a match row against a quick-search query.
 *
 * @param m - The match row.
 * @param q - The search query.
 */
function matchFilter(m: MatchRow, q: string) {
  if (!q) return true;
  const lq = q.toLowerCase();
  return m.player1.toLowerCase().includes(lq) || m.player2.toLowerCase().includes(lq) || m.score.toLowerCase().includes(lq) || m.date.toLowerCase().includes(lq);
}

/**
 * All-matches page: searchable, paginated list of every completed match.
 */
const AllMatchesPage = () => {
  const [quickQ, setQuickQ] = useState("");
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const { data, isLoading, isError } = useMatches({ limit: 5000 });

  const rows: MatchRow[] = useMemo(() => (data?.matches ?? [])
    .filter((m) => m.player1 && m.player2)
    .map((m) => ({
      id: m.id,
      player1: m.player1!.name,
      player2: m.player2!.name,
      score: `${m.legsPlayer1 ?? 0}-${m.legsPlayer2 ?? 0}`,
      date: m.matchDate,
      p1_180: m.player1_180,
      p2_180: m.player2_180,
    })), [data]);

  const filtered = useMemo(() => rows.filter((m) => matchFilter(m, quickQ)), [rows, quickQ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / MATCHES_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * MATCHES_PER_PAGE, safePage * MATCHES_PER_PAGE);

  const clearAll = () => { setQuickQ(""); setPage(1); };
  const hasFilters = !!quickQ;

  if (isLoading) return <DartLoading />;

  if (isError) {
    return (
      <PageLayout>
        <Section>
          <Typography sx={{ color: colors.red, textAlign: "center", py: 4, fontSize: "0.85rem" }}>{t("common.error")}</Typography>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Section>
        <PageHeader icon={<TrackChanges />} subtitle={t("matchesPage.subtitle", { count: data?.total ?? 0 })} title={t("matchesPage.title")} />

        <Box sx={{ px: 0.5, mb: 2 }}>
          <MatchFilters
            hasFilters={hasFilters}
            onClearAll={clearAll}
            onQuickQChange={setQuickQ}
            quickQ={quickQ}
          />
        </Box>

        <Typography sx={{ color: colors.text.muted, fontSize: "0.6rem", fontWeight: 600, px: 0.5, mb: 1 }}>
          {t("matchesPage.matchesFound", { count: filtered.length })}
        </Typography>

        <Card borderColor={colors.accent4d}>
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", px: 2.5, py: 1, borderBottom: "1px solid #f0f0f0" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, minWidth: 44 }}>
              <EventIcon sx={{ color: colors.text.muted, fontSize: "0.6rem" }} />
              <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", fontWeight: 700, letterSpacing: 1 }}>{t("matchesPage.date")}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, flex: 1 }}>
              <Person sx={{ color: colors.text.muted, fontSize: "0.6rem" }} />
              <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", fontWeight: 700, letterSpacing: 1 }}>{t("matchesPage.players")}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.3, minWidth: 36 }}>
              <SportsScore sx={{ color: colors.text.muted, fontSize: "0.6rem" }} />
              <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", fontWeight: 700, letterSpacing: 1 }}>{t("matchesPage.score")}</Typography>
            </Box>
          </Box>

          {filtered.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography sx={{ color: colors.text.muted, fontSize: "0.85rem" }}>{t("common.noMatchesFilter")}</Typography>
            </Box>
          ) : (
            paginated.map((m, i) => (
              <Box key={m.id} sx={{ display: "flex", alignItems: "center", px: { xs: 1.75, md: 2.5 }, py: { xs: 1.25, md: 0.85 }, borderTop: i === 0 ? "none" : "1px solid #f0f0f0", gap: { xs: 0.75, md: 1 } }}>
                <Typography sx={{ color: colors.text.muted, fontSize: "0.6rem", minWidth: 44, flexShrink: 0 }}>
                  {m.date}
                </Typography>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ color: colors.text.primary, fontSize: "0.75rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <Box component="span" sx={{ color: colors.text.primary }}>{m.player1}</Box>
                    {m.p1_180 > 0 ? <Badge180 /> : null}
                    {" "}
                    <Box component="span" sx={{ color: colors.text.muted, fontWeight: 400 }}>{t("common.vs")}</Box>
                    {" "}
                    <Box component="span" sx={{ color: colors.text.primary }}>{m.player2}</Box>
                    {m.p2_180 > 0 ? <Badge180 /> : null}
                  </Typography>
                </Box>
                <Typography sx={{ color: colors.text.primary, fontSize: "0.8rem", fontWeight: 700, fontFamily: "'Courier New', monospace", textAlign: "center", minWidth: 36, flexShrink: 0 }}>
                  {m.score}
                </Typography>
              </Box>
            ))
          )}
        </Card>

        {totalPages > 1 ? <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination count={totalPages} onChange={(_, p) => setPage(p)} page={safePage} size="small" sx={{ "& .MuiPaginationItem-root": { fontSize: "0.75rem", color: colors.text.secondary, borderColor: "#d4d4d8" }, "& .Mui-selected": { bgcolor: `${colors.accent} !important`, color: "#fff !important", display: "inline-flex", alignItems: "center", justifyContent: "center" } }} />
          </Box> : null}
      </Section>
    </PageLayout>
  );
}

export default AllMatchesPage;
