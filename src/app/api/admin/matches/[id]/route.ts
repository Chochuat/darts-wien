import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  requireAdminOrScorekeeper,
  isAuthError,
  errorResponse,
  validationError,
  requireNumericParam,
  type SessionProfile,
} from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { MatchResultUpdate } from "@/lib/validation";
import {
  getBracket,
  resolveAdvancingPlayer,
  QF_SEED_PAIRINGS,
} from "@/lib/tournament";

interface MatchRow {
  id: number;
  tournament_id: number | null;
  season_id: number;
  match_type: string;
  status: string;
  legs_target: number;
  player1_id: number | null;
  player2_id: number | null;
  next_match_id: number | null;
  advances: string | null;
  player_slot: string | null;
  tournament_round_name: string | null;
}

/**
 * Checks cascade lock: are any downstream matches already played?
 * If so, this match is locked and cannot be edited.
 *
 * @param supabase - The admin Supabase client.
 * @param match - The match being edited.
 * @returns Error message if locked, null if editable.
 */
async function checkCascadeLock(
  supabase: ReturnType<typeof createAdminClient>,
  match: MatchRow,
): Promise<string | null> {
  if (!match.tournament_id || !match.next_match_id) return null;

  // For group matches: locked if any QF match has a result.
  if (match.match_type === "tournament_group") {
    const { data: qfResults } = await supabase
      .from("matches")
      .select("id")
      .eq("tournament_id", match.tournament_id)
      .eq("match_type", "tournament_playoff")
      .neq("status", "pending")
      .limit(1);
    if (qfResults && qfResults.length > 0) {
      return "Group matches are locked (playoffs have started)";
    }
    return null;
  }

  // For playoff matches: locked if downstream match has a result.
  const downstream = await getDownstreamMatchIds(supabase, match.id);
  if (downstream.length === 0) return null;

  const { data: downstreamResults } = await supabase
    .from("matches")
    .select("id")
    .in("id", downstream)
    .neq("status", "pending")
    .limit(1);

  if (downstreamResults && downstreamResults.length > 0) {
    return "Match is locked (downstream round has been played)";
  }
  return null;
}

async function getDownstreamMatchIds(
  supabase: ReturnType<typeof createAdminClient>,
  matchId: number,
): Promise<number[]> {
  const result: number[] = [];
  let current = matchId;
  const visited = new Set<number>([matchId]);
  while (true) {
    const { data } = await supabase
      .from("matches")
      .select("next_match_id")
      .eq("id", current)
      .single();
    if (!data || !data.next_match_id) break;
    const nextId = data.next_match_id as number;
    if (visited.has(nextId)) break;
    visited.add(nextId);
    result.push(nextId);
    current = nextId;
  }
  return result;
}

/**
 * Advances the winning/losing player to the downstream match slot.
 *
 * @param supabase - The admin Supabase client.
 * @param match - The completed match.
 * @param legsPlayer1 - Legs won by player 1.
 * @param legsPlayer2 - Legs won by player 2.
 */
async function advancePlayer(
  supabase: ReturnType<typeof createAdminClient>,
  match: MatchRow,
  legsPlayer1: number,
  legsPlayer2: number,
): Promise<void> {
  if (!match.next_match_id || !match.player_slot || !match.advances) return;
  if (!match.player1_id || !match.player2_id) return;

  const advancingPlayer = resolveAdvancingPlayer(
    match.player1_id,
    match.player2_id,
    legsPlayer1,
    legsPlayer2,
    match.advances as "winner" | "loser",
  );

  const updateField = match.player_slot === "player1" ? "player1_id" : "player2_id";
  await supabase
    .from("matches")
    .update({ [updateField]: advancingPlayer })
    .eq("id", match.next_match_id);
}

/**
 * Attempts to auto-seed QF matches when the last group match is completed.
 *
 * @param supabase - The admin Supabase client.
 * @param tournamentId - The tournament ID.
 */
