"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import { colors } from "@/lib/design-tokens";
import Badge180 from "@/app/_components/ui/badge-180";
import type { PerspectiveMatch } from "./perspective-utils";
import type { ApiFinalStandingEntry } from "@/lib/validation";

/**
 * cell component.
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
 * SetsDiff component.
 * 
 * @param props - Component properties.
 * @param props.setsFor - Sets won.
 * @param props.setsAgainst - Sets lost.
 */
export const SetsDiff = ({ setsFor, setsAgainst }: { setsFor: number; setsAgainst: number }) => {
  const diff = setsFor - setsAgainst;
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
 * PlayoffMatch component.
 * 
 * @param props - Component properties.
 * @param props.m1 - Match details for player 1.
 * @param props.m2 - Match details for player 2.
 * @param props.resultKey - The round key (e.g., "Final").
 * @param props.winnerStyle - The styling to apply for the winner ("accent", "gold", or "bronze").
 */
export const PlayoffMatch = ({
  m1,
  m2,
  resultKey,
  winnerStyle,
}: {
  m1: PerspectiveMatch;
  m2: PerspectiveMatch;
  resultKey: string;
  winnerStyle: "accent" | "gold" | "bronze";
}) => {
  const scoreColor = winnerStyle === "gold" ? colors.goldText : colors.accent;
  const scoreWeight = winnerStyle === "gold" ? 900 : 800;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Box sx={{ flex: 1, textAlign: "right", minWidth: 0 }}>
        {winnerStyle === "gold" ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, justifyContent: "flex-end" }}>
            {m1.result === "W" ? <EmojiEvents sx={{ color: colors.gold, fontSize: "0.75rem", flexShrink: 0 }} /> : null}
            <Typography sx={{ color: colors.text.primary, fontSize: "0.75rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {m1.playerName}
            </Typography>
            {m1.one80 > 0 ? <Badge180 /> : null}
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, justifyContent: "flex-end" }}>
            <Typography sx={{ color: m1.result === "W" ? colors.text.primary : colors.text.muted, fontSize: "0.75rem", fontWeight: m1.result === "W" ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {m1.playerName}
            </Typography>
            {m1.one80 > 0 ? <Badge180 /> : null}
          </Box>
        )}
      </Box>
      <Typography sx={{ color: scoreColor, fontSize: "0.75rem", fontWeight: scoreWeight, fontFamily: "'Courier New', monospace", textAlign: "center", flexShrink: 0, minWidth: resultKey === "Final" ? 34 : 32 }}>
        {m1.score}
      </Typography>
      <Box sx={{ flex: 1, textAlign: "left", minWidth: 0, display: "flex", alignItems: "center", gap: 0.3 }}>
        <Typography sx={{ color: winnerStyle === "gold" && m2.result !== "W" ? colors.text.secondary : m2.result === "W" ? colors.text.primary : colors.text.muted, fontSize: "0.75rem", fontWeight: winnerStyle === "gold" ? (m2.result !== "W" ? 500 : 700) : m2.result === "W" ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {m2.playerName}
        </Typography>
        {m2.one80 > 0 ? <Badge180 /> : null}
      </Box>
    </Box>
  );
}

/**
 * PlayoffRound component.
 * 
 * @param props - Component properties.
 * @param props.roundName - The internal name of the round (e.g., "Final", "3rd Place").
 * @param props.roundLabel - The display label for the round.
 * @param props.allPlayoffEntries - The matches included in this round.
 * @param props.color - Text color.
 * @param props.borderColor - Border color for the match boxes.
 * @param props.bgcolor - Background color for the match boxes.
 */
export const PlayoffRound = ({
  roundName,
  roundLabel,
  allPlayoffEntries,
  color,
  borderColor,
  bgcolor,
}: {
  roundName: string;
  roundLabel: string;
  allPlayoffEntries: PerspectiveMatch[];
  color: string;
  borderColor: string;
  bgcolor: string;
}) => {
  const pairs: { m1: PerspectiveMatch; m2: PerspectiveMatch }[] = [];
  for (let i = 0; i < allPlayoffEntries.length; i += 2) {
    const m1 = allPlayoffEntries[i];
    const m2 = allPlayoffEntries[i + 1];
    if (m1 && m2) pairs.push({ m1, m2 });
  }

  const winnerStyle = roundName === "Final" ? "gold" : roundName === "3rd Place" ? "bronze" : "accent";

  return (
    <Box sx={{ flex: 1, maxWidth: { md: 300 } }}>
      <Typography sx={{ color, fontSize: "0.65rem", fontWeight: 700, letterSpacing: 1, mb: 0.75, textAlign: "center", textTransform: "uppercase" }}>
        {roundLabel}
      </Typography>
      {pairs.map(({ m1, m2 }) => (
        <Box key={`${m1.playerName}-${m2.playerName}`} sx={{ bgcolor, borderRadius: 1.5, px: 1.25, py: 0.7, mb: 0.5, border: "1px solid", borderColor }}>
          <PlayoffMatch m1={m1} m2={m2} resultKey={roundName} winnerStyle={winnerStyle} />
        </Box>
      ))}
    </Box>
  );
}

/**
 * FinalStandingsRow component.
 * 
 * @param props - Component properties.
 * @param props.s - The final standing entry data.
 * @param props.i - The index/position in the standings (0-based).
 */
export const FinalStandingsRow = ({ s, i }: { s: ApiFinalStandingEntry; i: number }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", px: 1.5, py: 0.5, borderBottom: "1px solid #f0f0f0", gap: 0.5, bgcolor: i === 0 ? `${colors.gold}12` : i === 1 ? `${colors.silver}12` : i === 2 ? `${colors.bronze}12` : i === 3 ? `${colors.accent}06` : "transparent" }}>
      <Box sx={{ width: 22, textAlign: "center", flexShrink: 0 }}>
        {i === 0 ? (
          <EmojiEvents sx={{ color: colors.gold, fontSize: "0.8rem" }} titleAccess="1st" />
        ) : i === 1 ? (
          <EmojiEvents sx={{ color: colors.silver, fontSize: "0.7rem" }} titleAccess="2nd" />
        ) : i === 2 ? (
          <EmojiEvents sx={{ color: colors.bronze, fontSize: "0.7rem" }} titleAccess="3rd" />
        ) : (
          <Typography sx={{ color: colors.text.subtle, fontSize: "0.6rem", fontWeight: 600 }}>
            {s.pos}
          </Typography>
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography sx={{ color: colors.text.primary, fontSize: "0.75rem", fontWeight: i <= 2 ? 700 : 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {s.player.name}
        </Typography>
      </Box>
      {cell(s.played)}
      {cell(s.wins, { color: colors.green })}
      {cell(s.losses, { color: colors.red })}
      {cell(`${s.setsFor}:${s.setsAgainst}`)}
      {cell(s.one80s, { color: colors.accent })}
      <SetsDiff setsAgainst={s.setsAgainst} setsFor={s.setsFor} />
      {cell(s.totalPoints, { bold: true })}
    </Box>
  );
}