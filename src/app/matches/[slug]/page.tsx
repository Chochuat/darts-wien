"use client";

import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import CheckCircle from "@mui/icons-material/CheckCircle";
import SportsScore from "@mui/icons-material/SportsScore";
import CompareArrows from "@mui/icons-material/CompareArrows";
import EventIcon from "@mui/icons-material/Event";
import Person from "@mui/icons-material/Person";
import { useTranslation } from "react-i18next";
import { colors, borderForRank } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import Card from "@/app/_components/ui/card";
import PageLayout from "@/app/_components/ui/page-layout";
import RankBadge from "@/app/_components/ui/rank-badge";
import FormIndicator from "@/app/_components/ui/form-indicator";
import { usePlayerBySlug } from "@/lib/hooks/use-players";
import { MatchHistoryRow } from "@/app/_components/ui/match-history-row";
import { PlayerDesktopStats, PlayerMobileStats, usePlayerStatBoxes } from "@/app/_components/ui/player-stat-summary";

/**
 * PlayerMatchesPage component.
 */
const PlayerMatchesPage = () => {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { data, isLoading, isError } = usePlayerBySlug(slug);
  const { t } = useTranslation();
  const { desktopStats, mobileStats } = usePlayerStatBoxes();

  if (isLoading) {
    return (
      <PageLayout>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: 2, minHeight: "100%" }}>
          <Typography sx={{ color: colors.text.muted, fontSize: "0.85rem" }}>{t("common.loading")}</Typography>
        </Box>
      </PageLayout>
    );
  }

  if (isError || !data) {
    return (
      <PageLayout>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: 2, minHeight: "100%" }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, mb: 1 }}>{t("common.playerNotFound")}</Typography>
            <Link href="/" style={{ color: colors.accent, textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>{t("common.backToStandings")}</Link>
          </Box>
        </Box>
      </PageLayout>
    );
  }

  const { player, matches } = data;
  const setDiff = player.setsFor - player.setsAgainst;
  const setDiffStr = setDiff > 0 ? `+${setDiff}` : `${setDiff}`;

  return (
    <PageLayout>
      <Section>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, gap: { xs: 1.5, md: 2 }, mb: 2.5, px: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <RankBadge position={player.pos} />
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Typography sx={{ color: colors.text.primary, fontWeight: 800, fontSize: { xs: "1.2rem", md: "1.5rem" }, lineHeight: 1.2 }}>
                  {player.name}
                </Typography>
                {player.pos === 1 ? <EmojiEvents sx={{ color: colors.gold, fontSize: "1.2rem" }} /> : null}
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: { xs: 1.5, md: 3 }, flexWrap: "wrap", ml: { md: "auto" } }}>
            <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
              <Typography sx={{ display: "flex", alignItems: "center", gap: 0.3, justifyContent: { md: "flex-end" }, color: colors.text.muted, fontSize: "0.5rem", fontWeight: 700, letterSpacing: 1 }}>
                <CheckCircle sx={{ fontSize: "0.55rem", color: colors.green }} />{t("standings.record")}
              </Typography>
              <Typography sx={{ color: colors.text.primary, fontWeight: 800, fontSize: "0.95rem" }}>
                {player.wins}{t("common.wAbbr")} / {player.losses}{t("common.lAbbr")}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
              <Typography sx={{ display: "flex", alignItems: "center", gap: 0.3, justifyContent: { md: "flex-end" }, color: colors.text.muted, fontSize: "0.5rem", fontWeight: 700, letterSpacing: 1 }}>
                <SportsScore sx={{ fontSize: "0.55rem", color: colors.accent }} />{t("standings.points")}
              </Typography>
              <Typography sx={{ color: colors.accent, fontWeight: 900, fontSize: "1.1rem" }}>{player.points}</Typography>
            </Box>
            <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
              <Typography sx={{ display: "flex", alignItems: "center", gap: 0.3, justifyContent: { md: "flex-end" }, color: colors.text.muted, fontSize: "0.5rem", fontWeight: 700, letterSpacing: 1 }}>
                <CompareArrows sx={{ fontSize: "0.55rem", color: colors.text.muted }} />{t("standings.form")}
              </Typography>
              <FormIndicator form={player.form} />
            </Box>
          </Box>
        </Box>

        <PlayerDesktopStats stats={desktopStats(player, setDiffStr, setDiff)} />

        <Card borderColor={borderForRank(player.pos)}>
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", px: 2.5, py: 1, borderBottom: "1px solid #f0f0f0" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, minWidth: 44 }}>
              <EventIcon sx={{ color: colors.text.muted, fontSize: "0.6rem" }} />
              <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", fontWeight: 700, letterSpacing: 1 }}>{t("matchesPage.date")}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, flex: 1 }}>
              <Person sx={{ color: colors.text.muted, fontSize: "0.6rem" }} />
              <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", fontWeight: 700, letterSpacing: 1 }}>{t("matchesPage.opponent")}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.3, minWidth: 100 }}>
              <SportsScore sx={{ color: colors.text.muted, fontSize: "0.6rem" }} />
              <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", fontWeight: 700, letterSpacing: 1 }}>{t("matchesPage.result")}</Typography>
            </Box>
          </Box>

          {matches.length === 0 ? (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography sx={{ color: colors.text.muted, fontSize: "0.8rem" }}>{t("matchesPage.noMatchesRecorded")}</Typography>
            </Box>
          ) : (
            matches.map((m) => <MatchHistoryRow key={m.id} match={m} />)
          )}
        </Card>

        <PlayerMobileStats stats={mobileStats(player, setDiffStr, setDiff)} />
      </Section>
    </PageLayout>
  );
}

export default PlayerMatchesPage;
