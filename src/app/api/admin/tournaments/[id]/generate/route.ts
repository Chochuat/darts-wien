import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  requireAdmin,
  isAuthError,
  errorResponse,
  validationError,
  requireNumericParam,
} from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { TournamentGenerateBody } from "@/lib/validation";
import {
  generateGroups,
  validateGroupSizing,
  maxGroupSize,
  generateGroupMatches,
  getBracket,
  QF_SEED_PAIRINGS,
  type RankedPlayer,
} from "@/lib/tournament";

/** Default format values from format-constants.ts. */
const DEFAULTS = {
  group: { legs_target: 2, starting_score: 501, max_throws: 45 },
  playoff: { legs_target: 3, starting_score: 501, max_throws: 45 },
  third_place: { legs_target: 3, starting_score: 501, max_throws: 45 },
  final: { legs_target: 3, starting_score: 501, max_throws: 45 },
  grand_final_qf: { legs_target: 4, starting_score: 501, max_throws: 45 },
  grand_final_sf: { legs_target: 5, starting_score: 501, max_throws: 45 },
  grand_final_third: { legs_target: 5, starting_score: 501, max_throws: 45 },
  grand_final_final: { legs_target: 6, starting_score: 501, max_throws: 45 },
  grand_final_consolation_sf: { legs_target: 3, starting_score: 501, max_throws: 45 },
  grand_final_5th: { legs_target: 3, starting_score: 501, max_throws: 45 },
  grand_final_7th: { legs_target: 3, starting_score: 501, max_throws: 45 },
} as const;

