"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Groups from "@mui/icons-material/Groups";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import SectionHeading from "@/app/_components/ui/section-heading";
import Badge180 from "@/app/_components/ui/badge-180";
import PageLayout from "@/app/_components/ui/page-layout";
import { GROUP_FORMAT, PLAYOFF_FORMAT, GRAND_FINAL_FORMAT } from "@/app/_components/tournaments/format-constants";
import type {
  TournamentDetailResponse,
  TournamentSummary,
  ApiTournamentGroup,
  ApiMatchRow,
  ApiFinalStandingEntry,
} from "@/lib/validation";

interface PerspectiveMatch {
  playerName: string;
  opponent: string;
  score: string;
  result: "W" | "L";
  one80: number;
}

function toPerspective(m: ApiMatchRow, forPlayerName: string): PerspectiveMatch | null {
  const isP1 = m.player1.name === forPlayerName;
  const isP2 = m.player2.name === forPlayerName;
  if (!isP1 && !isP2) return null;

  const p = isP1 ? m.player1 : m.player2;
  const opp = isP1 ? m.player2 : m.player1;
  const legsP = isP1 ? (m.legsPlayer1 ?? 0) : (m.legsPlayer2 ?? 0);
  const legsO = isP1 ? (m.legsPlayer2 ?? 0) : (m.legsPlayer1 ?? 0);
  const one80 = isP1 ? m.player1_180 : m.player2_180;
  return {
    playerName: p.name,
    opponent: opp.name,
    score: `${legsP}-${legsO}`,
    result: legsP > legsO ? "W" : "L",
    one80,
  };
}

function groupMatchesFromPerspective(g: ApiTournamentGroup): PerspectiveMatch[] {
  const entries: PerspectiveMatch[] = [];
  for (const m of g.matches) {
    const p1v = toPerspective(m, m.player1.name);
    const p2v = toPerspective(m, m.player2.name);
    if (p1v) entries.push(p1v);
    if (p2v) entries.push(p2v);
  }
  return entries;
}

function cell(label: string | number, opts?: { color?: string; bold?: boolean }) {
  return (
    <Typography
      sx={{
        color: opts?.color ?? colors.text.secondary,
        fontSize: "0.65rem",
        fontWeight: opts?.bold ? 800 : 600,
        textAlign: "center",
        minWidth: 28,
        flexShrink: 0,
      }}
    >
      {label}
    </Typography>
  );
}

function SetsDiff({ setsFor, setsAgainst }: { setsFor: number; setsAgainst: number }) {
  const diff = setsFor - setsAgainst;
  return (
    <Typography
      sx={{
        color: diff > 0 ? colors.green : diff < 0 ? colors.red : colors.text.muted,
        fontSize: "0.65rem",
        fontWeight: 700,
        textAlign: "center",
        minWidth: 30,
        flexShrink: 0,
      }}
    >
      {diff > 0 ? `+${diff}` : diff === 0 ? "0" : String(diff)}
    </Typography>
  );
}

function PlayoffMatch({
  m1,
  m2,
  resultKey,
  winnerStyle,
}: {
  m1: PerspectiveMatch;
  m2: PerspectiveMatch;
  resultKey: string;
  winnerStyle: "accent" | "gold" | "bronze";
}) {
  const scoreColor = winnerStyle === "gold" ? colors.goldText : colors.accent;
  const scoreWeight = winnerStyle === "gold" ? 900 : 800;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Box sx={{ flex: 1, textAlign: "right", minWidth: 0 }}>
        {winnerStyle === "gold" ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, justifyContent: "flex-end" }}>
            {m1.result === "W" && <EmojiEvents sx={{ color: colors.gold, fontSize: "0.75rem", flexShrink: 0 }} />}
            <Typography sx={{ color: colors.text.primary, fontSize: "0.75rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {m1.playerName}
            </Typography>
            {m1.one80 > 0 && <Badge180 />}
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, justifyContent: "flex-end" }}>
            <Typography sx={{ color: m1.result === "W" ? colors.text.primary : colors.text.muted, fontSize: "0.75rem", fontWeight: m1.result === "W" ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {m1.playerName}
            </Typography>
            {m1.one80 > 0 && <Badge180 />}
          </Box>
        )}
      </Box>
      <Typography sx={{ color: scoreColor, fontSize: "0.75rem", fontWeight: scoreWeight, fontFamily: "'Courier New', monospace", textAlign: "center", flexShrink: 0, minWidth: resultKey === "Final" ? 34 : 32 }}>
        {m1.score}
      </Typography>
      <Box sx={{ flex: 1, textAlign: "left", minWidth: 0, display: "flex", alignItems: "center", gap: 0.3 }}>
        <Typography sx={{ color: winnerStyle === "gold" && m2.result !== "W" ? colors.text.secondary : m2.result === "W" ? colors.text.primary : colors.text.muted, fontSize: "0.75rem", fontWeight: winnerStyle === "gold" ? (m2.result !== "W" ? 500 : 700) : m2.result === "W" ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {m2.playerName}
        </Typography>
        {m2.one80 > 0 && <Badge180 />}
      </Box>
    </Box>
  );
}

