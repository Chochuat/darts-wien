"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ArrowForward from "@mui/icons-material/ArrowForward";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import History from "@mui/icons-material/History";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { colors, borderForRank } from "@/lib/design-tokens";
import Card from "@/app/_components/ui/card";
import RankBadge from "@/app/_components/ui/rank-badge";
import StatLabel from "@/app/_components/ui/stat-label";
import FormIndicator from "@/app/_components/ui/form-indicator";
import MatchRow from "@/app/_components/ui/match-row";
import type { StandingPlayer } from "@/lib/validation";

/**
 * Header summary shown next to the standings title (player count, matches, top streak).
 *
 * @param props - Component properties.
 */
export const StandingsHeaderSummary = ({ players, totalMatches }: { players: StandingPlayer[]; totalMatches: number }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3, mt: 1 }}>
      {[
        { label: t("common.players"), value: players.length },
        { label: t("common.matches"), value: totalMatches },
        { label: t("standings.topStreak"), value: `9${t("common.wAbbr")}` },
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
  );
};

/**
 * Expandable standings card for a single player, showing stats and last 5 matches.
 *
 * @param props - Component properties.
 */
export const StandingsPlayerCard = ({
  p,
  isOpen,
  onToggle,
}: {
  p: StandingPlayer;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <Card borderColor={borderForRank(p.pos)} hoverBorderColor={p.pos === 1 ? "#fde68a" : p.pos === 2 ? "#d4d4d8" : p.pos === 3 ? "#e8a75d" : colors.accent} key={p.slug}>
      <Box onClick={onToggle} sx={{ cursor: "pointer" }}>
        <Box sx={{ display: "flex", alignItems: "center", px: { xs: 1.75, md: 2.5 }, py: { xs: 1.5, md: 1.25 }, gap: { xs: 1.5, md: 2 } }}>
          <RankBadge position={p.pos} />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.15 }}>
              <Typography sx={{ color: p.pos <= 3 ? colors.text.primary : colors.text.secondary, fontWeight: 700, fontSize: { xs: "0.85rem", md: "0.9rem" }, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.name}
              </Typography>
              {p.pos === 1 ? <EmojiEvents sx={{ color: colors.gold, fontSize: "1rem" }} /> : null}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.25, md: 2 }, mt: 0.5, flexWrap: "wrap" }}>
              <StatLabel label={t("tableHeaders.played")} value={p.played} />
              <StatLabel label={t("tableHeaders.wins")} labelColor={colors.green} value={p.wins} />
              <StatLabel label={t("tableHeaders.losses")} labelColor={colors.red} value={p.losses} />
              <StatLabel label={t("tableHeaders.sets")} value={`${p.setsFor}:${p.setsAgainst}`} />
              {p.one80s > 0 ? <StatLabel label="180s" labelColor={colors.accent} value={p.one80s} /> : null}
              <FormIndicator form={p.form} />
            </Box>
          </Box>

          <Box sx={{ textAlign: "right", flexShrink: 0 }}>
            <Typography sx={{ color: p.pos === 1 ? colors.accent : colors.text.primary, fontWeight: 900, fontSize: p.pos === 1 ? "1.6rem" : p.pos <= 3 ? "1.35rem" : "1.15rem", lineHeight: 1, letterSpacing: -0.5 }}>
              {p.points}
            </Typography>
            <Typography sx={{ color: colors.text.muted, fontSize: "0.45rem", letterSpacing: 2, fontWeight: 700, mt: 0.1 }}>
              {t("standings.pts")}
            </Typography>
          </Box>

          <ExpandMore sx={{ color: colors.text.muted, fontSize: "1.3rem", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }} />
        </Box>
      </Box>

      <Collapse in={isOpen}>
        <Box sx={{ borderTop: "1px solid #e4e4e7" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: { xs: 1.75, md: 2.5 }, py: 0.75 }}>
            <History sx={{ color: colors.text.muted, fontSize: "0.65rem" }} />
            <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", fontWeight: 700, letterSpacing: 1 }}>
              {t("standings.last5")}
            </Typography>
          </Box>

          {p.recentMatches.slice(0, 5).map((m) => (
            <MatchRow key={`${m.date}-${m.opponent}`} match={m} />
          ))}

          <Box sx={{ borderTop: "1px solid #f0f0f0", px: { xs: 1.75, md: 2.5 }, py: { xs: 1, md: 0.75 } }}>
            <Link href={`/matches/${p.slug}`} style={{ textDecoration: "none", display: "block" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, bgcolor: `${colors.accent}0d`, borderRadius: 1.5, py: { xs: 1.25, md: 0.75 }, px: 2, transition: "background 0.15s", "&:hover": { bgcolor: `${colors.accent}15` } }}>
                <Typography sx={{ color: colors.accent, fontSize: "0.75rem", fontWeight: 700 }}>
                  {t("standings.viewAll")}
                </Typography>
                <ArrowForward sx={{ color: colors.accent, fontSize: "0.9rem" }} />
              </Box>
            </Link>
          </Box>
        </Box>
      </Collapse>
    </Card>
  );
};
