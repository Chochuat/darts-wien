import type { ApiMatchRow, ApiTournamentGroup } from "@/lib/validation";

/**
 * A single match reinterpreted from one player's point of view.
 */
export interface PerspectiveMatch {
  playerName: string;
  opponent: string;
  score: string;
  result: "W" | "L";
  one80: number;
}

/**
 * Converts a match to a perspective from one player's viewpoint.
 *
 * @param m - The match row.
 * @param forPlayerName - The player name to calculate perspective for.
 */
export function toPerspective(
  m: ApiMatchRow,
  forPlayerName: string
): PerspectiveMatch | null {
  const isP1 = m.player1.name === forPlayerName;
  const isP2 = m.player2.name === forPlayerName;
  if (!isP1 && !isP2) return null;

  const p = isP1 ? m.player1 : m.player2;
  const opp = isP1 ? m.player2 : m.player1;
  const legsP = isP1 ? (m.legsPlayer1 ?? 0) : (m.legsPlayer2 ?? 0);
  const legsO = isP1 ? (m.legsPlayer2 ?? 0) : (m.legsPlayer1 ?? 0);
  const one80 = isP1 ? m.player1_180 : m.player2_180;

  return {
    playerName: p.name,
    opponent: opp.name,
    score: `${legsP}-${legsO}`,
    result: legsP > legsO ? "W" : "L",
    one80,
  };
}

/**
 * Converts all matches in a group to perspective format.
 *
 * @param g - The tournament group.
 */
export function groupMatchesFromPerspective(
  g: ApiTournamentGroup
): PerspectiveMatch[] {
  const entries: PerspectiveMatch[] = [];

  for (const m of g.matches) {
    const p1v = toPerspective(m, m.player1.name);
    const p2v = toPerspective(m, m.player2.name);
    if (p1v) entries.push(p1v);
    if (p2v) entries.push(p2v);
  }

  return entries;
}