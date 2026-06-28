"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Cancel from "@mui/icons-material/Cancel";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";
import Badge180 from "@/app/_components/ui/badge-180";
import type { StandingRecentMatch } from "@/lib/validation";

export default function MatchRow({ match }: { match: StandingRecentMatch }) {
  const isWin = match.result === "W";
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        gap: 1,
        alignItems: "center",
        px: 1.75,
        py: 0.75,
        borderTop: "1px solid #f0f0f0",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
        {isWin ? (
          <CheckCircle sx={{ color: colors.green, fontSize: "0.8rem", flexShrink: 0 }} />
        ) : (
          <Cancel sx={{ color: colors.red, fontSize: "0.8rem", flexShrink: 0 }} />
        )}
        <Typography
          sx={{
            color: colors.text.secondary,
            fontSize: "0.75rem",
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {t("common.vs")} {match.opponent}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography
          sx={{
            color: isWin ? colors.green : colors.red,
            fontSize: "0.75rem",
            fontWeight: 700,
            fontFamily: "'Courier New', monospace",
            textAlign: "center",
            minWidth: 36,
          }}
        >
          {match.score}
        </Typography>
        {match.one80 > 0 && <Badge180 />}
      </Box>

      <Typography
        sx={{
          color: colors.text.muted,
          fontSize: "0.6rem",
          textAlign: "right",
          minWidth: 40,
        }}
      >
        {match.date}
      </Typography>
    </Box>
  );
}
