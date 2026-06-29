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
import { toPerspective, groupMatchesFromPerspective, type PerspectiveMatch } from "./perspective-utils";
import { cell, SetsDiff, PlayoffRound, FinalStandingsRow } from "./playoff-bracket";
import type {
  TournamentDetailResponse,
  TournamentSummary,
  ApiTournamentGroup,
} from "@/lib/validation";

/**
 * Returns perspective matches for a given playoff round.
 *
 * @param detail - The full tournament detail response.
 * @param roundName - The name of the playoff round to retrieve matches for.
 * @returns An array of perspective matches for the specified round.
 */
const playoffMatchesForRound = (detail: TournamentDetailResponse, roundName: string): PerspectiveMatch[] => {
  return detail.playoffs.find((r) => r.name === roundName)?.matches.flatMap((m) => {
    if (!m.player1 || !m.player2) return [];
    const p1 = toPerspective(m, m.player1.name);
    const p2 = toPerspective(m, m.player2.name);
    return [p1, p2].filter((p): p is PerspectiveMatch => p != null);
  }) ?? [];
};

const FormatInfoBox = ({ isGrandFinal }: { isGrandFinal: boolean }) => {
  const { t } = useTranslation();

  const bullets = isGrandFinal
    ? [
        { color: colors.gold, text: t("tournamentDetail.grandFinalQfFormat", { game: GRAND_FINAL_FORMAT.quarterfinal.game, legs: GRAND_FINAL_FORMAT.quarterfinal.legs }) },
        { color: colors.gold, text: t("tournamentDetail.grandFinalSfFormat", { game: GRAND_FINAL_FORMAT.semifinal.game, legs: GRAND_FINAL_FORMAT.semifinal.legs }) },
        { color: colors.bronze, text: t("tournamentDetail.grandFinalFinalFormat", { game: GRAND_FINAL_FORMAT.final.game, legs: GRAND_FINAL_FORMAT.final.legs }) },
      ]
    : [
        { color: colors.accent, text: t("tournamentDetail.groupsFormat", { game: GROUP_FORMAT.game, legs: GROUP_FORMAT.legs, maxThrows: GROUP_FORMAT.maxThrows }) },
        { color: colors.gold, text: t("tournamentDetail.playoffsFormat", { game: PLAYOFF_FORMAT.game, legs: PLAYOFF_FORMAT.legs, maxThrows: PLAYOFF_FORMAT.maxThrows }) },
        { color: colors.green, text: t("tournamentDetail.rules") },
      ];

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 2, px: 1.5, py: 1.25, bgcolor: `${colors.accent}08`, borderRadius: 2, border: "1px solid", borderColor: `${colors.accent}15` }}>
      {bullets.map((b) => (
        <Box key={b.text} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: b.color, flexShrink: 0 }} />
          <Typography sx={{ color: colors.text.secondary, fontSize: "0.7rem", fontWeight: 600 }}>{b.text}</Typography>
        </Box>
      ))}
    </Box>
  );
};

/**
 * Renders a group standings table with expandable match list.
 *
 * @param props - Component props.
 */
