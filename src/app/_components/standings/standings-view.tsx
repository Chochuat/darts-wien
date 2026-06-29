"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import PageLayout from "@/app/_components/ui/page-layout";
import LiveIndicator from "@/app/_components/ui/live-indicator";
import { DartLoading } from "@/app/_components/ui/dart-loading";
import { useStandings } from "@/lib/hooks/use-standings";
import { StandingsHeaderSummary, StandingsPlayerCard } from "./player-card";

const StandingsError = () => {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <Section>
        <Typography sx={{ color: colors.red, textAlign: "center", py: 4, fontSize: "0.85rem" }}>
          {t("common.error")}
        </Typography>
      </Section>
    </PageLayout>
  );
};

/**
 * Standings view: fetches the active season and renders an expandable player card list.
 */
const StandingsView = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { t } = useTranslation();
  const { data, isLoading, isError } = useStandings(1);

  const toggle = (name: string) => {
    setExpanded((prev) => (prev === name ? null : name));
  };

  if (isLoading) return <DartLoading />;
  if (isError || !data) return <StandingsError />;

  const { players } = data;
  const totalMatches = players.reduce((acc, p) => acc + p.played, 0) / 2;

  return (
    <PageLayout>
      <Section>
        <Box sx={{ display: { xs: "block", md: "flex" }, alignItems: { md: "flex-end" }, justifyContent: { md: "space-between" }, mb: { xs: 2.5, md: 2 }, px: 0.5 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.3 }}>
              <LiveIndicator />
              <Typography sx={{ color: colors.text.primary, fontWeight: 800, fontSize: { xs: "1.15rem", md: "1.5rem" }, letterSpacing: 1 }}>
                {t("standings.title")}
              </Typography>
            </Box>
            <Typography sx={{ color: colors.text.muted, fontSize: "0.7rem", letterSpacing: 1, fontWeight: 600 }}>
              {t("standings.subtitle")}
            </Typography>
          </Box>
          <StandingsHeaderSummary players={players} totalMatches={totalMatches} />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: { xs: 1.25, md: 1 } }}>
          {players.map((p) => (
            <StandingsPlayerCard
              isOpen={expanded === p.name}
              key={p.slug}
              onToggle={() => toggle(p.name)}
              p={p}
            />
          ))}
        </Box>
      </Section>
    </PageLayout>
  );
}

export default StandingsView;