function PlayoffRound({
  roundName,
  roundLabel,
  allPlayoffEntries,
  color,
  borderColor,
  bgcolor,
}: {
  roundName: string;
  roundLabel: string;
  allPlayoffEntries: PerspectiveMatch[];
  color: string;
  borderColor: string;
  bgcolor: string;
}) {
  const pairs: { m1: PerspectiveMatch; m2: PerspectiveMatch }[] = [];
  for (let i = 0; i < allPlayoffEntries.length; i += 2) {
    if (allPlayoffEntries[i + 1]) pairs.push({ m1: allPlayoffEntries[i], m2: allPlayoffEntries[i + 1] });
  }

  const winnerStyle = roundName === "Final" ? "gold" : roundName === "3rd Place" ? "bronze" : "accent";

  return (
    <Box sx={{ flex: 1, maxWidth: { md: 300 } }}>
      <Typography sx={{ color, fontSize: "0.65rem", fontWeight: 700, letterSpacing: 1, mb: 0.75, textAlign: "center", textTransform: "uppercase" }}>
        {roundLabel}
      </Typography>
      {pairs.map(({ m1, m2 }, idx) => (
        <Box key={idx} sx={{ bgcolor, borderRadius: 1.5, px: 1.25, py: 0.7, mb: 0.5, border: "1px solid", borderColor }}>
          <PlayoffMatch m1={m1} m2={m2} resultKey={roundName} winnerStyle={winnerStyle} />
        </Box>
      ))}
    </Box>
  );
}