const GroupStandingsTable = ({
  group,
  advancingSet,
  expandedMatches,
  onToggle,
}: {
  group: ApiTournamentGroup;
  advancingSet: Set<string>;
  expandedMatches: Record<string, boolean>;
  onToggle: (name: string) => void;
}) => {
  const { t } = useTranslation();
  const matchesVisible = expandedMatches[group.label] ?? false;
  const groupMatches = groupMatchesFromPerspective(group);

  return (
    <Box sx={{ border: "1px solid #e4e4e7", borderRadius: 2, overflow: "hidden" }}>
      <Box sx={{ bgcolor: `${colors.accent}0a`, px: 1.5, py: 0.75, borderBottom: "1px solid #e4e4e7" }}>
        <Typography sx={{ color: colors.text.primary, fontWeight: 700, fontSize: "0.8rem" }}>
          {t("common.group", { name: group.label })}
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

        {group.standings.map((s, i) => {
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
              <SetsDiff setsAgainst={s.setsAgainst} setsFor={s.setsFor} />
              {cell(s.points, { bold: true })}
            </Box>
          );
        })}
      </Box>

      <Box onClick={() => onToggle(group.label)} sx={{ borderTop: "1px solid #f0f0f0", px: 1.5, py: 0.6, display: "flex", alignItems: "center", gap: 0.4, cursor: "pointer", "&:hover": { bgcolor: `${colors.accent}06` }, transition: "background 0.15s" }}>
        <Typography sx={{ color: colors.text.muted, fontSize: "0.6rem", fontWeight: 700, letterSpacing: 1, flex: 1 }}>
          {matchesVisible ? t("tournamentDetail.hideMatches") : t("tournamentDetail.showMatches")}
        </Typography>
        <ExpandMore sx={{ color: colors.text.muted, fontSize: "0.9rem", transition: "transform 0.2s", transform: matchesVisible ? "rotate(180deg)" : "none" }} />
      </Box>

      <Collapse in={matchesVisible}>
        <Box sx={{ px: 1.5, py: 0.5, borderTop: "1px solid #f0f0f0" }}>
          {groupMatches.filter((m) => m.result === "W").map((m) => (
            <Box key={`${m.playerName}-${m.opponent}-${m.score}`} sx={{ display: "flex", alignItems: "center", gap: 0.5, py: 0.2 }}>
              <CheckCircle sx={{ color: colors.green, fontSize: "0.55rem", flexShrink: 0 }} />
              <Typography sx={{ color: colors.text.secondary, fontSize: "0.75rem", fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {m.playerName}
              </Typography>
              {m.one80 > 0 ? <Badge180 /> : null}
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
};

/**
 * Tournament detail page component.
 *
 * @param props - Component properties.
 */
const TournamentDetail = ({
  detail,
  summary,
}: {
  detail: TournamentDetailResponse;
  summary: TournamentSummary;
}) => {
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
    detail.playoffs.flatMap((r) => r.matches).flatMap((m) => [
      m.player1?.name, m.player2?.name,
    ].filter((n): n is string => n != null))
  );
  const allGroupPlayerNames = detail.groups.flatMap((g) => g.players.map((p) => p.name));
  const advancingSet = new Set(allGroupPlayerNames.filter((p) => allPlayoffPlayerNames.has(p)));

  return (
    <PageLayout>
      <Section>
        <Box sx={{ px: 0.5, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <EmojiEvents sx={{ color: colors.gold, fontSize: "1.8rem" }} />
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography sx={{ color: colors.text.primary, fontWeight: 800, fontSize: { xs: "1.35rem", md: "1.75rem" }, letterSpacing: 1, lineHeight: 1.1 }}>
                  {isGrandFinal ? t("tournamentDetail.grandFinalTitle") : t("common.week", { week: summary.weekNumber })}
                </Typography>
                {isGrandFinal ? <Typography sx={{ color: colors.goldText, fontSize: "0.55rem", fontWeight: 900, letterSpacing: 2, bgcolor: `${colors.gold}20`, px: 1, py: 0.35, borderRadius: 1, lineHeight: 1 }}>
                    {t("tournamentDetail.grandFinal")}
                  </Typography> : null}
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
              {isGrandFinal ? t("tournamentDetail.playersGrandFinal", { count: 8 }) : t("tournamentDetail.players", { count: summary.playerCount })}
            </Typography>
            {!isGrandFinal ? <Typography sx={{ color: colors.text.muted, fontSize: "0.7rem" }}>
                {t("tournamentDetail.groupMatches", { count: summary.groupMatchCount })}
              </Typography> : null}
            <Typography sx={{ color: colors.text.muted, fontSize: "0.7rem" }}>
              {t("tournamentDetail.playoffMatches", { count: summary.playoffMatchCount })}
            </Typography>
          </Box>

          <FormatInfoBox isGrandFinal={isGrandFinal} />
        </Box>

        {!isGrandFinal ? <Box sx={{ px: 0.5, mb: 3 }}>
          <SectionHeading icon={<Groups />} label={t("tournamentDetail.groups")} />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            {detail.groups.map((g) => (
              <GroupStandingsTable advancingSet={advancingSet} expandedMatches={expandedMatches} group={g} key={g.label} onToggle={toggleMatches} />
            ))}
          </Box>
        </Box> : null}

        <Box sx={{ px: 0.5, mb: 3 }}>
          <SectionHeading icon={<EmojiEvents />} label={t("tournamentDetail.playoffs")} />
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: { xs: 1.5, md: 2 }, alignItems: { md: "flex-start" }, justifyContent: { md: "center" } }}>
            <PlayoffRound
              allPlayoffEntries={playoffMatchesForRound(detail, "Quarter-Finals")}
              bgcolor={`${colors.accent}06`}
              borderColor={`${colors.accent}15`}
              color={colors.accent}
              roundLabel={t("tournamentDetail.quarterFinals")}
              roundName="Quarter-Finals"
            />
            <PlayoffRound
              allPlayoffEntries={playoffMatchesForRound(detail, "Semi-Finals")}
              bgcolor={`${colors.accent}0a`}
              borderColor={`${colors.accent}25`}
              color={colors.accent}
              roundLabel={t("tournamentDetail.semiFinals")}
              roundName="Semi-Finals"
            />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1, maxWidth: { md: 300 } }}>
              <PlayoffRound
                allPlayoffEntries={playoffMatchesForRound(detail, "3rd Place")}
                bgcolor={`${colors.bronze}12`}
                borderColor={`${colors.bronze}30`}
                color={colors.bronze}
                roundLabel={t("tournamentDetail.thirdPlace")}
                roundName="3rd Place"
              />
              <PlayoffRound
                allPlayoffEntries={playoffMatchesForRound(detail, "Final")}
                bgcolor={`${colors.gold}15`}
                borderColor={colors.gold}
                color={colors.goldText}
                roundLabel={t("tournamentDetail.final")}
                roundName="Final"
              />
            </Box>
          </Box>
        </Box>

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
              <FinalStandingsRow i={i} key={s.player.name} s={s} />
            ))}
          </Box>
        </Box>
      </Section>
    </PageLayout>
  );
}

export default TournamentDetail;
