"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import ArrowForward from "@mui/icons-material/ArrowForward";
import Lock from "@mui/icons-material/Lock";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import Card from "@/app/_components/ui/card";
import PageLayout from "@/app/_components/ui/page-layout";
import PageHeader from "@/app/_components/ui/page-header";
import { useTournaments } from "@/lib/hooks/use-tournaments";

export default function TournamentsListPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useTournaments();

  if (isLoading) {
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

  if (isError || !data) {
    return (
      <PageLayout>
        <Section>
          <Typography sx={{ color: colors.red, textAlign: "center", py: 4, fontSize: "0.85rem" }}>
            {t("common.error")}
          </Typography>
        </Section>
      </PageLayout>
    );
  }

  const { tournaments } = data;

  return (
    <PageLayout>
      <Section>
        <PageHeader
          icon={<EmojiEvents />}
          title={t("tournamentsList.title")}
          subtitle={t("tournamentsList.subtitle", { count: tournaments.length, completed: tournaments.filter((t) => t.status === "completed").length })}
        />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1.5 }}>
          {tournaments.map((tData) => {
            const isCompleted = tData.status === "completed";
            const clickable = isCompleted;
            const isGrandFinal = tData.type === "grand_final";

            return (
              <Card
                key={tData.id}
                borderColor={isCompleted ? colors.accent4d : "#27272a"}
                hoverBorderColor={isCompleted ? colors.accent : "#52525b"}
              >
                <Link
                  href={clickable ? `/tournaments/${tData.weekNumber}` : ""}
                  style={{ textDecoration: "none", display: "block", cursor: clickable ? "pointer" : "default" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: { xs: 1.75, md: 2.5 },
                      py: { xs: 1.5, md: 1.25 },
                      gap: 1.5,
                    }}
                  >
                    {isCompleted ? (
                      <EmojiEvents
                        sx={{
                          color: colors.gold,
                          fontSize: "1.3rem",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <Lock sx={{ color: colors.text.muted, fontSize: "1.3rem", flexShrink: 0 }} />
                    )}

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                        <Typography
                          sx={{
                            color: isCompleted ? colors.text.primary : colors.text.muted,
                            fontWeight: 700,
                            fontSize: isGrandFinal ? "0.85rem" : "0.95rem",
                          }}
                        >
                          {isGrandFinal
                            ? t("tournamentDetail.grandFinalTitle")
                            : t("common.week", { week: tData.weekNumber })}
                        </Typography>
                        {isGrandFinal && (
                          <Typography
                            sx={{
                              color: colors.goldText,
                              fontSize: "0.55rem",
                              fontWeight: 900,
                              letterSpacing: 2,
                              bgcolor: `${colors.gold}20`,
                              px: 0.75,
                              py: 0.25,
                              borderRadius: 0.5,
                              lineHeight: 1,
                            }}
                          >
                            {t("tournamentDetail.grandFinal")}
                          </Typography>
                        )}
                        <Typography
                          sx={{
                            color: colors.text.subtle,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          }}
                        >
                          {tData.date}
                        </Typography>
                        {isCompleted && tData.winner && (
                          <Typography
                            sx={{
                              color: colors.goldText,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              letterSpacing: 1,
                            }}
                          >
                            {t("common.winner", { name: tData.winner.name })}
                          </Typography>
                        )}
                      </Box>
                      {isCompleted ? (
                        <Typography sx={{ color: colors.text.muted, fontSize: "0.7rem", mt: 0.15 }}>
                          {isGrandFinal
                            ? t("tournamentsList.grandFinalPlayers")
                            : t("tournamentsList.players", { count: tData.playerCount })}
                          {!isGrandFinal && (
                            <>{" · "}{t("tournamentsList.groupMatches", { count: tData.groupMatchCount })}</>
                          )}
                          {" · "}
                          {t("tournamentsList.playoffMatches", { count: tData.playoffMatchCount })}
                          {" · "}
                          {tData.total180s} 180s
                        </Typography>
                      ) : (
                        <Typography
                          sx={{
                            color: colors.text.subtle,
                            fontSize: "0.7rem",
                            mt: 0.15,
                            fontStyle: "italic",
                          }}
                        >
                          {tData.status === "registration"
                            ? t("tournamentsList.registrationOpen")
                            : tData.status === "ready"
                            ? t("tournamentsList.readyText")
                            : t("tournamentsList.inProgressText")}
                        </Typography>
                      )}
                    </Box>

                    {isCompleted && (
                      <ArrowForward
                        sx={{
                          color: colors.accent,
                          fontSize: "1.1rem",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Box>
                </Link>
              </Card>
            );
          })}
        </Box>
      </Section>
    </PageLayout>
  );
}