function FinalStandingsRow({ s, i }: { s: ApiFinalStandingEntry; i: number }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", px: 1.5, py: 0.5, borderBottom: "1px solid #f0f0f0", gap: 0.5, bgcolor: i === 0 ? `${colors.gold}12` : i === 1 ? `${colors.silver}12` : i === 2 ? `${colors.bronze}12` : i === 3 ? `${colors.accent}06` : "transparent" }}>
      <Box sx={{ width: 22, textAlign: "center", flexShrink: 0 }}>
        {i === 0 ? (
          <EmojiEvents sx={{ color: colors.gold, fontSize: "0.8rem" }} titleAccess="1st" />
        ) : i === 1 ? (
          <EmojiEvents sx={{ color: colors.silver, fontSize: "0.7rem" }} titleAccess="2nd" />
        ) : i === 2 ? (
          <EmojiEvents sx={{ color: colors.bronze, fontSize: "0.7rem" }} titleAccess="3rd" />
        ) : (
          <Typography sx={{ color: colors.text.subtle, fontSize: "0.6rem", fontWeight: 600 }}>
            {s.pos}
          </Typography>
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography sx={{ color: colors.text.primary, fontSize: "0.75rem", fontWeight: i <= 2 ? 700 : 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {s.player.name}
        </Typography>
      </Box>
      {cell(s.played)}
      {cell(s.wins, { color: colors.green })}
      {cell(s.losses, { color: colors.red })}
      {cell(`${s.setsFor}:${s.setsAgainst}`)}
      {cell(s.one80s, { color: colors.accent })}
      <SetsDiff setsFor={s.setsFor} setsAgainst={s.setsAgainst} />
      {cell(s.totalPoints, { bold: true })}
    </Box>
  );
}

export default function TournamentDetail({
  detail,
  summary,
}: {
  detail: TournamentDetailResponse;
  summary: TournamentSummary;
}) {
  const [expandedMatches, setExpandedMatches] = useState<Record<string, boolean>>({});
  const { t } = useTranslation();
  const isGrandFinal = summary.type === "grand_final";

  const toggleMatches = (groupName: string) => {
    setExpandedMatches((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const allPlayoffPlayerNames = new Set(
    detail.playoffs.flatMap((r) => r.matches).flatMap((m) => [m.player1.name, m.player2.name])
  );
  const allGroupPlayerNames = detail.groups.flatMap((g) => g.players.map((p) => p.name));
  const advancingSet = new Set(allGroupPlayerNames.filter((p) => allPlayoffPlayerNames.has(p)));

  return (
    <PageLayout>
      <Section>
        {/* Hero */}
        <Box sx={{ px: 0.5, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <EmojiEvents sx={{ color: colors.gold, fontSize: "1.8rem" }} />
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography
                  sx={{
                    color: colors.text.primary,
                    fontWeight: 800,
                    fontSize: { xs: "1.35rem", md: "1.75rem" },
                    letterSpacing: 1,
                    lineHeight: 1.1,
                  }}
                >
                  {isGrandFinal
                    ? t("tournamentDetail.grandFinalTitle")
                    : t("common.week", { week: summary.weekNumber })}
                </Typography>
                {isGrandFinal && (
                  <Typography
                    sx={{
                      color: colors.goldText,
                      fontSize: "0.55rem",
                      fontWeight: 900,
                      letterSpacing: 2,
                      bgcolor: `${colors.gold}20`,
                      px: 1,
                      py: 0.35,
                      borderRadius: 1,
                      lineHeight: 1,
                    }}
                  >
                    {t("tournamentDetail.grandFinal")}
                  </Typography>
                )}
              </Box>
              <Typography sx={{ color: colors.text.subtle, fontSize: "0.75rem", fontWeight: 600, mt: 0.15 }}>
                {summary.date}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <EmojiEvents sx={{ color: colors.gold, fontSize: "0.9rem" }} />
              <Typography sx={{ color: colors.goldText, fontSize: "0.8rem", fontWeight: 700 }}>
                {t("common.winner", { name: summary.winner?.name ?? "" })}
              </Typography>
            </Box>
            <Typography sx={{ color: colors.text.muted, fontSize: "0.7rem" }}>
              {isGrandFinal
                ? t("tournamentDetail.playersGrandFinal", { count: 8 })
                : t("tournamentDetail.players", { count: summary.playerCount })}
            </Typography>
            {!isGrandFinal && (
              <Typography sx={{ color: colors.text.muted, fontSize: "0.7rem" }}>
                {t("tournamentDetail.groupMatches", { count: summary.groupMatchCount })}
              </Typography>
            )}
            <Typography sx={{ color: colors.text.muted, fontSize: "0.7rem" }}>
              {t("tournamentDetail.playoffMatches", { count: summary.playoffMatchCount })}
            </Typography>
          </Box>

          {/* Format info */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              mt: 2,
              px: 1.5,
              py: 1.25,
              bgcolor: `${colors.accent}08`,
              borderRadius: 2,
              border: "1px solid",
              borderColor: `${colors.accent}15`,
            }}
          >
            {isGrandFinal ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: colors.gold, flexShrink: 0 }} />
                  <Typography sx={{ color: colors.text.secondary, fontSize: "0.7rem", fontWeight: 600 }}>
                    {t("tournamentDetail.grandFinalQfFormat", { game: GRAND_FINAL_FORMAT.quarterfinal.game, legs: GRAND_FINAL_FORMAT.quarterfinal.legs })}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: colors.gold, flexShrink: 0 }} />
                  <Typography sx={{ color: colors.text.secondary, fontSize: "0.7rem", fontWeight: 600 }}>
                    {t("tournamentDetail.grandFinalSfFormat", { game: GRAND_FINAL_FORMAT.semifinal.game, legs: GRAND_FINAL_FORMAT.semifinal.legs })}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: colors.bronze, flexShrink: 0 }} />
                  <Typography sx={{ color: colors.text.secondary, fontSize: "0.7rem", fontWeight: 600 }}>
                    {t("tournamentDetail.grandFinalFinalFormat", { game: GRAND_FINAL_FORMAT.final.game, legs: GRAND_FINAL_FORMAT.final.legs })}
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: colors.accent, flexShrink: 0 }} />
                  <Typography sx={{ color: colors.text.secondary, fontSize: "0.7rem", fontWeight: 600 }}>
                    {t("tournamentDetail.groupsFormat", { game: GROUP_FORMAT.game, legs: GROUP_FORMAT.legs, maxThrows: GROUP_FORMAT.maxThrows })}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: colors.gold, flexShrink: 0 }} />
                  <Typography sx={{ color: colors.text.secondary, fontSize: "0.7rem", fontWeight: 600 }}>
                    {t("tournamentDetail.playoffsFormat", { game: PLAYOFF_FORMAT.game, legs: PLAYOFF_FORMAT.legs, maxThrows: PLAYOFF_FORMAT.maxThrows })}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: colors.green, flexShrink: 0 }} />
                  <Typography sx={{ color: colors.text.secondary, fontSize: "0.7rem", fontWeight: 600 }}>
                    {t("tournamentDetail.rules")}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* Groups — hide for Grand Final */}
        {!isGrandFinal && (
        <Box sx={{ px: 0.5, mb: 3 }}>
          <SectionHeading icon={<Groups />} label={t("tournamentDetail.groups")} />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            {detail.groups.map((g) => {
              const matchesVisible = expandedMatches[g.label] ?? false;
              const groupMatches = groupMatchesFromPerspective(g);

              return (
                <Box key={g.label} sx={{ border: "1px solid #e4e4e7", borderRadius: 2, overflow: "hidden" }}>
                  <Box sx={{ bgcolor: `${colors.accent}0a`, px: 1.5, py: 0.75, borderBottom: "1px solid #e4e4e7" }}>
                    <Typography sx={{ color: colors.text.primary, fontWeight: 700, fontSize: "0.8rem" }}>
                      {t("common.group", { name: g.label })}
                    </Typography>
                  </Box>

                  <Box sx={{ px: 1, py: 0.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", px: 0.5, py: 0.4, gap: 0.25 }}>
                      <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", fontWeight: 700, width: 20, textAlign: "center" }}>#</Typography>
                      <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", fontWeight: 700, flex: 1, minWidth: 0 }}>{t("common.player")}</Typography>
                      {["played", "wins", "losses", "sets", "one80s", "diff", "pts"].map((h) => (
                        <Typography key={h} sx={{ color: colors.text.muted, fontSize: "0.55rem", fontWeight: 700, minWidth: h === "sets" || h === "diff" ? 30 : h === "one80s" ? 26 : 24, textAlign: "center" }}>
                          {t(`tableHeaders.${h}`)}
                        </Typography>
                      ))}
                    </Box>

                    {g.standings.map((s, i) => {
                      const advanced = advancingSet.has(s.player.name);
                      return (
                        <Box key={s.player.name} sx={{ display: "flex", alignItems: "center", px: 0.5, py: 0.4, borderRadius: 0.5, gap: 0.25, bgcolor: advanced ? `${colors.accent}12` : "transparent" }}>
                          <Box sx={{ width: 20, textAlign: "center", flexShrink: 0 }}>
                            {advanced ? (
                              <CheckCircle sx={{ color: colors.accent, fontSize: "0.6rem" }} titleAccess={t("tournamentDetail.advanced")} />
                            ) : (
                              <Typography sx={{ color: colors.text.subtle, fontSize: "0.55rem", fontWeight: 600 }}>{i + 1}</Typography>
                            )}
                          </Box>
                          <Typography sx={{ color: advanced ? colors.text.primary : colors.text.secondary, fontSize: "0.75rem", fontWeight: advanced ? 700 : 500, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {s.player.name}
                          </Typography>
                          {cell(s.played)}
                          {cell(s.wins, { color: colors.green })}
                          {cell(s.losses, { color: colors.red })}
                          {cell(`${s.setsFor}:${s.setsAgainst}`)}
                          {cell(s.one80s, { color: colors.accent })}
                          <SetsDiff setsFor={s.setsFor} setsAgainst={s.setsAgainst} />
                          {cell(s.points, { bold: true })}
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Toggle matches */}
                  <Box onClick={() => toggleMatches(g.label)} sx={{ borderTop: "1px solid #f0f0f0", px: 1.5, py: 0.6, display: "flex", alignItems: "center", gap: 0.4, cursor: "pointer", "&:hover": { bgcolor: `${colors.accent}06` }, transition: "background 0.15s" }}>
                    <Typography sx={{ color: colors.text.muted, fontSize: "0.6rem", fontWeight: 700, letterSpacing: 1, flex: 1 }}>
                      {matchesVisible ? t("tournamentDetail.hideMatches") : t("tournamentDetail.showMatches")}
                    </Typography>
                    <ExpandMore sx={{ color: colors.text.muted, fontSize: "0.9rem", transition: "transform 0.2s", transform: matchesVisible ? "rotate(180deg)" : "none" }} />
                  </Box>

                  <Collapse in={matchesVisible}>
                    <Box sx={{ px: 1.5, py: 0.5, borderTop: "1px solid #f0f0f0" }}>
                      {groupMatches.filter((m) => m.result === "W").map((m, i) => (
                        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.5, py: 0.2 }}>
                          <CheckCircle sx={{ color: colors.green, fontSize: "0.55rem", flexShrink: 0 }} />
                          <Typography sx={{ color: colors.text.secondary, fontSize: "0.75rem", fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {m.playerName}
                          </Typography>
            {m.one80 > 0 && <Badge180 />}
                          <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", flexShrink: 0 }}>{t("common.vs")}</Typography>
                          <Typography sx={{ color: colors.text.secondary, fontSize: "0.75rem", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {m.opponent}
                          </Typography>
                          <Typography sx={{ color: colors.accent, fontSize: "0.75rem", fontWeight: 700, fontFamily: "'Courier New', monospace", flexShrink: 0 }}>
                            {m.score}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        </Box>
        )}

        {/* Playoffs */}
        <Box sx={{ px: 0.5, mb: 3 }}>
          <SectionHeading icon={<EmojiEvents />} label={t("tournamentDetail.playoffs")} />

          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: { xs: 1.5, md: 2 }, alignItems: { md: "flex-start" }, justifyContent: { md: "center" } }}>
            <PlayoffRound
              roundName="Quarter-Finals"
              roundLabel={t("tournamentDetail.quarterFinals")}
              allPlayoffEntries={detail.playoffs.find((r) => r.name === "Quarter-Finals")?.matches.flatMap((m) => [toPerspective(m, m.player1.name)!, toPerspective(m, m.player2.name)!]) ?? []}
              color={colors.accent}
              borderColor={`${colors.accent}15`}
              bgcolor={`${colors.accent}06`}
            />
            <PlayoffRound
              roundName="Semi-Finals"
              roundLabel={t("tournamentDetail.semiFinals")}
              allPlayoffEntries={detail.playoffs.find((r) => r.name === "Semi-Finals")?.matches.flatMap((m) => [toPerspective(m, m.player1.name)!, toPerspective(m, m.player2.name)!]) ?? []}
              color={colors.accent}
              borderColor={`${colors.accent}25`}
              bgcolor={`${colors.accent}0a`}
            />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1, maxWidth: { md: 300 } }}>
              <PlayoffRound
                roundName="3rd Place"
                roundLabel={t("tournamentDetail.thirdPlace")}
                allPlayoffEntries={detail.playoffs.find((r) => r.name === "3rd Place")?.matches.flatMap((m) => [toPerspective(m, m.player1.name)!, toPerspective(m, m.player2.name)!]) ?? []}
                color={colors.bronze}
                borderColor={`${colors.bronze}30`}
                bgcolor={`${colors.bronze}12`}
              />
              <PlayoffRound
                roundName="Final"
                roundLabel={t("tournamentDetail.final")}
                allPlayoffEntries={detail.playoffs.find((r) => r.name === "Final")?.matches.flatMap((m) => [toPerspective(m, m.player1.name)!, toPerspective(m, m.player2.name)!]) ?? []}
                color={colors.goldText}
                borderColor={colors.gold}
                bgcolor={`${colors.gold}15`}
              />
            </Box>
          </Box>
        </Box>

        {/* Final Standings */}
        <Box sx={{ px: 0.5 }}>
          <SectionHeading icon={<EmojiEvents />} label={t("tournamentDetail.finalStandings")} />

          <Box sx={{ border: "1px solid #e4e4e7", borderRadius: 2, overflow: "hidden" }}>
            <Box sx={{ display: "flex", alignItems: "center", px: 1.5, py: 0.6, bgcolor: `${colors.accent}08`, borderBottom: "1px solid #e4e4e7", gap: 0.5 }}>
              <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", fontWeight: 700, width: 22, textAlign: "center" }}>#</Typography>
              <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", fontWeight: 700, flex: 1, minWidth: 0 }}>{t("common.player")}</Typography>
              {["played", "wins", "losses", "sets", "one80s", "diff", "pts"].map((h) => (
                <Typography key={h} sx={{ color: colors.text.muted, fontSize: "0.55rem", fontWeight: 700, minWidth: h === "sets" || h === "diff" ? 30 : h === "one80s" ? 26 : 24, textAlign: "center" }}>
                  {t(`tableHeaders.${h}`)}
                </Typography>
              ))}
            </Box>

            {detail.finalStandings.map((s, i) => (
              <FinalStandingsRow key={s.player.name} s={s} i={i} />
            ))}
          </Box>
        </Box>
      </Section>
    </PageLayout>
  );
}
