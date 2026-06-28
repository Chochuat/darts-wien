"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Collapse from "@mui/material/Collapse";
import Pagination from "@mui/material/Pagination";
import TrackChanges from "@mui/icons-material/TrackChanges";
import Search from "@mui/icons-material/Search";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Cancel from "@mui/icons-material/Cancel";
import FilterList from "@mui/icons-material/FilterList";
import Close from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import Card from "@/app/_components/ui/card";
import PageLayout from "@/app/_components/ui/page-layout";
import PageHeader from "@/app/_components/ui/page-header";
import { useMatches } from "@/lib/hooks/use-matches";
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

function toDisplayEntries(m: ApiMatchRow): [MatchDisplay, MatchDisplay] {
  const p1Score = m.legsPlayer1 ?? 0;
  const p2Score = m.legsPlayer2 ?? 0;
  return [
    {
      id: m.id,
      playerName: m.player1.name,
      opponent: m.player2.name,
      score: `${p1Score}-${p2Score}`,
      result: p1Score > p2Score ? "W" : "L",
      date: m.matchDate,
      one80: m.player1_180,
    },
    {
      id: m.id,
      playerName: m.player2.name,
      opponent: m.player1.name,
      score: `${p2Score}-${p1Score}`,
      result: p2Score > p1Score ? "W" : "L",
      date: m.matchDate,
      one80: m.player2_180,
    },
  ];
}

const PLAYERS_PER_PAGE = 20;

function matchFilter(
  match: MatchDisplay,
  filters: { player: string; result: string; scoreQ: string; quickQ: string },
) {
  if (filters.player && match.playerName !== filters.player) return false;
  if (filters.result && match.result !== filters.result) return false;
  if (filters.scoreQ && !match.score.toLowerCase().includes(filters.scoreQ.toLowerCase())) return false;
  if (filters.quickQ) {
    const q = filters.quickQ.toLowerCase();
    if (
      !match.playerName.toLowerCase().includes(q) &&
      !match.opponent.toLowerCase().includes(q) &&
      !match.score.toLowerCase().includes(q) &&
      !match.date.toLowerCase().includes(q)
    ) return false;
  }
  return true;
}

const inputSx = {
  bgcolor: colors.card,
  color: colors.text.primary,
  "& .MuiInputBase-root": { fontSize: "0.75rem", bgcolor: colors.card, color: colors.text.primary },
  "& fieldset": { borderColor: colors.accent4d },
  "&:hover fieldset": { borderColor: colors.accent },
  "& input": { color: colors.text.primary },
  "& input::placeholder": { color: colors.text.subtle, opacity: 1 },
  "& .MuiInputBase-input": { color: colors.text.primary },
  "& .MuiInputBase-input::placeholder": { color: colors.text.subtle, opacity: 1 },
};

