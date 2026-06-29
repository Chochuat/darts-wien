"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Cancel from "@mui/icons-material/Cancel";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";
import Badge180 from "@/app/_components/ui/badge-180";

interface MatchListRowProps {
  playerName: string;
  opponent: string;
  score: string;
  result: "W" | "L";
  date: string;
  one80: number;
  index: number;
}

/**
 * Match row for the all-matches list view.
 *
 * @param props - Component properties.
 */
export const MatchListRow = (props: MatchListRowProps) => {
  const isWin = props.result === "W";
  const { t } = useTranslation();

  return (
    <Box sx={{ display: "flex", alignItems: "center", px: { xs: 1.75, md: 2.5 }, py: { xs: 1, md: 0.85 }, borderTop: props.index === 0 ? "none" : "1px solid #f0f0f0", gap: { xs: 0.75, md: 1 } }}>
      <Box sx={{ flexShrink: 0 }}>
        {isWin ? <CheckCircle sx={{ color: colors.green, fontSize: "0.8rem" }} /> : <Cancel sx={{ color: colors.red, fontSize: "0.8rem" }} />}
      </Box>
      <Box sx={{ minWidth: 0, flex: { xs: 1, md: "none" }, width: { md: 200 } }}>
        <Typography sx={{ color: colors.text.primary, fontSize: "0.75rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <Box component="span" sx={{ color: colors.text.primary }}>{props.playerName}</Box>
          {props.one80 > 0 ? <Badge180 /> : null}
          {" "}
          <Box component="span" sx={{ color: colors.text.muted, fontWeight: 400 }}>{t("common.vs")} {props.opponent}</Box>
        </Typography>
      </Box>
      <Typography sx={{ color: isWin ? colors.green : colors.red, fontSize: "0.8rem", fontWeight: 700, fontFamily: "'Courier New', monospace", textAlign: "center", minWidth: 36, flexShrink: 0 }}>
        {props.score}
      </Typography>
      <Typography sx={{ color: colors.text.muted, fontSize: "0.6rem", textAlign: "right", minWidth: 40, flexShrink: 0 }}>
        {props.date}
      </Typography>
    </Box>
  );
};
