"use client";

import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Link from "next/link";
import ArrowBack from "@mui/icons-material/ArrowBack";
import SportsEsports from "@mui/icons-material/SportsEsports";
import Search from "@mui/icons-material/Search";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Cancel from "@mui/icons-material/Cancel";
import { colors } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import Card from "@/app/_components/ui/card";
import { allMatches, standingsData, uniqueTeams } from "@/app/_components/standings/data";

const playerNames = standingsData.map((p) => p.name);

function matchFilter(match: (typeof allMatches)[number], filters: { player: string; team: string; result: string; dateQ: string; scoreQ: string; opponentQ: string }) {
  if (filters.player && match.playerName !== filters.player) return false;
  if (filters.team && match.team !== filters.team) return false;
  if (filters.result && match.result !== filters.result) return false;
  if (filters.dateQ && !match.date.toLowerCase().includes(filters.dateQ.toLowerCase())) return false;
  if (filters.scoreQ && !match.score.toLowerCase().includes(filters.scoreQ.toLowerCase())) return false;
  if (filters.opponentQ && !match.opponent.toLowerCase().includes(filters.opponentQ.toLowerCase())) return false;
  return true;
}

export default function AllMatchesPage() {
  const [player, setPlayer] = useState("");
  const [team, setTeam] = useState("");
  const [result, setResult] = useState("");
  const [dateQ, setDateQ] = useState("");
  const [scoreQ, setScoreQ] = useState("");
  const [opponentQ, setOpponentQ] = useState("");

  const filtered = useMemo(
    () => allMatches.filter((m) => matchFilter(m, { player, team, result, dateQ, scoreQ, opponentQ })),
    [player, team, result, dateQ, scoreQ, opponentQ],
  );

  const clearAll = () => {
    setPlayer("");
    setTeam("");
    setResult("");
    setDateQ("");
    setScoreQ("");
    setOpponentQ("");
  };

  const hasFilters = player || team || result || dateQ || scoreQ || opponentQ;

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: "100dvh" }}>
      <Box sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, md: 3 } }}>
        <Section>
          {/* Back link */}
          <Box sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" }, mb: 2 }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, py: { xs: 1, md: 0 } }}>
                <ArrowBack sx={{ color: colors.accent, fontSize: "1rem" }} />
                <Typography sx={{ color: colors.accent, fontSize: "0.85rem", fontWeight: 600 }}>
                  Back to standings
                </Typography>
              </Box>
            </Link>
          </Box>

          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.3, px: 0.5 }}>
            <SportsEsports sx={{ color: colors.accent, fontSize: "1.2rem" }} />
            <Typography sx={{ color: colors.text.primary, fontWeight: 800, fontSize: { xs: "1.15rem", md: "1.5rem" }, letterSpacing: 1 }}>
              All Matches
            </Typography>
          </Box>
          <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", letterSpacing: 2, fontWeight: 600, mb: 2.5, px: 0.5 }}>
            {allMatches.length} total matches
          </Typography>

          {/* Filters */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, px: 0.5, mb: 2 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
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
                    placeholder="Player"
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        sx: { fontSize: "0.75rem", bgcolor: `${colors.accent}08`, "& fieldset": { borderColor: "#e4e4e7" } },
                      },
                    }}
                  />
                )}
              />

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={team}
                  displayEmpty
                  onChange={(e) => setTeam(e.target.value)}
                  sx={{ fontSize: "0.75rem", bgcolor: `${colors.accent}08`, "& fieldset": { borderColor: "#e4e4e7" } }}
                >
                  <MenuItem value="" sx={{ fontSize: "0.75rem" }}>All Teams</MenuItem>
                  {uniqueTeams.map((t) => (
                    <MenuItem key={t} value={t} sx={{ fontSize: "0.75rem" }}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <ToggleButtonGroup
                value={result}
                exclusive
                onChange={(_, v) => setResult(v ?? "")}
                size="small"
              >
                <ToggleButton value="" sx={{ fontSize: "0.7rem", px: 1.5, borderColor: "#e4e4e7" }}>All</ToggleButton>
                <ToggleButton value="W" sx={{ fontSize: "0.7rem", px: 1.5, borderColor: "#e4e4e7", color: colors.green }}>
                  <CheckCircle sx={{ fontSize: "0.75rem", mr: 0.3 }} /> Win
                </ToggleButton>
                <ToggleButton value="L" sx={{ fontSize: "0.7rem", px: 1.5, borderColor: "#e4e4e7", color: colors.red }}>
                  <Cancel sx={{ fontSize: "0.75rem", mr: 0.3 }} /> Loss
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
              <TextField
                placeholder="Search opponent..."
                value={opponentQ}
                onChange={(e) => setOpponentQ(e.target.value)}
                size="small"
                slotProps={{
                  input: {
                    startAdornment: <Search sx={{ fontSize: "0.85rem", mr: 0.5, color: colors.text.muted }} />,
                    sx: { fontSize: "0.75rem", bgcolor: `${colors.accent}08`, "& fieldset": { borderColor: "#e4e4e7" } },
                  },
                }}
                sx={{ minWidth: 160 }}
              />
              <TextField
                placeholder="Score (e.g. 3-0)"
                value={scoreQ}
                onChange={(e) => setScoreQ(e.target.value)}
                size="small"
                slotProps={{
                  input: {
                    sx: { fontSize: "0.75rem", bgcolor: `${colors.accent}08`, "& fieldset": { borderColor: "#e4e4e7" } },
                  },
                }}
                sx={{ minWidth: 130 }}
              />
              <TextField
                placeholder="Date (e.g. 20.06.)"
                value={dateQ}
                onChange={(e) => setDateQ(e.target.value)}
                size="small"
                slotProps={{
                  input: {
                    sx: { fontSize: "0.75rem", bgcolor: `${colors.accent}08`, "& fieldset": { borderColor: "#e4e4e7" } },
                  },
                }}
                sx={{ minWidth: 140 }}
              />
              {hasFilters && (
                <Typography
                  onClick={clearAll}
                  sx={{ color: colors.accent, fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  Clear all
                </Typography>
              )}
            </Box>
          </Box>

          {/* Results count */}
          <Typography sx={{ color: colors.text.muted, fontSize: "0.6rem", fontWeight: 600, px: 0.5, mb: 1 }}>
            {filtered.length} match{filtered.length !== 1 ? "es" : ""} found
          </Typography>

          {/* Match list */}
          <Card>
            {filtered.length === 0 ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography sx={{ color: colors.text.muted, fontSize: "0.85rem" }}>
                  No matches match your filters.
                </Typography>
              </Box>
            ) : (
              filtered.map((m, i) => {
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
                      gap: { xs: 1, md: 1.5 },
                    }}
                  >
                    <Box sx={{ flexShrink: 0 }}>
                      {isWin ? (
                        <CheckCircle sx={{ color: colors.green, fontSize: "0.8rem" }} />
                      ) : (
                        <Cancel sx={{ color: colors.red, fontSize: "0.8rem" }} />
                      )}
                    </Box>

                    <Box sx={{ minWidth: 0, flex: { xs: 1, md: "none" }, md: { width: 160 } }}>
                      <Link href={`/matches/${m.playerName.toLowerCase().replace(/\s+/g, "-")}`} style={{ textDecoration: "none" }}>
                        <Typography
                          sx={{
                            color: colors.accent,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            "&:hover": { textDecoration: "underline" },
                          }}
                        >
                          {m.playerName}
                        </Typography>
                      </Link>
                      <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.team}
                      </Typography>
                    </Box>

                    <Box sx={{ display: { xs: "none", md: "block" }, flex: 1, minWidth: 0 }}>
                      <Typography sx={{ color: colors.text.secondary, fontSize: "0.75rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        vs {m.opponent}
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
        </Section>
      </Box>
    </Box>
  );
}
