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
import { tournaments } from "@/app/_components/tournaments/data";

export default function TournamentsListPage() {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <Section>
        <PageHeader
          icon={<EmojiEvents />}
          title={t("tournamentsList.title")}
          subtitle={t("tournamentsList.subtitle", { count: tournaments.length, completed: tournaments.filter((t) => t.status === "past").length })}
        />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1.5 }}>
          {tournaments.map((tData) => {
            const isPast = tData.status === "past";

            return (
              <Card
                key={tData.week}
                borderColor={isPast ? colors.accent4d : "#27272a"}
                hoverBorderColor={isPast ? colors.accent : "#52525b"}
              >
                <Link
                  href={isPast ? `/tournaments/${tData.week}` : ""}
                  style={{ textDecoration: "none", display: "block", cursor: isPast ? "pointer" : "default" }}
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
                    {isPast ? (
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
                            color: isPast ? colors.text.primary : colors.text.muted,
                            fontWeight: 700,
                            fontSize: "0.95rem",
                          }}
                        >
                          {t("common.week", { week: tData.week })}
                        </Typography>
                        <Typography
                          sx={{
                            color: colors.text.subtle,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          }}
                        >
                          {tData.date}
                        </Typography>
                        {isPast && tData.winner && (
                          <Typography
                            sx={{
                              color: colors.goldText,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              letterSpacing: 1,
                            }}
                          >
                            {t("common.winner", { name: tData.winner })}
                          </Typography>
                        )}
                      </Box>
                      {isPast && (
                        <Typography sx={{ color: colors.text.muted, fontSize: "0.7rem", mt: 0.15 }}>
                          {t("tournamentsList.players", { count: tData.groups.reduce((sum, g) => sum + g.players.length, 0) })}
                          {" · "}
                          {t("tournamentsList.groupMatches", { count: tData.groups.reduce((sum, g) => sum + g.matches.length / 2, 0) })}
                          {" · "}
                          {t("tournamentsList.playoffMatches", { count: tData.playoffs.reduce((sum, r) => sum + r.matches.length / 2, 0) })}
                          {" · "}
                          {[...tData.groups.flatMap((g) => g.matches), ...tData.playoffs.flatMap((r) => r.matches)].filter((m) => m.one80).length} 180s
                        </Typography>
                      )}
                      {!isPast && (
                        <Typography
                          sx={{
                            color: colors.text.subtle,
                            fontSize: "0.7rem",
                            mt: 0.15,
                            fontStyle: "italic",
                          }}
                        >
                          {t("tournamentsList.futureText")}
                        </Typography>
                      )}
                    </Box>

                    {isPast && (
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