/**
 * Handles POST requests to generate tournament groups and matches.
 * Creates groups, group matches, standings snapshot, and transitions to 'ready'.
 * For grand_final tournaments, creates the QF bracket directly from registrations.
 *
 * @param req - The incoming request.
 * @param context - Route context.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const param = requireNumericParam(id, "tournament ID");
  if (param instanceof NextResponse) return param;
  const tournamentId = param.id;

  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = TournamentGenerateBody.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);
  const b = parsed.data;

  const supabase = createAdminClient();

  // Fetch tournament.
  const { data: tournament, error: tError } = await supabase
    .from("tournaments")
    .select("id, season_id, status, type, date, num_groups")
    .eq("id", tournamentId)
    .single();

  if (tError || !tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  if (tournament.status !== "registration") {
    return NextResponse.json(
      { error: "Tournament must be in 'registration' status to generate" },
      { status: 409 },
    );
  }

  // Check previous tournament is completed (within same season).
  const { data: tournamentFull } = await supabase
    .from("tournaments")
    .select("week_number")
    .eq("id", tournamentId)
    .single();

  if (tournamentFull) {
    const { data: prev } = await supabase
      .from("tournaments")
      .select("id, status")
      .eq("season_id", tournament.season_id)
      .lt("week_number", tournamentFull.week_number)
      .order("week_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (prev && prev.status !== "completed") {
      return NextResponse.json(
        { error: "Previous tournament in this season must be completed first" },
        { status: 409 },
      );
    }
  }

  // Fetch registrations.
  const { data: registrations, error: regError } = await supabase
    .from("tournament_registrations")
    .select("player_id")
    .eq("tournament_id", tournamentId);

  if (regError) return errorResponse(regError);

  const playerIds = (registrations ?? []).map((r) => r.player_id);

  if (playerIds.length === 0) {
    return NextResponse.json(
      { error: "No registered players" },
      { status: 409 },
    );
  }

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

  function getFormat(phase: string) {
    return formatMap.get(phase) ?? DEFAULTS[phase as keyof typeof DEFAULTS] ?? DEFAULTS.group;
  }

  // ─── Grand final: create QF bracket directly ───────────────────────
  if (tournament.type === "grand_final") {
    if (playerIds.length !== 8) {
      return NextResponse.json(
        { error: "Grand final requires exactly 8 registered players" },
        { status: 409 },
      );
    }

    // Rank by season standings.
    const ranked = await rankPlayersByStandings(supabase, tournament.season_id, playerIds);
    const bracket = getBracket("grand_final");
    const matches: Array<Record<string, unknown>> = [];

    // QF matches: seeded by QF_SEED_PAIRINGS.
    for (let i = 0; i < 4; i++) {
      const [seedA, seedB] = QF_SEED_PAIRINGS[i]!;
      const fmt = getFormat("grand_final_qf");
      matches.push({
        season_id: tournament.season_id,
        player1_id: ranked[seedA - 1]!.playerId,
        player2_id: ranked[seedB - 1]!.playerId,
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

    // Downstream matches with NULL player slots.
    const roundNames = ["Semi-Finals", "3rd Place", "Final", "Consolation-SF", "5th Place", "7th Place"];
    const phaseMap: Record<string, string> = {
      "Semi-Finals": "grand_final_sf",
      "3rd Place": "grand_final_third",
      "Final": "grand_final_final",
      "Consolation-SF": "grand_final_consolation_sf",
      "5th Place": "grand_final_5th",
      "7th Place": "grand_final_7th",
    };

    for (let i = 4; i < bracket.totalMatches; i++) {
      const roundName = roundNames[i - 4]!;
      const phase = phaseMap[roundName] ?? "grand_final_sf";
      const fmt = getFormat(phase);
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

    // Insert all matches.
    const { data: insertedMatches, error: matchError } = await supabase
      .from("matches")
      .insert(matches)
      .select("id, sort_order");

    if (matchError) return errorResponse(matchError);

    // Set next_match_id links.
    const matchIds = (insertedMatches ?? []).sort((a, b) => a.sort_order - b.sort_order);
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

    // Store standings snapshot.
    await storeSnapshot(supabase, tournamentId, ranked);

    // Update tournament status.
    await supabase
      .from("tournaments")
      .update({
        status: "ready",
        generation_type: b.generationType,
        num_groups: null,
      })
      .eq("id", tournamentId);

    return NextResponse.json({ success: true, matchesCreated: matches.length });
  }

  // ─── Regular tournament: group phase ──────────────────────────────
  const sizingError = validateGroupSizing(playerIds.length, b.numGroups);
  if (sizingError) {
    return NextResponse.json({ error: sizingError }, { status: 400 });
  }

  const ranked = await rankPlayersByStandings(supabase, tournament.season_id, playerIds);

  // Generate group assignments.
  let groupAssignments;
  if (b.generationType === "manual" && b.manualAssignments) {
    // Group by label from manual assignments.
    const labelMap = new Map<string, number[]>();
    for (const ma of b.manualAssignments) {
      const arr = labelMap.get(ma.groupLabel) ?? [];
      arr.push(ma.playerId);
      labelMap.set(ma.groupLabel, arr);
    }
    groupAssignments = Array.from(labelMap.entries()).map(([label, ids]) => ({
      label,
      playerIds: ids,
    }));
  } else {
    groupAssignments = generateGroups(b.generationType, ranked, b.numGroups);
  }

  const maxSize = maxGroupSize(playerIds.length, b.numGroups);
  const pairing = b.extraMatchPairing ?? "top_vs_bottom";

  // Create groups in DB.
  const groupLabels = groupAssignments.map((g) => ({ tournament_id: tournamentId, label: g.label }));
  const { data: insertedGroups, error: groupError } = await supabase
    .from("tournament_groups")
    .insert(groupLabels)
    .select("id, label");

  if (groupError) return errorResponse(groupError);

  const groupIdMap = new Map((insertedGroups ?? []).map((g) => [g.label as string, g.id as number]));

  // Create group_players entries.
  const groupPlayerInserts: Array<Record<string, unknown>> = [];
  for (const g of groupAssignments) {
    const gid = groupIdMap.get(g.label);
    if (gid === undefined) continue;
    for (const pid of g.playerIds) {
      groupPlayerInserts.push({ group_id: gid, player_id: pid });
    }
  }

  const { error: gpError } = await supabase
    .from("tournament_group_players")
    .insert(groupPlayerInserts);

  if (gpError) return errorResponse(gpError);

  // Generate group matches.
  const groupFormat = getFormat("group");
  const allMatches: Array<Record<string, unknown>> = [];

  for (const g of groupAssignments) {
    const gid = groupIdMap.get(g.label);
    if (gid === undefined) continue;
    const matchPairings = generateGroupMatches(g.playerIds, maxSize, pairing);
    for (const mp of matchPairings) {
      allMatches.push({
        season_id: tournament.season_id,
        player1_id: mp.player1Id,
        player2_id: mp.player2Id,
        status: "pending",
        legs_target: groupFormat.legs_target,
        max_throws: groupFormat.max_throws,
        starting_score: groupFormat.starting_score,
        match_type: "tournament_group",
        tournament_id: tournamentId,
        tournament_group_id: gid,
        match_date: tournament.date,
      });
    }
  }

  // Also handle manual extra matches.
  if (b.manualExtraMatches) {
    for (const mem of b.manualExtraMatches) {
      const gid = groupIdMap.get(mem.groupLabel);
      if (gid === undefined) continue;
      allMatches.push({
        season_id: tournament.season_id,
        player1_id: mem.player1Id,
        player2_id: mem.player2Id,
        status: "pending",
        legs_target: groupFormat.legs_target,
        max_throws: groupFormat.max_throws,
        starting_score: groupFormat.starting_score,
        match_type: "tournament_group",
        tournament_id: tournamentId,
        tournament_group_id: gid,
        match_date: tournament.date,
      });
    }
  }

  const { error: matchError } = await supabase
    .from("matches")
    .insert(allMatches);

  if (matchError) return errorResponse(matchError);

  // Store standings snapshot.
  await storeSnapshot(supabase, tournamentId, ranked);

  // Update tournament status.
  await supabase
    .from("tournaments")
    .update({
      status: "ready",
      generation_type: b.generationType,
      num_groups: b.numGroups,
    })
    .eq("id", tournamentId);

  return NextResponse.json({
    success: true,
    groupsCreated: groupAssignments.length,
    matchesCreated: allMatches.length,
  });
}

interface StandingsRow {
  player_id: number;
  points: number;
  leg_diff: number;
  legs_won: number;
  legs_lost: number;
  one80s: number;
}

async function rankPlayersByStandings(
  supabase: ReturnType<typeof createAdminClient>,
  seasonId: number,
  playerIds: number[],
): Promise<RankedPlayer[]> {
  // Fetch all completed matches for these players in the season.
  const { data: matches } = await supabase
    .from("matches")
    .select("player1_id, player2_id, legs_player1, legs_player2, player1_180, player2_180, status")
    .eq("season_id", seasonId)
    .in("status", ["completed", "no_show"])
    .or(`player1_id.in.(${playerIds.join(",")}),player2_id.in.(${playerIds.join(",")})`);

  const stats = new Map<number, StandingsRow>();
  for (const pid of playerIds) {
    stats.set(pid, {
      player_id: pid,
      points: 0,
      leg_diff: 0,
      legs_won: 0,
      legs_lost: 0,
      one80s: 0,
    });
  }

  for (const m of matches ?? []) {
    const p1 = stats.get(m.player1_id as number);
    const p2 = stats.get(m.player2_id as number);
    if (p1) {
      p1.legs_won += m.legs_player1 ?? 0;
      p1.legs_lost += m.legs_player2 ?? 0;
      p1.leg_diff += (m.legs_player1 ?? 0) - (m.legs_player2 ?? 0);
      p1.one80s += m.player1_180 ?? 0;
      if ((m.legs_player1 ?? 0) > (m.legs_player2 ?? 0)) p1.points += 2;
    }
    if (p2) {
      p2.legs_won += m.legs_player2 ?? 0;
      p2.legs_lost += m.legs_player1 ?? 0;
      p2.leg_diff += (m.legs_player2 ?? 0) - (m.legs_player1 ?? 0);
      p2.one80s += m.player2_180 ?? 0;
      if ((m.legs_player2 ?? 0) > (m.legs_player1 ?? 0)) p2.points += 2;
    }
  }

  const sorted = Array.from(stats.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.leg_diff !== a.leg_diff) return b.leg_diff - a.leg_diff;
    if (b.legs_won !== a.legs_won) return b.legs_won - a.legs_won;
    if (a.legs_lost !== b.legs_lost) return a.legs_lost - b.legs_lost;
    return b.one80s - a.one80s;
  });

  return sorted.map((s, i) => ({
    playerId: s.player_id,
    rank: i + 1,
  }));
}

async function storeSnapshot(
  supabase: ReturnType<typeof createAdminClient>,
  tournamentId: number,
  ranked: RankedPlayer[],
): Promise<void> {
  // Delete existing snapshot.
  await supabase
    .from("tournament_standings_snapshot")
    .delete()
    .eq("tournament_id", tournamentId);

  const rows = ranked.map((r) => ({
    tournament_id: tournamentId,
    player_id: r.playerId,
    rank: r.rank,
    points: 0,
    leg_diff: 0,
    legs_won: 0,
    legs_lost: 0,
    one80s: 0,
  }));

  await supabase.from("tournament_standings_snapshot").insert(rows);
}
