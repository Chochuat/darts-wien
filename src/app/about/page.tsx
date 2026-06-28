"use client";

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
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import PageLayout from "@/app/_components/ui/page-layout";
import PageHeader from "@/app/_components/ui/page-header";

const organizers = [
  { name: "Patrik Barcal", roleKey: "organizer", bioKey: "organizerBio1" },
  { name: "Erik Beňo", roleKey: "organizer", bioKey: "organizerBio2" },
  { name: "Dodo Kepke", roleKey: "organizer", bioKey: "organizerBio3" },
];


/**
 * About page.
 */
const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <Section>
        <PageHeader icon={<Info />} subtitle={t("about.subtitle")} title={t("about.title")} />

        <Box sx={{ px: 0.5, mb: 3 }}>
          <Typography sx={{ color: colors.text.secondary, fontSize: "0.85rem", lineHeight: 1.7, mb: 1.5 }}>
            {t("about.description1")}
          </Typography>
          <Typography sx={{ color: colors.text.secondary, fontSize: "0.85rem", lineHeight: 1.7 }}>
            {t("about.description2")}
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
          {[
            { icon: <Groups />, labelKey: "teams", value: "6" },
            { icon: <CalendarMonth />, labelKey: "season", value: "2025/26" },
            { icon: <LocationOn />, labelKey: "venues", value: "4" },
          ].map((s) => (
            <Box
              key={s.labelKey}
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
                {t(`about.${s.labelKey}`)}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ px: 0.5 }}>
          <Typography sx={{ color: colors.text.primary, fontWeight: 700, fontSize: "0.95rem", letterSpacing: 1, mb: 1.5 }}>
            {t("about.organizers")}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
            {organizers.map((m) => (
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
                  {t(`about.${m.roleKey}`)}
                </Typography>
                <Typography sx={{ color: colors.text.muted, fontSize: "0.75rem" }}>
                  {t(`about.${m.bioKey}`)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Contact */}
        <Box sx={{ px: 0.5, mt: 3 }}>
          <Typography sx={{ color: colors.text.primary, fontWeight: 700, fontSize: "0.95rem", letterSpacing: 1, mb: 1.5 }}>
            {t("about.contact")}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.5 }}>
            {[
              { icon: <Email />, labelKey: "email", value: "info@dartswien.at" },
              { icon: <Phone />, labelKey: "phone", value: "+43 1 234 5678" },
              { icon: <LocationOn />, labelKey: "location", value: "Vienna, Austria" },
              { icon: <AccessTime />, labelKey: "matchDays", value: "Wed & Sat" },
            ].map((c) => (
              <Box
                key={c.labelKey}
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
                  {t(`about.${c.labelKey}`)}
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
              height="220"
              loading="lazy"
              referrerPolicy="no-referrer"
              src="https://www.openstreetmap.org/export/embed.html?bbox=16.3500%2C48.1900%2C16.4000%2C48.2200&layer=mapnik&marker=48.2050%2C16.3750"
              style={{ border: 0, display: "block" }}
              title="Darts Wien Venue Map"
              width="100%"
            />
          </Box>
        </Box>

        {/* Social Media */}
        <Box sx={{ px: 0.5, mt: 3 }}>
          <Typography sx={{ color: colors.text.primary, fontWeight: 700, fontSize: "0.95rem", letterSpacing: 1, mb: 1.5 }}>
            {t("about.socialMedia")}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {[
              { icon: <Public />, labelKey: "website", handle: "dartswien.at" },
              { icon: <Forum />, labelKey: "discord", handle: "discord.gg/dartswien" },
              { icon: <Send />, labelKey: "telegram", handle: "@dartswien" },
            ].map((s) => (
              <Box
                key={s.labelKey}
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
                    {t(`about.${s.labelKey}`)}
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

export default AboutPage;
