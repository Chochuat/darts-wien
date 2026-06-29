"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TrackChanges from "@mui/icons-material/TrackChanges";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Cancel from "@mui/icons-material/Cancel";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import CompareArrows from "@mui/icons-material/CompareArrows";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";

interface StatBox {
  label: string;
  value: string | number;
  color?: string;
  icon: React.ReactNode;
}

interface PlayerDesktopStatsProps {
  stats: StatBox[];
}

/**
 * Player stats summary for standings row.
 *
 * @param props - Component properties.
 */
export const PlayerDesktopStats = ({ stats }: PlayerDesktopStatsProps) => {
  return (
    <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2, px: 0.5, mb: 2 }}>
      {stats.map((s) => (
        <Box key={s.label} sx={{ bgcolor: `${colors.accent}08`, borderRadius: 1.5, px: 1.5, py: 1 }}>
          <Typography sx={{ color: colors.text.secondary, fontSize: "0.6rem", fontWeight: 700, letterSpacing: 1, mb: 0.2, display: "flex", alignItems: "center", gap: 0.3 }}>
            {s.icon}{s.label}
          </Typography>
          <Typography sx={{ color: s.color ?? colors.text.primary, fontWeight: 800, fontSize: "1rem" }}>
            {s.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

interface PlayerMobileStatsProps {
  stats: StatBox[];
}

/**
 * Player stats summary compact variant for mobile.
 *
 * @param props - Component properties.
 */
export const PlayerMobileStats = ({ stats }: PlayerMobileStatsProps) => {
  return (
    <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1, mt: 2, px: 0.5 }}>
      {stats.map((s) => (
        <Box key={s.label} sx={{ flex: 1, bgcolor: `${colors.accent}08`, borderRadius: 1.5, px: 1, py: 1.25, textAlign: "center" }}>
          <Typography sx={{ color: s.color ?? colors.text.primary, fontSize: "0.95rem", fontWeight: 800 }}>
            {s.value}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.25, mt: 0.15 }}>
            {s.icon}
            <Typography sx={{ color: colors.text.secondary, fontSize: "0.55rem", fontWeight: 700, letterSpacing: 1 }}>
              {s.label}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

/**
 * Returns builders for the desktop and mobile stat box arrays, bound to i18n labels.
 */
export const usePlayerStatBoxes = () => {
  const { t } = useTranslation();

  const desktopStats = (player: { played: number; wins: number; losses: number; setsFor: number; setsAgainst: number }, setDiffStr: string, setDiff: number): StatBox[] => [
    { label: t("playerPage.matchesPlayed"), value: player.played, icon: <TrackChanges sx={{ fontSize: "0.7rem" }} /> },
    { label: t("playerPage.matchesWon"), value: player.wins, color: colors.green, icon: <CheckCircle sx={{ fontSize: "0.7rem" }} /> },
    { label: t("playerPage.matchesLost"), value: player.losses, color: colors.red, icon: <Cancel sx={{ fontSize: "0.7rem" }} /> },
    { label: t("playerPage.setsWon"), value: player.setsFor, color: colors.green, icon: <ArrowUpward sx={{ fontSize: "0.7rem" }} /> },
    { label: t("playerPage.setsLost"), value: player.setsAgainst, color: colors.red, icon: <ArrowDownward sx={{ fontSize: "0.7rem" }} /> },
    { label: t("playerPage.setDiff"), value: setDiffStr, color: setDiff > 0 ? colors.green : colors.red, icon: <CompareArrows sx={{ fontSize: "0.7rem" }} /> },
  ];

  const mobileStats = (player: { played: number; wins: number; losses: number }, setDiffStr: string, setDiff: number): StatBox[] => [
    { label: t("tableHeaders.played"), value: player.played, icon: <TrackChanges sx={{ fontSize: "0.6rem" }} /> },
    { label: t("tableHeaders.wins"), value: player.wins, color: colors.green, icon: <ArrowUpward sx={{ fontSize: "0.6rem" }} /> },
    { label: t("tableHeaders.losses"), value: player.losses, color: colors.red, icon: <ArrowDownward sx={{ fontSize: "0.6rem" }} /> },
    { label: "±", value: setDiffStr, color: setDiff > 0 ? colors.green : colors.red, icon: <CompareArrows sx={{ fontSize: "0.6rem" }} /> },
  ];

  return { desktopStats, mobileStats };
};
