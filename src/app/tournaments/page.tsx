import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import ArrowForward from "@mui/icons-material/ArrowForward";
import Lock from "@mui/icons-material/Lock";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import { colors } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import Card from "@/app/_components/ui/card";
import PageLayout from "@/app/_components/ui/page-layout";
import PageHeader from "@/app/_components/ui/page-header";
import { tournaments } from "@/app/_components/tournaments/data";

export default function TournamentsListPage() {
  return (
    <PageLayout>
      <Section>
        <PageHeader
          icon={<EmojiEvents />}
          title="Tournaments"
          subtitle={`${tournaments.length} tournaments · ${tournaments.filter((t) => t.status === "past").length} completed`}
        />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1.5 }}>
          {tournaments.map((t) => {
            const isPast = t.status === "past";

            return (
              <Card
                key={t.week}
                borderColor={isPast ? colors.accent4d : "#27272a"}
                hoverBorderColor={isPast ? colors.accent : "#52525b"}
              >
                <Link
                  href={isPast ? `/tournaments/${t.week}` : ""}
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
                          Week {t.week}
                        </Typography>
                        <Typography
                          sx={{
                            color: colors.text.subtle,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          }}
                        >
                          {t.date}
                        </Typography>
                        {isPast && t.winner && (
                          <Typography
                            sx={{
                              color: colors.goldText,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              letterSpacing: 1,
                            }}
                          >
                            Winner: {t.winner}
                          </Typography>
                        )}
                      </Box>
                      {isPast && (
                        <Typography sx={{ color: colors.text.muted, fontSize: "0.7rem", mt: 0.15 }}>
                          {t.groups.reduce((sum, g) => sum + g.players.length, 0)} players
                          {" · "}
                          {t.groups.reduce((sum, g) => sum + g.matches.length / 2, 0)} group matches
                          {" · "}
                          {t.playoffs.reduce((sum, r) => sum + r.matches.length / 2, 0)} playoff matches
                          {" · "}
                          {[...t.groups.flatMap((g) => g.matches), ...t.playoffs.flatMap((r) => r.matches)].filter((m) => m.one80).length} 180s
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
                          Schedule and groups will be released soon
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
