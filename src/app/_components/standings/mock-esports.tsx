"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ArrowForward from "@mui/icons-material/ArrowForward";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import TrackChanges from "@mui/icons-material/TrackChanges";
import History from "@mui/icons-material/History";
import Link from "next/link";
import { colors, borderForRank } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import Card from "@/app/_components/ui/card";
import AppBar from "@/app/_components/ui/app-bar";
import RankBadge from "@/app/_components/ui/rank-badge";
import StatLabel from "@/app/_components/ui/stat-label";
import FormIndicator from "@/app/_components/ui/form-indicator";
import LiveIndicator from "@/app/_components/ui/live-indicator";
import MatchRow from "@/app/_components/ui/match-row";
import Sidebar from "@/app/_components/ui/sidebar";
import { standingsData, slugify } from "./data";

const totalMatches = standingsData.reduce((acc, p) => acc + p.played, 0) / 2;

export default function MockEsports() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (name: string) => {
    setExpanded((prev) => (prev === name ? null : name));
  };

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: "100%" }}>
      <AppBar />
      <Sidebar />

      <Box sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, md: 3 }, ml: { lg: "100px" } }}>
        <Section>
          {/* Header */}
          <Box
            sx={{
              display: { xs: "block", md: "flex" },
              alignItems: { md: "flex-end" },
              justifyContent: { md: "space-between" },
              mb: { xs: 2.5, md: 2 },
              px: 0.5,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.3 }}>
                <LiveIndicator />
                <Typography
                  sx={{
                    color: colors.text.primary,
                    fontWeight: 800,
                    fontSize: { xs: "1.15rem", md: "1.5rem" },
                    letterSpacing: 1,
                  }}
                >
                  Standings
                </Typography>
              </Box>
              <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", letterSpacing: 2, fontWeight: 600 }}>
                Darts Liga Wien · 2025/26
              </Typography>
            </Box>

            {/* Desktop league summary */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                gap: 3,
                mt: 1,
              }}
            >
              {[
                { label: "Players", value: standingsData.length },
                { label: "Matches", value: totalMatches },
                { label: "Top Streak", value: "9W" },
              ].map((s) => (
                <Box key={s.label} sx={{ textAlign: "right" }}>
                  <Typography sx={{ color: colors.text.muted, fontSize: "0.5rem", fontWeight: 700, letterSpacing: 1 }}>
                    {s.label}
                  </Typography>
                  <Typography sx={{ color: colors.text.primary, fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.2 }}>
                    {s.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>



          {/* Player cards */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: { xs: 1.25, md: 1 } }}>
            {standingsData.map((p) => {
              const isOpen = expanded === p.name;

              return (
                <Card key={p.name} borderColor={borderForRank(p.pos)} hoverBorderColor={p.pos === 1 ? "#fde68a" : p.pos === 2 ? "#d4d4d8" : p.pos === 3 ? "#e8a75d" : colors.accent}>
                  <Box onClick={() => toggle(p.name)} sx={{ cursor: "pointer" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        px: { xs: 1.75, md: 2.5 },
                        py: { xs: 1.5, md: 1.25 },
                        gap: { xs: 1.5, md: 2 },
                      }}
                    >
                      <RankBadge position={p.pos} />

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.15 }}>
                          <Typography
                            sx={{
                              color: p.pos <= 3 ? colors.text.primary : colors.text.secondary,
                              fontWeight: 700,
                              fontSize: { xs: "0.85rem", md: "0.9rem" },
                              lineHeight: 1.2,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.name}
                          </Typography>
                          {p.pos === 1 && (
                            <EmojiEvents sx={{ color: colors.gold, fontSize: "1rem" }} />
                          )}
                        </Box>

                        <Typography
                          sx={{
                            color: colors.text.muted,
                            fontSize: { xs: "0.6rem", md: "0.65rem" },
                          }}
                        >
                          {p.team}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: { xs: 1.25, md: 2 },
                            mt: 0.5,
                            flexWrap: "wrap",
                          }}
                        >
                          <StatLabel label="P" value={p.played} />
                          <StatLabel label="W" value={p.wins} labelColor={colors.green} />
                          <StatLabel label="L" value={p.losses} labelColor={colors.red} />
                          <StatLabel label="SETS" value={`${p.setsFor}:${p.setsAgainst}`} />
                          <FormIndicator form={p.form} />
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                        <Typography
                          sx={{
                            color: p.pos === 1 ? colors.accent : colors.text.primary,
                            fontWeight: 900,
                            fontSize: p.pos === 1 ? "1.6rem" : p.pos <= 3 ? "1.35rem" : "1.15rem",
                            lineHeight: 1,
                            letterSpacing: -0.5,
                          }}
                        >
                          {p.points}
                        </Typography>
                        <Typography
                          sx={{
                            color: colors.text.muted,
                            fontSize: "0.45rem",
                            letterSpacing: 2,
                            fontWeight: 700,
                            mt: 0.1,
                          }}
                        >
                          PTS
                        </Typography>
                      </Box>

                      <ExpandMore
                        sx={{
                          color: colors.text.muted,
                          fontSize: "1.3rem",
                          transition: "transform 0.2s",
                          transform: isOpen ? "rotate(180deg)" : "none",
                        }}
                      />
                    </Box>
                  </Box>

                  <Collapse in={isOpen}>
                    <Box sx={{ borderTop: `1px solid #e4e4e7` }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: { xs: 1.75, md: 2.5 }, py: 0.75 }}>
                        <History sx={{ color: colors.text.muted, fontSize: "0.65rem" }} />
                        <Typography
                          sx={{
                            color: colors.text.muted,
                            fontSize: "0.55rem",
                            fontWeight: 700,
                            letterSpacing: 1,
                          }}
                        >
                          LAST 5 MATCHES
                        </Typography>
                      </Box>

                      {p.matches.map((m, i) => (
                        <MatchRow key={i} match={m} />
                      ))}

                      <Box sx={{ borderTop: "1px solid #f0f0f0", px: { xs: 1.75, md: 2.5 }, py: { xs: 1, md: 0.75 } }}>
                        <Link
                          href={`/matches/${slugify(p.name)}`}
                          style={{ textDecoration: "none", display: "block" }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 0.5,
                              bgcolor: `${colors.accent}0d`,
                              borderRadius: 1.5,
                              py: { xs: 1.25, md: 0.75 },
                              px: 2,
                              transition: "background 0.15s",
                              "&:hover": { bgcolor: `${colors.accent}15` },
                            }}
                          >
                            <Typography
                              sx={{
                                color: colors.accent,
                                fontSize: "0.75rem",
                                fontWeight: 700,
                              }}
                            >
                              View all matches
                            </Typography>
                            <ArrowForward sx={{ color: colors.accent, fontSize: "0.9rem" }} />
                          </Box>
                        </Link>
                      </Box>
                    </Box>
                  </Collapse>
                </Card>
              );
            })}
          </Box>
        </Section>
      </Box>
    </Box>
  );
}
