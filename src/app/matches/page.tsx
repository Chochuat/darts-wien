"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination";
import TrackChanges from "@mui/icons-material/TrackChanges";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import Card from "@/app/_components/ui/card";
import PageLayout from "@/app/_components/ui/page-layout";
import PageHeader from "@/app/_components/ui/page-header";
import { useMatches } from "@/lib/hooks/use-matches";
import { MatchFilters } from "@/app/_components/ui/match-filters";
import { MatchListRow } from "@/app/_components/ui/match-list-row";
import type { ApiMatchRow } from "@/lib/validation";

interface MatchDisplay {
  playerName: string;
  opponent: string;
  score: string;
  result: "W" | "L";
  date: string;
  one80: number;
  id: number;
}

/**
 *
 * @param m
 */
function toDisplayEntries(m: ApiMatchRow): [MatchDisplay, MatchDisplay] {
  const p1Score = m.legsPlayer1 ?? 0;
  const p2Score = m.legsPlayer2 ?? 0;
  return [
    { id: m.id, playerName: m.player1.name, opponent: m.player2.name, score: `${p1Score}-${p2Score}`, result: p1Score > p2Score ? "W" : "L", date: m.matchDate, one80: m.player1_180 },
    { id: m.id, playerName: m.player2.name, opponent: m.player1.name, score: `${p2Score}-${p1Score}`, result: p2Score > p1Score ? "W" : "L", date: m.matchDate, one80: m.player2_180 },
  ];
}

const PLAYERS_PER_PAGE = 20;

/**
 *
 * @param match
 * @param filters
 * @param filters.player
 * @param filters.result
 * @param filters.scoreQ
 * @param filters.quickQ
 */
function matchFilter(match: MatchDisplay, filters: { player: string; result: string; scoreQ: string; quickQ: string }) {
  if (filters.player && match.playerName !== filters.player) return false;
  if (filters.result && match.result !== filters.result) return false;
  if (filters.scoreQ && !match.score.toLowerCase().includes(filters.scoreQ.toLowerCase())) return false;
  if (filters.quickQ) {
    const q = filters.quickQ.toLowerCase();
    if (!match.playerName.toLowerCase().includes(q) && !match.opponent.toLowerCase().includes(q) && !match.score.toLowerCase().includes(q) && !match.date.toLowerCase().includes(q)) return false;
  }
  return true;
}

/**
 * AllMatchesPage component.
 */
const AllMatchesPage = () => {
  const [player, setPlayer] = useState("");
  const [result, setResult] = useState("");
  const [scoreQ, setScoreQ] = useState("");
  const [quickQ, setQuickQ] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useTranslation();
  const { data, isLoading, isError } = useMatches({ limit: 5000 });

  const allEntries = useMemo(() => data ? data.matches.flatMap(toDisplayEntries) : [], [data]);
  const playerNames = useMemo(() => [...new Set(allEntries.map((m) => m.playerName))].sort(), [allEntries]);

  const filtered = useMemo(() => allEntries.filter((m) => matchFilter(m, { player, result, scoreQ, quickQ })), [allEntries, player, result, scoreQ, quickQ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PLAYERS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PLAYERS_PER_PAGE, safePage * PLAYERS_PER_PAGE);

  const clearAll = () => { setPlayer(""); setResult(""); setScoreQ(""); setQuickQ(""); setPage(1); };
  const hasFilters = !!(player || result || scoreQ || quickQ);

  if (isLoading) {
    return (
      <PageLayout>
        <Section>
          <Typography sx={{ color: colors.text.muted, textAlign: "center", py: 4, fontSize: "0.85rem" }}>{t("common.loading")}</Typography>
        </Section>
      </PageLayout>
    );
  }

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

        <MatchFilters
          hasFilters={hasFilters}
          onClearAll={clearAll}
          onPlayerChange={setPlayer}
          onQuickQChange={setQuickQ}
          onResultChange={setResult}
          onScoreQChange={setScoreQ}
          onToggleFilters={() => setShowFilters(!showFilters)}
          player={player}
          playerNames={playerNames}
          quickQ={quickQ}
          result={result}
          scoreQ={scoreQ}
          showFilters={showFilters}
        />

        <Typography sx={{ color: colors.text.muted, fontSize: "0.6rem", fontWeight: 600, px: 0.5, mb: 1 }}>
          {t("matchesPage.matchesFound", { count: filtered.length })}
        </Typography>

        <Card borderColor={colors.accent4d}>
          {filtered.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography sx={{ color: colors.text.muted, fontSize: "0.85rem" }}>{t("common.noMatchesFilter")}</Typography>
            </Box>
          ) : (
            paginated.map((m, i) => (
              <MatchListRow date={m.date} index={i} key={`${m.playerName}-${m.id}`} one80={m.one80} opponent={m.opponent} playerName={m.playerName} result={m.result} score={m.score} />
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
