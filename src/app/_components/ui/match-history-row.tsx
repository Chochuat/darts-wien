"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Cancel from "@mui/icons-material/Cancel";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";
import Badge180 from "@/app/_components/ui/badge-180";
import type { PlayerMatchPerspective } from "@/lib/validation";

/**
 * MatchHistoryRow component.
 */
export const MatchHistoryRow = ({ match }: { match: PlayerMatchPerspective }) => {
  const isWin = match.result === "W";
  const { t } = useTranslation();

  return (
    <Box sx={{ display: "flex", alignItems: "center", px: { xs: 1.75, md: 2.5 }, py: 1.25, borderTop: "1px solid #f0f0f0", gap: 1.5 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: isWin ? colors.green : colors.red, flexShrink: 0 }} />
      <Typography sx={{ color: colors.text.muted, fontSize: "0.65rem", minWidth: 44, fontWeight: 500 }}>
        {match.date}
      </Typography>
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 0.75 }}>
        {isWin ? <CheckCircle sx={{ color: colors.green, fontSize: "0.85rem" }} /> : <Cancel sx={{ color: colors.red, fontSize: "0.85rem" }} />}
        <Typography sx={{ color: colors.text.secondary, fontSize: "0.85rem", fontWeight: 500 }}>
          {t("common.vs")} <strong>{match.opponentName}</strong>
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Typography sx={{ color: isWin ? colors.green : colors.red, fontWeight: 800, fontSize: "0.9rem", fontFamily: "'Courier New', monospace", minWidth: 40, textAlign: "center" }}>
          {match.score}
        </Typography>
        {match.one80 > 0 ? <Badge180 /> : null}
        <Box sx={{ bgcolor: isWin ? `${colors.green}12` : `${colors.red}12`, borderRadius: 1, px: 1, py: 0.25, minWidth: 40, textAlign: "center" }}>
          <Typography sx={{ color: isWin ? colors.green : colors.red, fontWeight: 800, fontSize: "0.6rem", letterSpacing: 1 }}>
            {isWin ? t("common.winAbbr") : t("common.lossAbbr")}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
