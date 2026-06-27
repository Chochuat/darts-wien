import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import ArrowBack from "@mui/icons-material/ArrowBack";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Cancel from "@mui/icons-material/Cancel";
import SportsEsports from "@mui/icons-material/SportsEsports";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import CompareArrows from "@mui/icons-material/CompareArrows";
import EventIcon from "@mui/icons-material/Event";
import Person from "@mui/icons-material/Person";
import SportsScore from "@mui/icons-material/SportsScore";
import { colors, borderForRank } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import Card from "@/app/_components/ui/card";
import RankBadge from "@/app/_components/ui/rank-badge";
import FormIndicator from "@/app/_components/ui/form-indicator";
import { findBySlug } from "@/app/_components/standings/data";
import type { MatchResult } from "@/app/_components/standings/data";

function MatchHistoryRow({ match }: { match: MatchResult }) {
  const isWin = match.result === "W";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: { xs: 1.75, md: 2.5 },
        py: 1.25,
        borderTop: "1px solid #f0f0f0",
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: isWin ? colors.green : colors.red,
          flexShrink: 0,
        }}
      />

      <Typography sx={{ color: colors.text.muted, fontSize: "0.65rem", minWidth: 44, fontWeight: 500 }}>
        {match.date}
      </Typography>

      <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 0.75 }}>
        {isWin ? (
          <CheckCircle sx={{ color: colors.green, fontSize: "0.85rem" }} />
        ) : (
          <Cancel sx={{ color: colors.red, fontSize: "0.85rem" }} />
        )}
        <Typography
          sx={{
            color: colors.text.secondary,
            fontSize: "0.85rem",
            fontWeight: 500,
          }}
        >
          vs <strong>{match.opponent}</strong>
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Typography
          sx={{
            color: isWin ? colors.green : colors.red,
            fontWeight: 800,
            fontSize: "0.9rem",
            fontFamily: "'Courier New', monospace",
            minWidth: 40,
            textAlign: "center",
          }}
        >
          {match.score}
        </Typography>
        <Box
          sx={{
            bgcolor: isWin ? `${colors.green}12` : `${colors.red}12`,
            borderRadius: 1,
            px: 1,
            py: 0.25,
            minWidth: 40,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              color: isWin ? colors.green : colors.red,
              fontWeight: 800,
              fontSize: "0.6rem",
              letterSpacing: 1,
            }}
          >
            {isWin ? "WIN" : "LOSS"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default async function PlayerMatchesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const player = findBySlug(slug);

  if (!player) {
    return (
      <Box sx={{ bgcolor: colors.background, minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", px: 2 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, mb: 1 }}>
            Player not found
          </Typography>
          <Link href="/" style={{ color: colors.accent, textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
            ← Back to standings
          </Link>
        </Box>
      </Box>
    );
  }

  const sortedMatches = [...player.matches].reverse();
  const setDiff = player.setsFor - player.setsAgainst;
  const setDiffStr = setDiff > 0 ? `+${setDiff}` : `${setDiff}`;

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: "100dvh" }}>
      <Box sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, md: 3 } }}>
        <Section>
          {/* Back link */}
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "flex-start" },
              mb: 2,
            }}
          >
            <Link
              href="/"
              style={{ textDecoration: "none" }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  py: { xs: 1, md: 0 },
                }}
              >
                <ArrowBack sx={{ color: colors.accent, fontSize: "1rem" }} />
                <Typography sx={{ color: colors.accent, fontSize: "0.85rem", fontWeight: 600 }}>
                  Back to standings
                </Typography>
              </Box>
            </Link>
          </Box>

          {/* Player header */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { md: "center" },
              gap: { xs: 1.5, md: 2 },
              mb: 2.5,
              px: 0.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <RankBadge position={player.pos} />
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Typography
                    sx={{
                      color: colors.text.primary,
                      fontWeight: 800,
                      fontSize: { xs: "1.2rem", md: "1.5rem" },
                      lineHeight: 1.2,
                    }}
                  >
                    {player.name}
                  </Typography>
                  {player.pos === 1 && <EmojiEvents sx={{ color: colors.gold, fontSize: "1.2rem" }} />}
                </Box>
                <Typography sx={{ color: colors.text.muted, fontSize: "0.65rem", mt: 0.1 }}>
                  {player.team}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: { xs: 1.5, md: 3 },
                flexWrap: "wrap",
                ml: { md: "auto" },
              }}
            >
              <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                <Typography sx={{ display: "flex", alignItems: "center", gap: 0.3, justifyContent: { md: "flex-end" }, color: colors.text.muted, fontSize: "0.5rem", fontWeight: 700, letterSpacing: 1 }}>
                  <CheckCircle sx={{ fontSize: "0.55rem", color: colors.green }} />
                  RECORD
                </Typography>
                <Typography sx={{ color: colors.text.primary, fontWeight: 800, fontSize: "0.95rem" }}>
                  {player.wins}W / {player.losses}L
                </Typography>
              </Box>
              <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                <Typography sx={{ display: "flex", alignItems: "center", gap: 0.3, justifyContent: { md: "flex-end" }, color: colors.text.muted, fontSize: "0.5rem", fontWeight: 700, letterSpacing: 1 }}>
                  <SportsScore sx={{ fontSize: "0.55rem", color: colors.accent }} />
                  POINTS
                </Typography>
                <Typography sx={{ color: colors.accent, fontWeight: 900, fontSize: "1.1rem" }}>
                  {player.points}
                </Typography>
              </Box>
              <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                <Typography sx={{ display: "flex", alignItems: "center", gap: 0.3, justifyContent: { md: "flex-end" }, color: colors.text.muted, fontSize: "0.5rem", fontWeight: 700, letterSpacing: 1 }}>
                  <CompareArrows sx={{ fontSize: "0.55rem", color: colors.text.muted }} />
                  FORM
                </Typography>
                <FormIndicator form={player.form} />
              </Box>
            </Box>
          </Box>

          {/* Season summary */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 2,
              px: 0.5,
              mb: 2,
            }}
          >
            {[
              { label: "Matches Played", value: player.played, icon: <SportsEsports sx={{ fontSize: "0.7rem" }} /> },
              { label: "Sets Won", value: player.setsFor, color: colors.green, icon: <ArrowUpward sx={{ fontSize: "0.7rem" }} /> },
              { label: "Sets Lost", value: player.setsAgainst, color: colors.red, icon: <ArrowDownward sx={{ fontSize: "0.7rem" }} /> },
              { label: "Set Difference", value: setDiffStr, color: setDiff > 0 ? colors.green : colors.red, icon: <CompareArrows sx={{ fontSize: "0.7rem" }} /> },
            ].map((s) => (
              <Box key={s.label} sx={{ bgcolor: `${colors.accent}08`, borderRadius: 1.5, px: 1.5, py: 1 }}>
                <Typography sx={{ color: colors.text.secondary, fontSize: "0.6rem", fontWeight: 700, letterSpacing: 1, mb: 0.2, display: "flex", alignItems: "center", gap: 0.3 }}>
                  {s.icon}
                  {s.label}
                </Typography>
                <Typography sx={{ color: s.color ?? colors.text.primary, fontWeight: 800, fontSize: "1rem" }}>
                  {s.value}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Match list */}
          <Card borderColor={borderForRank(player.pos)}>
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                px: 2.5,
                py: 1,
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, minWidth: 44 }}>
                <EventIcon sx={{ color: colors.text.muted, fontSize: "0.6rem" }} />
                <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", fontWeight: 700, letterSpacing: 1 }}>
                  DATE
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, flex: 1 }}>
                <Person sx={{ color: colors.text.muted, fontSize: "0.6rem" }} />
                <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", fontWeight: 700, letterSpacing: 1 }}>
                  OPPONENT
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.3, minWidth: 100 }}>
                <SportsScore sx={{ color: colors.text.muted, fontSize: "0.6rem" }} />
                <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", fontWeight: 700, letterSpacing: 1 }}>
                  RESULT
                </Typography>
              </Box>
            </Box>

            {sortedMatches.length === 0 ? (
              <Box sx={{ py: 3, textAlign: "center" }}>
                <Typography sx={{ color: colors.text.muted, fontSize: "0.8rem" }}>
                  No matches recorded yet.
                </Typography>
              </Box>
            ) : (
              sortedMatches.map((m, i) => <MatchHistoryRow key={i} match={m} />)
            )}
          </Card>

          {/* Mobile season stats */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              gap: 1,
              mt: 2,
              px: 0.5,
            }}
          >
            {[
              { label: "P", value: player.played, icon: <SportsEsports sx={{ fontSize: "0.6rem" }} /> },
              { label: "W", value: player.wins, color: colors.green, icon: <ArrowUpward sx={{ fontSize: "0.6rem" }} /> },
              { label: "L", value: player.losses, color: colors.red, icon: <ArrowDownward sx={{ fontSize: "0.6rem" }} /> },
              { label: "±", value: setDiffStr, color: setDiff > 0 ? colors.green : colors.red, icon: <CompareArrows sx={{ fontSize: "0.6rem" }} /> },
            ].map((s) => (
              <Box
                key={s.label}
                sx={{
                  flex: 1,
                  bgcolor: `${colors.accent}08`,
                  borderRadius: 1.5,
                  px: 1,
                  py: 1.25,
                  textAlign: "center",
                }}
              >
                <Typography sx={{ color: s.color ?? colors.text.primary, fontSize: "0.95rem", fontWeight: 800 }}>
                  {s.value}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.25, mt: 0.15 }}>
                  {s.icon}
                  <Typography sx={{ color: colors.text.secondary, fontSize: "0.55rem", fontWeight: 700, letterSpacing: 1 }}>
                    {s.label}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Section>
      </Box>
    </Box>
  );
}