export default function AllMatchesPage() {
  const [player, setPlayer] = useState("");
  const [result, setResult] = useState("");
  const [scoreQ, setScoreQ] = useState("");
  const [quickQ, setQuickQ] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useTranslation();
  const { data, isLoading, isError } = useMatches({ limit: 5000 });

  const allEntries: MatchDisplay[] = useMemo(() => {
    if (!data) return [];
    return data.matches.flatMap(toDisplayEntries);
  }, [data]);

  const playerNames = useMemo(() => {
    const names = new Set(allEntries.map((m) => m.playerName));
    return [...names].sort();
  }, [allEntries]);

  const filtered = useMemo(
    () => allEntries.filter((m) => matchFilter(m, { player, result, scoreQ, quickQ })),
    [allEntries, player, result, scoreQ, quickQ],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PLAYERS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PLAYERS_PER_PAGE, safePage * PLAYERS_PER_PAGE);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [player, result, scoreQ, quickQ]);

  const clearAll = () => {
    setPlayer("");
    setResult("");
    setScoreQ("");
    setQuickQ("");
    setPage(1);
  };

  const hasFilters = player || result || scoreQ || quickQ;

  if (isLoading) {
    return (
      <PageLayout>
        <Section>
          <Typography sx={{ color: colors.text.muted, textAlign: "center", py: 4, fontSize: "0.85rem" }}>
            {t("common.loading")}
          </Typography>
        </Section>
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout>
        <Section>
          <Typography sx={{ color: colors.red, textAlign: "center", py: 4, fontSize: "0.85rem" }}>
            {t("common.error")}
          </Typography>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Section>
        <PageHeader icon={<TrackChanges />} title={t("matchesPage.title")} subtitle={t("matchesPage.subtitle", { count: data?.total ?? 0 })} />

        {/* Filters — single row */}
        <Box sx={{ px: 0.5, mb: 2 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
              <ToggleButtonGroup
                value={result}
                exclusive
                onChange={(_, v) => setResult(v ?? "")}
                size="small"
              >
                <ToggleButton value="W" sx={{ fontSize: "0.7rem", px: 1.5, bgcolor: colors.card, borderColor: colors.accent4d, color: colors.green, "&.Mui-selected": { bgcolor: colors.green, color: "#fff", "&:hover": { bgcolor: colors.green } } }}>
                  <CheckCircle sx={{ fontSize: "0.75rem", mr: 0.3 }} /> {t("common.win")}
                </ToggleButton>
                <ToggleButton value="L" sx={{ fontSize: "0.7rem", px: 1.5, bgcolor: colors.card, borderColor: colors.accent4d, color: colors.red, "&.Mui-selected": { bgcolor: colors.red, color: "#fff", "&:hover": { bgcolor: colors.red } } }}>
                  <Cancel sx={{ fontSize: "0.75rem", mr: 0.3 }} /> {t("common.loss")}
                </ToggleButton>
              </ToggleButtonGroup>

            <TextField
              placeholder={t("matchesPage.searchPlaceholder")}
              value={quickQ}
              onChange={(e) => setQuickQ(e.target.value)}
              size="small"
              slotProps={{ input: { startAdornment: <Search sx={{ fontSize: "0.85rem", mr: 0.5, color: colors.text.muted }} /> } }}
              sx={{ minWidth: 220, flex: { xs: 1, md: "none" }, ...inputSx }}
            />

            <Box
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: showFilters ? colors.accent : colors.card,
                border: "1px solid",
                borderColor: colors.accent4d,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {showFilters ? (
                <Close sx={{ fontSize: "0.85rem", color: "#fff" }} />
              ) : (
                <FilterList sx={{ fontSize: "0.85rem", color: colors.text.secondary }} />
              )}
            </Box>

            {hasFilters && (
              <Typography
                onClick={clearAll}
                sx={{ color: colors.accent, fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
              >
                {t("common.clearAll")}
              </Typography>
            )}
          </Box>

          <Collapse in={showFilters} timeout={250}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", mt: 1.5 }}>
              <Autocomplete
                options={playerNames}
                value={player}
                onChange={(_, v) => setPlayer(v ?? "")}
                onInputChange={(_, v) => { if (!v) setPlayer(""); }}
                inputValue={player}
                size="small"
                sx={{ minWidth: 180, maxWidth: 240 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={t("matchesPage.filterPlayer")}
                    sx={inputSx}
                  />
                )}
              />

              <TextField
                placeholder={t("matchesPage.filterScore")}
                value={scoreQ}
                onChange={(e) => setScoreQ(e.target.value)}
                size="small"
                sx={{ minWidth: 130, ...inputSx }}
              />
            </Box>
          </Collapse>
        </Box>

        {/* Results count */}
        <Typography sx={{ color: colors.text.muted, fontSize: "0.6rem", fontWeight: 600, px: 0.5, mb: 1 }}>
          {t("matchesPage.matchesFound", { count: filtered.length })}
        </Typography>

        {/* Match list */}
        <Card borderColor={colors.accent4d}>
          {filtered.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography sx={{ color: colors.text.muted, fontSize: "0.85rem" }}>
                {t("common.noMatchesFilter")}
              </Typography>
            </Box>
          ) : (
            paginated.map((m, i) => {
              const isWin = m.result === "W";
              return (
                <Box
                  key={`${m.playerName}-${m.id}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: { xs: 1.75, md: 2.5 },
                    py: { xs: 1, md: 0.85 },
                    borderTop: i === 0 ? "none" : "1px solid #f0f0f0",
                    gap: { xs: 0.75, md: 1 },
                  }}
                >
                  <Box sx={{ flexShrink: 0 }}>
                    {isWin ? (
                      <CheckCircle sx={{ color: colors.green, fontSize: "0.8rem" }} />
                    ) : (
                      <Cancel sx={{ color: colors.red, fontSize: "0.8rem" }} />
                    )}
                  </Box>

                  <Box
                    sx={{
                      minWidth: 0,
                      flex: { xs: 1, md: "none" },
                      md: { width: 200 },
                    }}
                  >
                    <Typography
                      sx={{
                        color: colors.text.primary,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Box component="span" sx={{ color: colors.text.primary }}>{m.playerName}</Box>
                      {m.one80 > 0 && (
                        <Typography
                          component="span"
                          sx={{
                            color: colors.accent,
                            fontSize: "0.5rem",
                            fontWeight: 900,
                            letterSpacing: 0.5,
                            bgcolor: `${colors.accent}15`,
                            px: 0.5,
                            py: 0.15,
                            borderRadius: 0.5,
                            lineHeight: 1,
                            ml: 0.5,
                            verticalAlign: "middle",
                          }}
                        >
                          180
                        </Typography>
                      )}
                      {" "}
                      <Box component="span" sx={{ color: colors.text.muted, fontWeight: 400 }}>{t("common.vs")} {m.opponent}</Box>
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      color: isWin ? colors.green : colors.red,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      fontFamily: "'Courier New', monospace",
                      textAlign: "center",
                      minWidth: 36,
                      flexShrink: 0,
                    }}
                  >
                    {m.score}
                  </Typography>

                  <Typography sx={{ color: colors.text.muted, fontSize: "0.6rem", textAlign: "right", minWidth: 40, flexShrink: 0 }}>
                    {m.date}
                  </Typography>
                </Box>
              );
            })
          )}
        </Card>

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={totalPages}
              page={safePage}
              onChange={(_, p) => setPage(p)}
              size="small"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontSize: "0.75rem",
                  color: colors.text.secondary,
                  borderColor: "#d4d4d8",
                },
                "& .Mui-selected": {
                  bgcolor: `${colors.accent} !important`,
                  color: "#fff !important",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                },
              }}
            />
          </Box>
        )}
      </Section>
    </PageLayout>
  );
}
