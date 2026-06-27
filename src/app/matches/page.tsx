"use client";

import { useState, useMemo, useEffect } from "react";
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
import { colors } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import Card from "@/app/_components/ui/card";
import AppBar from "@/app/_components/ui/app-bar";
import Sidebar from "@/app/_components/ui/sidebar";
import { allMatches, standingsData } from "@/app/_components/standings/data";

const PLAYERS_PER_PAGE = 20;

const playerNames = standingsData.map((p) => p.name);

function matchFilter(
  match: (typeof allMatches)[number],
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
  bgcolor: "#fff",
  color: colors.text.primary,
  "& .MuiInputBase-root": { fontSize: "0.75rem", bgcolor: "#fff", color: colors.text.primary },
  "& fieldset": { borderColor: "#d4d4d8" },
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

  const filtered = useMemo(
    () => allMatches.filter((m) => matchFilter(m, { player, result, scoreQ, quickQ })),
    [player, result, scoreQ, quickQ],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PLAYERS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PLAYERS_PER_PAGE, safePage * PLAYERS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [player, result, scoreQ, quickQ]);

  const clearAll = () => {
    setPlayer("");
    setResult("");
    setScoreQ("");
    setQuickQ("");
    setPage(1);
  };

  const hasFilters = player || result || scoreQ || quickQ;

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: "100dvh" }}>
      <AppBar />
      <Sidebar />
      <Box sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, md: 3 }, ml: { lg: "100px" } }}>
        <Section>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.3, px: 0.5 }}>
            <TrackChanges sx={{ color: colors.accent, fontSize: "1.2rem" }} />
            <Typography sx={{ color: colors.text.primary, fontWeight: 800, fontSize: { xs: "1.15rem", md: "1.5rem" }, letterSpacing: 1 }}>
              All Matches
            </Typography>
          </Box>
          <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", letterSpacing: 2, fontWeight: 600, mb: 2.5, px: 0.5 }}>
            {allMatches.length} total matches
          </Typography>

          {/* Filters — single row */}
          <Box sx={{ px: 0.5, mb: 2 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
              <ToggleButtonGroup
                value={result}
                exclusive
                onChange={(_, v) => setResult(v ?? "")}
                size="small"
              >
                <ToggleButton value="W" sx={{ fontSize: "0.7rem", px: 1.5, bgcolor: "#fff", borderColor: "#d4d4d8", color: colors.green, "&.Mui-selected": { bgcolor: colors.green, color: "#fff" } }}>
                  <CheckCircle sx={{ fontSize: "0.75rem", mr: 0.3 }} /> Win
                </ToggleButton>
                <ToggleButton value="L" sx={{ fontSize: "0.7rem", px: 1.5, bgcolor: "#fff", borderColor: "#d4d4d8", color: colors.red, "&.Mui-selected": { bgcolor: colors.red, color: "#fff" } }}>
                  <Cancel sx={{ fontSize: "0.75rem", mr: 0.3 }} /> Loss
                </ToggleButton>
              </ToggleButtonGroup>

              <TextField
                placeholder="Search player, opponent, score or date..."
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
                  bgcolor: showFilters ? colors.accent : "#fff",
                  border: "1px solid",
                  borderColor: "#d4d4d8",
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
                  Clear all
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
                      placeholder="Filter by player"
                      sx={inputSx}
                    />
                  )}
                />

                <TextField
                  placeholder="Score (e.g. 3-0)"
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
            {filtered.length} match{filtered.length !== 1 ? "es" : ""} found
          </Typography>

          {/* Match list */}
          <Card borderColor={colors.accent4d}>
            {filtered.length === 0 ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography sx={{ color: colors.text.muted, fontSize: "0.85rem" }}>
                  No matches match your filters.
                </Typography>
              </Box>
            ) : (
              paginated.map((m, i) => {
                const isWin = m.result === "W";
                return (
                  <Box
                    key={`${m.playerName}-${i}`}
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

                    <Box sx={{ minWidth: 0, flex: { xs: 1, md: "none" }, md: { width: 200 } }}>
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
                        {" "}
                        <Box component="span" sx={{ color: colors.text.muted, fontWeight: 400 }}>vs {m.opponent}</Box>
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

                    <Box
                      sx={{
                        bgcolor: isWin ? `${colors.green}12` : `${colors.red}12`,
                        borderRadius: 1,
                        px: 1,
                        py: 0.2,
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          color: isWin ? colors.green : colors.red,
                          fontWeight: 800,
                          fontSize: "0.55rem",
                          letterSpacing: 1,
                        }}
                      >
                        {isWin ? "WIN" : "LOSS"}
                      </Typography>
                    </Box>

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
      </Box>
    </Box>
  );
}
