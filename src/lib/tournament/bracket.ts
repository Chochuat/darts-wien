/** QF seed pairing for an 8-player bracket: [seed1 vs seed8, seed4 vs seed5, seed2 vs seed7, seed3 vs seed6]. */
export const QF_SEED_PAIRINGS: Array<[number, number]> = [
  [1, 8],
  [4, 5],
  [2, 7],
  [3, 6],
];

/**
 * Regular tournament bracket definition (8 matches, no consolation).
 * QF(4) + SF(2) + 3rd Place(1) + Final(1) = 8 matches.
 *
 * Each link describes which match feeds into which downstream match,
 * which slot of the downstream match, and whether the winner or loser advances.
 */
export interface BracketLink {
  fromMatchIndex: number;
  toMatchIndex: number;
  slot: "player1" | "player2";
  advances: "winner" | "loser";
}

export interface BracketRound {
  name: string;
  matchCount: number;
}

export interface BracketDefinition {
  rounds: BracketRound[];
  totalMatches: number;
  links: BracketLink[];
}

/**
 * Regular tournament bracket: 4 QF + 2 SF + 1 3rd-place + 1 Final = 8 matches.
 * Match indices: QF=0-3, SF=4-5, 3rd=6, Final=7.
 */
export const REGULAR_BRACKET: BracketDefinition = {
  rounds: [
    { name: "Quarter-Finals", matchCount: 4 },
    { name: "Semi-Finals", matchCount: 2 },
    { name: "3rd Place", matchCount: 1 },
    { name: "Final", matchCount: 1 },
  ],
  totalMatches: 8,
  links: [
    // QF → SF
    { fromMatchIndex: 0, toMatchIndex: 4, slot: "player1", advances: "winner" },
    { fromMatchIndex: 1, toMatchIndex: 4, slot: "player2", advances: "winner" },
    { fromMatchIndex: 2, toMatchIndex: 5, slot: "player1", advances: "winner" },
    { fromMatchIndex: 3, toMatchIndex: 5, slot: "player2", advances: "winner" },
    // SF → Final
    { fromMatchIndex: 4, toMatchIndex: 7, slot: "player1", advances: "winner" },
    { fromMatchIndex: 5, toMatchIndex: 7, slot: "player2", advances: "winner" },
    // SF → 3rd Place (losers)
    { fromMatchIndex: 4, toMatchIndex: 6, slot: "player2", advances: "loser" },
    { fromMatchIndex: 5, toMatchIndex: 6, slot: "player1", advances: "loser" },
  ],
};

/**
 * Grand final bracket: 4 QF + 2 SF + 1 3rd + 1 Final + 2 Consolation-SF +
 * 1 5th-place + 1 7th-place = 12 matches.
 * Match indices: QF=0-3, SF=4-5, 3rd=6, Final=7, Cons-SF=8-9, 5th=10, 7th=11.
 */
export const GRAND_FINAL_BRACKET: BracketDefinition = {
  rounds: [
    { name: "Quarter-Finals", matchCount: 4 },
    { name: "Semi-Finals", matchCount: 2 },
    { name: "3rd Place", matchCount: 1 },
    { name: "Final", matchCount: 1 },
    { name: "Consolation-SF", matchCount: 2 },
    { name: "5th Place", matchCount: 1 },
    { name: "7th Place", matchCount: 1 },
  ],
  totalMatches: 12,
  links: [
    // QF → SF (winners)
    { fromMatchIndex: 0, toMatchIndex: 4, slot: "player1", advances: "winner" },
    { fromMatchIndex: 1, toMatchIndex: 4, slot: "player2", advances: "winner" },
    { fromMatchIndex: 2, toMatchIndex: 5, slot: "player1", advances: "winner" },
    { fromMatchIndex: 3, toMatchIndex: 5, slot: "player2", advances: "winner" },
    // QF → Consolation-SF (losers)
    { fromMatchIndex: 0, toMatchIndex: 8, slot: "player1", advances: "loser" },
    { fromMatchIndex: 1, toMatchIndex: 9, slot: "player1", advances: "loser" },
    { fromMatchIndex: 2, toMatchIndex: 9, slot: "player2", advances: "loser" },
    { fromMatchIndex: 3, toMatchIndex: 8, slot: "player2", advances: "loser" },
    // SF → Final (winners)
    { fromMatchIndex: 4, toMatchIndex: 7, slot: "player1", advances: "winner" },
    { fromMatchIndex: 5, toMatchIndex: 7, slot: "player2", advances: "winner" },
    // SF → 3rd Place (losers)
    { fromMatchIndex: 4, toMatchIndex: 6, slot: "player2", advances: "loser" },
    { fromMatchIndex: 5, toMatchIndex: 6, slot: "player1", advances: "loser" },
    // Consolation-SF → 5th Place (winners)
    { fromMatchIndex: 8, toMatchIndex: 10, slot: "player1", advances: "winner" },
    { fromMatchIndex: 9, toMatchIndex: 10, slot: "player2", advances: "winner" },
    // Consolation-SF → 7th Place (losers)
    { fromMatchIndex: 8, toMatchIndex: 11, slot: "player2", advances: "loser" },
    { fromMatchIndex: 9, toMatchIndex: 11, slot: "player1", advances: "loser" },
  ],
};

/**
 * Selects the bracket definition for a tournament type.
 *
 * @param type - "regular" or "grand_final".
 * @returns The matching bracket definition.
 */
export function getBracket(type: "regular" | "grand_final"): BracketDefinition {
  return type === "grand_final" ? GRAND_FINAL_BRACKET : REGULAR_BRACKET;
}

/**
 * Returns the links that feed INTO a given match (its upstream matches).
 *
 * @param bracket - The bracket definition.
 * @param matchIndex - The target match index.
 * @returns Upstream links feeding into the target match.
 */
export function upstreamLinks(
  bracket: BracketDefinition,
  matchIndex: number,
): BracketLink[] {
  return bracket.links.filter((l) => l.toMatchIndex === matchIndex);
}

/**
 * Returns the links that flow FROM a given match (its downstream matches).
 *
 * @param bracket - The bracket definition.
 * @param matchIndex - The source match index.
 * @returns Downstream links from the source match.
 */
export function downstreamLinks(
  bracket: BracketDefinition,
  matchIndex: number,
): BracketLink[] {
  return bracket.links.filter((l) => l.fromMatchIndex === matchIndex);
}

/**
 * Determines which player advances from a completed match.
 *
 * @param player1Id - Player 1 ID.
 * @param player2Id - Player 2 ID.
 * @param legsPlayer1 - Legs won by player 1.
 * @param legsPlayer2 - Legs won by player 2.
 * @param advances - Whether the winner or loser advances.
 * @returns The advancing player's ID.
 */
export function resolveAdvancingPlayer(
  player1Id: number,
  player2Id: number,
  legsPlayer1: number,
  legsPlayer2: number,
  advances: "winner" | "loser",
): number {
  const winnerId = legsPlayer1 > legsPlayer2 ? player1Id : player2Id;
  const loserId = legsPlayer1 > legsPlayer2 ? player2Id : player1Id;
  return advances === "winner" ? winnerId : loserId;
}