async function tryAutoSeedQF(
  supabase: ReturnType<typeof createAdminClient>,
  tournamentId: number,
): Promise<void> {
  // Check no pending group matches.
  const { data: pending } = await supabase
    .from("matches")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("match_type", "tournament_group")
    .eq("status", "pending")
    .limit(1);

  if (pending && pending.length > 0) return;

  // Check no playoff matches exist yet.
  const { data: existingPlayoff } = await supabase
    .from("matches")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("match_type", "tournament_playoff")
    .limit(1);

  if (existingPlayoff && existingPlayoff.length > 0) return;

  // Fetch tournament.
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("season_id, type, date, num_groups")
    .eq("id", tournamentId)
    .single();

  if (!tournament || tournament.type === "grand_final") return;

  // Fetch club settings for tiebreaker order.
  const { data: settings } = await supabase
    .from("club_settings")
    .select("tiebreaker_order")
    .eq("id", 1)
    .single();

  const tiebreakerOrder = (settings?.tiebreaker_order as string[]) ?? [
    "head_to_head", "leg_diff", "legs_won", "legs_lost", "one80s",
  ];

  // Compute group standings and advancement.
  const advancement = await computeAdvancement(
    supabase,
    tournamentId,
    tournament.num_groups ?? 2,
    tiebreakerOrder,
  );

  if (!advancement) return; // Unresolvable tiebreaker — admin must seed manually.

  // Fetch format config.
  const { data: formatRows } = await supabase
    .from("tournament_format")
    .select("phase, legs_target, starting_score, max_throws")
    .eq("tournament_id", tournamentId);

  const formatMap = new Map(
    (formatRows ?? []).map((f) => [f.phase as string, {
      legs_target: f.legs_target as number,
      starting_score: f.starting_score as number,
      max_throws: f.max_throws as number,
    }]),
  );

  const getFormat = (phase: string) => formatMap.get(phase) ?? {
    legs_target: 3, starting_score: 501, max_throws: 45,
  };

  const bracket = getBracket("regular");
  const matches: Array<Record<string, unknown>> = [];

  for (let i = 0; i < 4; i++) {
    const [seedA, seedB] = QF_SEED_PAIRINGS[i]!;
    const fmt = getFormat("playoff");
    matches.push({
      season_id: tournament.season_id,
      player1_id: advancement[seedA - 1] ?? null,
      player2_id: advancement[seedB - 1] ?? null,
      status: "pending",
      legs_target: fmt.legs_target,
      max_throws: fmt.max_throws,
      starting_score: fmt.starting_score,
      match_type: "tournament_playoff",
      tournament_id: tournamentId,
      tournament_round_name: "Quarter-Finals",
      sort_order: i,
      match_date: tournament.date,
    });
  }

  const roundNames = ["Semi-Finals", "3rd Place", "Final"];
  const phaseMap: Record<string, string> = {
    "Semi-Finals": "playoff",
    "3rd Place": "third_place",
    "Final": "final",
  };

  for (let i = 4; i < bracket.totalMatches; i++) {
    const roundName = roundNames[i - 4]!;
    const fmt = getFormat(phaseMap[roundName] ?? "playoff");
    matches.push({
      season_id: tournament.season_id,
      player1_id: null,
      player2_id: null,
      status: "pending",
      legs_target: fmt.legs_target,
      max_throws: fmt.max_throws,
      starting_score: fmt.starting_score,
      match_type: "tournament_playoff",
      tournament_id: tournamentId,
      tournament_round_name: roundName,
      sort_order: i,
      match_date: tournament.date,
    });
  }

  const { data: inserted, error } = await supabase
    .from("matches")
    .insert(matches)
    .select("id, sort_order");

  if (error || !inserted) return;

  const matchIds = inserted.sort((a, b) => a.sort_order - b.sort_order);
  for (const link of bracket.links) {
    await supabase
      .from("matches")
      .update({
        next_match_id: matchIds[link.toMatchIndex]!.id,
        advances: link.advances,
        player_slot: link.slot,
      })
      .eq("id", matchIds[link.fromMatchIndex]!.id);
  }
}

