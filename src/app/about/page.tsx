import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Info from "@mui/icons-material/Info";
import Groups from "@mui/icons-material/Groups";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import LocationOn from "@mui/icons-material/LocationOn";
import Email from "@mui/icons-material/Email";
import Phone from "@mui/icons-material/Phone";
import AccessTime from "@mui/icons-material/AccessTime";
import Public from "@mui/icons-material/Public";
import Forum from "@mui/icons-material/Forum";
import Send from "@mui/icons-material/Send";
import { colors } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import PageLayout from "@/app/_components/ui/page-layout";
import PageHeader from "@/app/_components/ui/page-header";

const stats = [
  { icon: <Groups />, label: "Teams", value: "6" },
  { icon: <CalendarMonth />, label: "Season", value: "2025/26" },
  { icon: <LocationOn />, label: "Venues", value: "4" },
];

const teamMembers = [
  { name: "Markus Richter", role: "League Commissioner", bio: "Founder and head organizer since 2020." },
  { name: "Julia Berger", role: "Tournament Director", bio: "Coordinates all tournament schedules and brackets." },
  { name: "David Steiner", role: "Head Referee", bio: "Ensures fair play and rules compliance across all matches." },
  { name: "Sarah Weiss", role: "Communications", bio: "Handles league announcements, social media, and press." },
];

export default function AboutPage() {
  return (
    <PageLayout>
      <Section>
        <PageHeader icon={<Info />} title="About" subtitle="Darts Liga Wien · Founded 2020" />

        <Box sx={{ px: 0.5, mb: 3 }}>
          <Typography sx={{ color: colors.text.secondary, fontSize: "0.85rem", lineHeight: 1.7, mb: 1.5 }}>
            Darts Wien is Vienna&apos;s premier darts league, bringing together the city&apos;s most competitive
            players across six teams. Founded in 2020, the league has grown from a small gathering of
            enthusiasts into a structured competition with weekly matches, seasonal tournaments, and a
            dedicated following.
          </Typography>
          <Typography sx={{ color: colors.text.secondary, fontSize: "0.85rem", lineHeight: 1.7 }}>
            Our mission is to promote the sport of darts in Vienna through fair competition, community
            engagement, and professional organization. Whether you&apos;re a seasoned player or new to the
            game, Darts Wien offers a welcoming environment for everyone.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
            gap: 1.5,
            mb: 3,
            px: 0.5,
          }}
        >
          {stats.map((s) => (
            <Box
              key={s.label}
              sx={{
                bgcolor: `${colors.accent}08`,
                borderRadius: 2,
                px: 2,
                py: 2,
                textAlign: "center",
                border: "1px solid",
                borderColor: `${colors.accent}15`,
              }}
            >
              <Box sx={{ color: colors.accent, fontSize: "1.3rem", mb: 0.5, display: "flex", justifyContent: "center" }}>
                {s.icon}
              </Box>
              <Typography sx={{ color: colors.text.primary, fontWeight: 800, fontSize: "1.25rem", lineHeight: 1.2 }}>
                {s.value}
              </Typography>
              <Typography sx={{ color: colors.text.muted, fontSize: "0.6rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ px: 0.5 }}>
          <Typography sx={{ color: colors.text.primary, fontWeight: 700, fontSize: "0.95rem", letterSpacing: 1, mb: 1.5 }}>
            League Organization
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
            {teamMembers.map((m) => (
              <Box
                key={m.name}
                sx={{
                  bgcolor: colors.card,
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                  border: "1px solid",
                  borderColor: colors.accent4d,
                }}
              >
                <Typography sx={{ color: colors.text.primary, fontWeight: 700, fontSize: "0.85rem" }}>
                  {m.name}
                </Typography>
                <Typography sx={{ color: colors.accent, fontSize: "0.65rem", fontWeight: 700, letterSpacing: 1, mb: 0.5, textTransform: "uppercase" }}>
                  {m.role}
                </Typography>
                <Typography sx={{ color: colors.text.muted, fontSize: "0.75rem" }}>
                  {m.bio}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Contact */}
        <Box sx={{ px: 0.5, mt: 3 }}>
          <Typography sx={{ color: colors.text.primary, fontWeight: 700, fontSize: "0.95rem", letterSpacing: 1, mb: 1.5 }}>
            Contact
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.5 }}>
            {[
              { icon: <Email />, label: "Email", value: "info@dartswien.at" },
              { icon: <Phone />, label: "Phone", value: "+43 1 234 5678" },
              { icon: <LocationOn />, label: "Location", value: "Vienna, Austria" },
              { icon: <AccessTime />, label: "Match Days", value: "Wed & Sat" },
            ].map((c) => (
              <Box
                key={c.label}
                sx={{
                  bgcolor: colors.card,
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                  border: "1px solid",
                  borderColor: colors.accent4d,
                  textAlign: "center",
                }}
              >
                <Box sx={{ color: colors.accent, fontSize: "1.1rem", mb: 0.5, display: "flex", justifyContent: "center" }}>
                  {c.icon}
                </Box>
                <Typography sx={{ color: colors.text.muted, fontSize: "0.55rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", mb: 0.15 }}>
                  {c.label}
                </Typography>
                <Typography sx={{ color: colors.text.primary, fontWeight: 600, fontSize: "0.8rem" }}>
                  {c.value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              mt: 1.5,
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid",
              borderColor: colors.accent4d,
              height: 220,
            }}
          >
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=16.3500%2C48.1900%2C16.4000%2C48.2200&layer=mapnik&marker=48.2050%2C16.3750"
              width="100%"
              height="220"
              style={{ border: 0, display: "block" }}
              title="Darts Wien Venue Map"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </Box>
        </Box>

        {/* Social Media */}
        <Box sx={{ px: 0.5, mt: 3 }}>
          <Typography sx={{ color: colors.text.primary, fontWeight: 700, fontSize: "0.95rem", letterSpacing: 1, mb: 1.5 }}>
            Social Media
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {[
              { icon: <Public />, label: "Website", handle: "dartswien.at" },
              { icon: <Forum />, label: "Discord", handle: "discord.gg/dartswien" },
              { icon: <Send />, label: "Telegram", handle: "@dartswien" },
            ].map((s) => (
              <Box
                key={s.label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: colors.card,
                  borderRadius: 2,
                  px: 2,
                  py: 1.25,
                  border: "1px solid",
                  borderColor: colors.accent4d,
                }}
              >
                <Box sx={{ color: colors.accent, fontSize: "1rem", display: "flex" }}>
                  {s.icon}
                </Box>
                <Box>
                  <Typography sx={{ color: colors.text.primary, fontWeight: 700, fontSize: "0.8rem" }}>
                    {s.label}
                  </Typography>
                  <Typography sx={{ color: colors.text.muted, fontSize: "0.65rem" }}>
                    {s.handle}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Section>
    </PageLayout>
  );
}
