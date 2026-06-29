import type { GenerationType, ExtraMatchPairing, GroupLabel } from "@/lib/validation";

/** A player ranked by standings for group generation. */
export interface RankedPlayer {
  playerId: number;
  rank: number;
}

/** A group with its label and assigned players. */
export interface GroupAssignment {
  label: string;
  playerIds: number[];
}

/** Allowed group labels for N groups (2 → A,B; 3 → A,B,C; 4 → A,B,C,D). */
export const GROUP_LABELS = ["A", "B", "C", "D"] as const;

/**
 * Validates that the player count is valid for the given number of groups.
 * Each group must have 3–5 players.
 *
 * @param playerCount - Total registered players.
 * @param numGroups - Number of groups (2–4).
 * @returns Error message if invalid, null if valid.
 */
export function validateGroupSizing(
  playerCount: number,
  numGroups: number,
): string | null {
  if (numGroups < 2 || numGroups > 4) {
    return "numGroups must be between 2 and 4";
  }
  const min = numGroups * 3;
  const max = numGroups * 5;
  if (playerCount < min) {
    return `Not enough players: need at least ${min} for ${numGroups} groups (got ${playerCount})`;
  }
  if (playerCount > max) {
    return `Too many players: maximum ${max} for ${numGroups} groups (got ${playerCount})`;
  }
  return null;
}

/**
 * Assigns players to groups using the `split_contiguous` strategy.
 * Top-ranked players go to group A, next to B, etc. Larger groups first.
 *
 * @param players - Players sorted by rank ascending (rank 1 first).
 * @param numGroups - Number of groups (2–4).
 * @returns Group assignments.
 */
export function splitContiguous(
  players: RankedPlayer[],
  numGroups: number,
): GroupAssignment[] {
  const base = Math.floor(players.length / numGroups);
  const extra = players.length % numGroups;
  const groups: GroupAssignment[] = [];
  let offset = 0;
  for (let g = 0; g < numGroups; g++) {
    const size = base + (g < extra ? 1 : 0);
    const slice = players.slice(offset, offset + size);
    groups.push({
      label: GROUP_LABELS[g]!,
      playerIds: slice.map((p) => p.playerId),
    });
    offset += size;
  }
  return groups;
}

/**
 * Assigns players to groups using the `interleaved_strict` strategy.
 * Player at rank r goes to group (r-1) % numGroups.
 *
 * @param players - Players sorted by rank ascending.
 * @param numGroups - Number of groups (2–4).
 * @returns Group assignments.
 */
export function interleavedStrict(
  players: RankedPlayer[],
  numGroups: number,
): GroupAssignment[] {
  const groups: GroupAssignment[] = Array.from({ length: numGroups }, (_, g) => ({
    label: GROUP_LABELS[g]!,
    playerIds: [],
  }));
  for (let i = 0; i < players.length; i++) {
    const g = i % numGroups;
    groups[g]!.playerIds.push(players[i]!.playerId);
  }
  return groups;
}

/**
 * Assigns players to groups using the `snake` strategy.
 * Even rounds go forward (A→D), odd rounds go backward (D→A).
 *
 * @param players - Players sorted by rank ascending.
 * @param numGroups - Number of groups (2–4).
 * @returns Group assignments.
 */
export function snake(
  players: RankedPlayer[],
  numGroups: number,
): GroupAssignment[] {
  const groups: GroupAssignment[] = Array.from({ length: numGroups }, (_, g) => ({
    label: GROUP_LABELS[g]!,
    playerIds: [],
  }));
  for (let i = 0; i < players.length; i++) {
    const round = Math.floor(i / numGroups);
    const posInRound = i % numGroups;
    const g = round % 2 === 0 ? posInRound : numGroups - 1 - posInRound;
    groups[g]!.playerIds.push(players[i]!.playerId);
  }
  return groups;
}

/**
 * Dispatches to the correct generation algorithm.
 *
 * @param strategy - The generation strategy name.
 * @param players - Players sorted by rank ascending (rank 1 first).
 * @param numGroups - Number of groups (2–4).
 * @returns Group assignments.
 * @throws when strategy is "manual" (use manualAssignments directly).
 */
