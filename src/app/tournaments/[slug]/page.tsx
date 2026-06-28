"use client";

import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Lock from "@mui/icons-material/Lock";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import PageLayout from "@/app/_components/ui/page-layout";
import { useTournaments, useTournamentDetail } from "@/lib/hooks/use-tournaments";
import TournamentDetail from "@/app/_components/tournaments/tournament-detail";


/**
 * TournamentPage component.
 */
const TournamentPage = () => {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const weekNum = parseInt(slug, 10);
  const { t } = useTranslation();

  const { data: listData, isLoading: listLoading, isError: listError } = useTournaments();
  const tournamentSummary = listData?.tournaments.find((t) => t.weekNumber === weekNum);

  const { data: detail, isLoading: detailLoading, isError: detailError } = useTournamentDetail(
    tournamentSummary?.id ?? 0,
  );

  if (listLoading) {
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

  if (listError || !listData || !tournamentSummary) {
    return (
      <PageLayout>
        <Section>
          <Typography sx={{ color: colors.text.muted, fontSize: "0.85rem", textAlign: "center", py: 4 }}>
            {t("common.tournamentNotFound")}
          </Typography>
        </Section>
      </PageLayout>
    );
  }

  if (tournamentSummary.status !== "completed") {
    const statusLabel = tournamentSummary.status === "registration"
      ? t("tournamentsList.registrationOpen")
      : tournamentSummary.status === "ready"
      ? t("tournamentsList.readyText")
      : t("tournamentsList.inProgressText");

    return (
      <PageLayout>
        <Section>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, py: 4 }}>
            <Lock sx={{ color: colors.text.muted, fontSize: "2rem" }} />
            <Typography sx={{ color: colors.text.primary, fontWeight: 700, fontSize: "1rem" }}>
              {t("common.week", { week: tournamentSummary.weekNumber })}
            </Typography>
            <Typography sx={{ color: colors.text.subtle, fontSize: "0.65rem" }}>
              {tournamentSummary.date}
            </Typography>
            <Typography sx={{ color: colors.text.muted, fontSize: "0.7rem", fontStyle: "italic" }}>
              {statusLabel}
            </Typography>
          </Box>
        </Section>
      </PageLayout>
    );
  }

  if (detailLoading) {
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

  if (detailError || !detail) {
    return (
      <PageLayout>
        <Section>
          <Typography sx={{ color: colors.text.muted, fontSize: "0.85rem", textAlign: "center", py: 4 }}>
            {t("common.tournamentNotFound")}
          </Typography>
        </Section>
      </PageLayout>
    );
  }

  return <TournamentDetail detail={detail} summary={tournamentSummary} />;
}

export default TournamentPage;