async function computeAdvancement(
  supabase: ReturnType<typeof createAdminClient>,
  tournamentId: number,
  numGroups: number,
  _tiebreakerOrder: string[],
): Promise<number[] | null> {
  // Fetch groups with players.
  const { data: groups } = await supabase
    .from("tournament_groups")
    .select("id, label")
    .eq("tournament_id", tournamentId);

  if (!groups || groups.length === 0) return null;

  const advancingPerGroup = numGroups === 2 ? 4 : 2;
  const advancing: number[] = [];

  for (const g of groups) {
    const { data: groupPlayers } = await supabase
      .from("tournament_group_players")
      .select("player_id")
      .eq("group_id", g.id);

    if (!groupPlayers) continue;

    // Compute group standings.
    const { data: matches } = await supabase
      .from("matches")
      .select("player1_id, player2_id, legs_player1, legs_player2, player1_180, player2_180")
      .eq("tournament_group_id", g.id)
      .neq("status", "pending");

    const stats = new Map<number, { points: number; legDiff: number; legsWon: number; legsLost: number }>();
    for (const gp of groupPlayers) {
      stats.set(gp.player_id, { points: 0, legDiff: 0, legsWon: 0, legsLost: 0 });
    }
    for (const m of matches ?? []) {
      const p1 = stats.get(m.player1_id as number);
      const p2 = stats.get(m.player2_id as number);
      if (p1) {
        p1.legsWon += m.legs_player1 ?? 0;
        p1.legsLost += m.legs_player2 ?? 0;
        p1.legDiff += (m.legs_player1 ?? 0) - (m.legs_player2 ?? 0);
        if ((m.legs_player1 ?? 0) > (m.legs_player2 ?? 0)) p1.points += 2;
      }
      if (p2) {
        p2.legsWon += m.legs_player2 ?? 0;
        p2.legsLost += m.legs_player1 ?? 0;
        p2.legDiff += (m.legs_player2 ?? 0) - (m.legs_player1 ?? 0);
        if ((m.legs_player2 ?? 0) > (m.legs_player1 ?? 0)) p2.points += 2;
      }
    }

    const sorted = Array.from(stats.entries())
      .sort(([, a], [, b]) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.legDiff !== a.legDiff) return b.legDiff - a.legDiff;
        if (b.legsWon !== a.legsWon) return b.legsWon - a.legsWon;
        return a.legsLost - b.legsLost;
      })
      .slice(0, advancingPerGroup)
      .map(([pid]) => pid);

    advancing.push(...sorted);
  }

  // If we have exactly 8, return them ordered by group rank.
  if (advancing.length === 8) return advancing;
  // If fewer/more, admin must resolve manually.
  return null;
}

/**
 * Handles PATCH requests to record a match result.
 * Enforces cascade locks, advances bracket players, and triggers auto-QF seeding.
 *
 * @param req - The incoming request.
 * @param context - Route context.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const param = requireNumericParam(id, "match ID");
  if (param instanceof NextResponse) return param;
  const matchId = param.id;

  const session = await requireAdminOrScorekeeper();
  if (isAuthError(session)) return session;

  const body = await req.json();
  const parsed = MatchResultUpdate.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);

  const supabase = createAdminClient();

  const { data: matchData, error: findError } = await supabase
    .from("matches")
    .select("id, tournament_id, season_id, match_type, status, legs_target, player1_id, player2_id, next_match_id, advances, player_slot, tournament_round_name")
    .eq("id", matchId)
    .single();

  if (findError || !matchData) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const match = matchData as MatchRow;

  if (match.status !== "pending") {
    return NextResponse.json(
      { error: "Match is not in pending status" },
      { status: 409 },
    );
  }

  // Scorekeeper: only allow writes on in_progress tournaments.
  if ((session as SessionProfile).role === "scorekeeper" && match.tournament_id) {
    const { data: tournament } = await supabase
      .from("tournaments")
      .select("status")
      .eq("id", match.tournament_id)
      .single();
    if (!tournament || tournament.status !== "in_progress") {
      return NextResponse.json(
        { error: "Scorekeepers can only record results for in_progress tournaments" },
        { status: 403 },
      );
    }
  }

  // Check cascade lock.
  const lockError = await checkCascadeLock(supabase, match);
  if (lockError) {
    return NextResponse.json({ error: lockError }, { status: 409 });
  }

  // Update match result.
  const { data, error } = await supabase
    .from("matches")
    .update({
      status: "completed",
      legs_player1: parsed.data.legs_player1,
      legs_player2: parsed.data.legs_player2,
      player1_180: parsed.data.player1_180 ?? 0,
      player2_180: parsed.data.player2_180 ?? 0,
    })
    .eq("id", matchId)
    .select()
    .single();

  if (error) return errorResponse(error);

  // Advance bracket player if this is a playoff match.
  if (match.match_type === "tournament_playoff") {
    await advancePlayer(supabase, match, parsed.data.legs_player1, parsed.data.legs_player2);
  }

  // Auto-seed QF if this was the last group match.
  if (match.match_type === "tournament_group" && match.tournament_id) {
    await tryAutoSeedQF(supabase, match.tournament_id);
  }

  return NextResponse.json(data);
}