export function generateGroups(
  strategy: GenerationType,
  players: RankedPlayer[],
  numGroups: number,
): GroupAssignment[] {
  switch (strategy) {
    case "split_contiguous":
      return splitContiguous(players, numGroups);
    case "interleaved_strict":
      return interleavedStrict(players, numGroups);
    case "snake":
      return snake(players, numGroups);
    case "manual":
      throw new Error("manual strategy does not use auto-generation; use manualAssignments directly");
  }
}

/**
 * Computes the size of the largest group given total players and group count.
 *
 * @param playerCount - Total players.
 * @param numGroups - Number of groups.
 * @returns The maximum group size.
 */
export function maxGroupSize(playerCount: number, numGroups: number): number {
  const base = Math.floor(playerCount / numGroups);
  const extra = playerCount % numGroups;
  return base + (extra > 0 ? 1 : 0);
}

/**
 * Computes all round-robin pairings for a group of the given size.
 *
 * @param size - Number of players in the group.
 * @returns Array of [indexA, indexB] pairs (0-based indices within the group).
 */
export function roundRobinPairings(size: number): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      pairs.push([i, j]);
    }
  }
  return pairs;
}

/**
 * Computes the extra matches needed for a smaller group to match the match
 * count of the largest group. Each player should play (maxSize - 1) matches.
 * Single round-robin gives (size - 1) matches per player. Extra matches per
 * player = maxSize - size. Total extra matches = size * (maxSize - size) / 2,
 * rounded up to the nearest integer.
 *
 * @param groupSize - Size of the smaller group.
 * @param maxSize - Size of the largest group in the tournament.
 * @returns The number of extra matches needed.
 */
export function extraMatchCount(groupSize: number, maxSize: number): number {
  if (groupSize >= maxSize) return 0;
  const totalSlots = groupSize * (maxSize - groupSize);
  return Math.ceil(totalSlots / 2);
}

/**
 * Suggests extra-match pairings for a smaller group based on the selected rule.
 * Players are indexed 0-based within the group (0 = highest-ranked in group).
 *
 * @param groupSize - Size of the smaller group.
 * @param maxSize - Size of the largest group.
 * @param pairing - The pairing rule to use.
 * @returns Array of [indexA, indexB] pairs (0-based within the group).
 */
export function suggestExtraMatches(
  groupSize: number,
  maxSize: number,
  pairing: ExtraMatchPairing,
): Array<[number, number]> {
  const count = extraMatchCount(groupSize, maxSize);
  if (count === 0) return [];

  const allPairs = roundRobinPairings(groupSize);
  // Sort pairs by different criteria based on the rule
  let sorted: Array<[number, number]>;
  switch (pairing) {
    case "top_vs_bottom":
      sorted = [...allPairs].sort((a, b) => {
        const spreadA = Math.abs(a[0] - a[1]);
        const spreadB = Math.abs(b[0] - b[1]);
        return spreadB - spreadA;
      });
      break;
    case "top_vs_top":
      sorted = [...allPairs].sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
      break;
    case "cross":
      sorted = [...allPairs].sort((a, b) => {
        const target = Math.floor(groupSize / 2);
        const distA = Math.abs(Math.abs(a[0] - a[1]) - target);
        const distB = Math.abs(Math.abs(b[0] - b[1]) - target);
        return distA - distB;
      });
      break;
    case "manual":
      return [];
  }
  return sorted.slice(0, count);
}

/**
 * Generates all match pairings for a group, including single round-robin plus
 * extra matches.
 *
 * @param playerIds - Player IDs in the group (ordered by rank within group).
 * @param maxSize - Size of the largest group in the tournament.
 * @param pairing - The extra-match pairing rule.
 * @returns Array of match pairings, each with player1Id and player2Id.
 */
export function generateGroupMatches(
  playerIds: number[],
  maxSize: number,
  pairing: ExtraMatchPairing,
): Array<{ player1Id: number; player2Id: number }> {
  const rr = roundRobinPairings(playerIds.length);
  const base = rr.map(([i, j]) => ({
    player1Id: playerIds[i]!,
    player2Id: playerIds[j]!,
  }));
  const extra = suggestExtraMatches(playerIds.length, maxSize, pairing);
  const extraMatches = extra.map(([i, j]) => ({
    player1Id: playerIds[i]!,
    player2Id: playerIds[j]!,
  }));
  return [...base, ...extraMatches];
}

export type { GroupLabel };
