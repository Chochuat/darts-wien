"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import { colors } from "@/lib/design-tokens";
import Badge180 from "@/app/_components/ui/badge-180";
import type { PerspectiveMatch } from "./perspective-utils";
import type { ApiFinalStandingEntry } from "@/lib/validation";

/**
 * Renders a table cell with optional styling.
 *
 * @param label - The text or number to display in the cell.
 * @param opts - Optional formatting properties (color, bold).
 * @returns A Typography component representing a table cell.
 */
export function cell(label: string | number, opts?: { color?: string; bold?: boolean }) {
  return (
    <Typography
      sx={{
        color: opts?.color ?? colors.text.secondary,
        fontSize: "0.65rem",
        fontWeight: opts?.bold ? 800 : 600,
        textAlign: "center",
        minWidth: 28,
        flexShrink: 0,
      }}
    >
      {label}
    </Typography>
  );
}

/**
 * Displays the set difference with color coding.
 *
 * @param props - Component properties.
 */
export const SetsDiff = (props: { setsFor: number; setsAgainst: number }) => {
  const diff = props.setsFor - props.setsAgainst;
  return (
    <Typography
      sx={{
        color: diff > 0 ? colors.green : diff < 0 ? colors.red : colors.text.muted,
        fontSize: "0.65rem",
        fontWeight: 700,
        textAlign: "center",
        minWidth: 30,
        flexShrink: 0,
      }}
    >
      {diff > 0 ? `+${diff}` : diff === 0 ? "0" : String(diff)}
    </Typography>
  );
}

/**
 * Displays a playoff match between two playerprops.s.
 *
 * @param props - Component properties.
 */
export const PlayoffMatch = (props: {
  m1: PerspectiveMatch;
  m2: PerspectiveMatch;
  resultKey: string;
  winnerStyle: "accent" | "gold" | "bronze";
}) => {
  const scoreColor = props.winnerStyle === "gold" ? colors.goldText : colors.accent;
  const scoreWeight = props.winnerStyle === "gold" ? 900 : 800;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Box sx={{ flex: 1, textAlign: "right", minWidth: 0 }}>
        {props.winnerStyle === "gold" ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, justifyContent: "flex-end" }}>
            {props.m1.result === "W" ? <EmojiEvents sx={{ color: colors.gold, fontSize: "0.75rem", flexShrink: 0 }} /> : null}
            <Typography sx={{ color: colors.text.primary, fontSize: "0.75rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {props.m1.playerName}
            </Typography>
            {props.m1.one80 > 0 ? <Badge180 /> : null}
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, justifyContent: "flex-end" }}>
            <Typography sx={{ color: props.m1.result === "W" ? colors.text.primary : colors.text.muted, fontSize: "0.75rem", fontWeight: props.m1.result === "W" ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {props.m1.playerName}
            </Typography>
            {props.m1.one80 > 0 ? <Badge180 /> : null}
          </Box>
        )}
      </Box>
      <Typography sx={{ color: scoreColor, fontSize: "0.75rem", fontWeight: scoreWeight, fontFamily: "'Courier New', monospace", textAlign: "center", flexShrink: 0, minWidth: props.resultKey === "Final" ? 34 : 32 }}>
        {props.m1.score}
      </Typography>
      <Box sx={{ flex: 1, textAlign: "left", minWidth: 0, display: "flex", alignItems: "center", gap: 0.3 }}>
        <Typography sx={{ color: props.winnerStyle === "gold" && props.m2.result !== "W" ? colors.text.secondary : props.m2.result === "W" ? colors.text.primary : colors.text.muted, fontSize: "0.75rem", fontWeight: props.winnerStyle === "gold" ? (props.m2.result !== "W" ? 500 : 700) : props.m2.result === "W" ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {props.m2.playerName}
        </Typography>
        {props.m2.one80 > 0 ? <Badge180 /> : null}
      </Box>
    </Box>
  );
}

/**
 * Displays a playoff round with match pairs.
 *
 * @param props - Component properties.
 */
export const PlayoffRound = (props: {
  roundName: string;
  roundLabel: string;
  allPlayoffEntries: PerspectiveMatch[];
  color: string;
  borderColor: string;
  bgcolor: string;
}) => {
  const pairs: { m1: PerspectiveMatch; m2: PerspectiveMatch }[] = [];
  for (let i = 0; i < props.allPlayoffEntries.length; i += 2) {
    const m1 = props.allPlayoffEntries[i];
    const m2 = props.allPlayoffEntries[i + 1];
    if (m1 && m2) pairs.push({ m1, m2 });
  }

  const winnerStyle = props.roundName === "Final" ? "gold" : props.roundName === "3rd Place" ? "bronze" : "accent";

  return (
    <Box sx={{ flex: 1, maxWidth: { md: 300 } }}>
      <Typography sx={{ color: props.color, fontSize: "0.65rem", fontWeight: 700, letterSpacing: 1, mb: 0.75, textAlign: "center", textTransform: "uppercase" }}>
        {props.roundLabel}
      </Typography>
      {pairs.map(({ m1, m2 }) => (
        <Box key={`${m1.playerName}-${m2.playerName}`} sx={{ bgcolor: props.bgcolor, borderRadius: 1.5, px: 1.25, py: 0.7, mb: 0.5, border: "1px solid", borderColor: props.borderColor }}>
          <PlayoffMatch m1={m1} m2={m2} resultKey={props.roundName} winnerStyle={winnerStyle} />
        </Box>
      ))}
    </Box>
  );
}

/**
 * Displays a final standings row.
 *
 * @param props - Component properties.
 */
export const FinalStandingsRow = (props: { s: ApiFinalStandingEntry; i: number }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", px: 1.5, py: 0.5, borderBottom: "1px solid #f0f0f0", gap: 0.5, bgcolor: props.i === 0 ? `${colors.gold}12` : props.i === 1 ? `${colors.silver}12` : props.i === 2 ? `${colors.bronze}12` : props.i === 3 ? `${colors.accent}06` : "transparent" }}>
      <Box sx={{ width: 22, textAlign: "center", flexShrink: 0 }}>
        {props.i === 0 ? (
          <EmojiEvents sx={{ color: colors.gold, fontSize: "0.8rem" }} titleAccess="1st" />
        ) : props.i === 1 ? (
          <EmojiEvents sx={{ color: colors.silver, fontSize: "0.7rem" }} titleAccess="2nd" />
        ) : props.i === 2 ? (
          <EmojiEvents sx={{ color: colors.bronze, fontSize: "0.7rem" }} titleAccess="3rd" />
        ) : (
          <Typography sx={{ color: colors.text.subtle, fontSize: "0.6rem", fontWeight: 600 }}>
            {props.s.pos}
          </Typography>
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography sx={{ color: colors.text.primary, fontSize: "0.75rem", fontWeight: props.i <= 2 ? 700 : 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {props.s.player.name}
        </Typography>
      </Box>
      {cell(props.s.played)}
      {cell(props.s.wins, { color: colors.green })}
      {cell(props.s.losses, { color: colors.red })}
      {cell(`${props.s.setsFor}:${props.s.setsAgainst}`)}
      {cell(props.s.one80s, { color: colors.accent })}
      <SetsDiff setsAgainst={props.s.setsAgainst} setsFor={props.s.setsFor} />
      {cell(props.s.totalPoints, { bold: true })}
    </Box>
  );
}