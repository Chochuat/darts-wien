import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Lock from "@mui/icons-material/Lock";
import { colors } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import PageLayout from "@/app/_components/ui/page-layout";
import { tournaments } from "@/app/_components/tournaments/data";
import TournamentDetail from "@/app/_components/tournaments/tournament-detail";

export default async function TournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const weekNum = parseInt(slug, 10);
  const tournament = tournaments.find((t) => t.week === weekNum) ?? null;

  if (!tournament) {
    return (
      <PageLayout>
        <Section>
          <Typography sx={{ color: colors.text.muted, fontSize: "0.85rem", textAlign: "center", py: 4 }}>
            Tournament not found.
          </Typography>
        </Section>
      </PageLayout>
    );
  }

  if (tournament.status === "future") {
    return (
      <PageLayout>
        <Section>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, py: 4 }}>
            <Lock sx={{ color: colors.text.muted, fontSize: "2rem" }} />
            <Typography sx={{ color: colors.text.primary, fontWeight: 700, fontSize: "1rem" }}>
              Week {tournament.week}
            </Typography>
            <Typography sx={{ color: colors.text.subtle, fontSize: "0.65rem" }}>
              {tournament.date}
            </Typography>
            <Typography sx={{ color: colors.text.muted, fontSize: "0.7rem", fontStyle: "italic" }}>
              Schedule and groups will be released soon
            </Typography>
          </Box>
        </Section>
      </PageLayout>
    );
  }

  return <TournamentDetail tournament={tournament} />;
}
