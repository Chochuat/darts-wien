"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";
import Badge180 from "@/app/_components/ui/badge-180";

interface MatchListRowProps {
  playerName: string;
  opponent: string;
  score: string;
  date: string;
  one80: number;
  index: number;
}

/**
 * Match row for the all-matches list view.
 *
 * @param props - Component properties.
 */
export const MatchListRow = ({ playerName, opponent, score, date, one80, index }: MatchListRowProps) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: "flex", alignItems: "center", px: { xs: 1.75, md: 2.5 }, py: { xs: 1, md: 0.85 }, borderTop: index === 0 ? "none" : "1px solid #f0f0f0", gap: { xs: 0.75, md: 1 } }}>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ color: colors.text.primary, fontSize: "0.75rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <Box component="span" sx={{ color: colors.text.primary }}>{playerName}</Box>
          {one80 > 0 ? <Badge180 /> : null}
          {" "}
          <Box component="span" sx={{ color: colors.text.muted, fontWeight: 400 }}>{t("common.vs")} {opponent}</Box>
        </Typography>
      </Box>
      <Typography sx={{ color: colors.text.primary, fontSize: "0.8rem", fontWeight: 700, fontFamily: "'Courier New', monospace", textAlign: "center", minWidth: 36, flexShrink: 0 }}>
        {score}
      </Typography>
      <Typography sx={{ color: colors.text.muted, fontSize: "0.6rem", textAlign: "right", minWidth: 40, flexShrink: 0 }}>
        {date}
      </Typography>
    </Box>
  );
};
