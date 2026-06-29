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
import { SeedPlayoffsBody } from "@/lib/validation";
import { getBracket, QF_SEED_PAIRINGS } from "@/lib/tournament";

/**
 * Handles POST requests to manually seed the playoff bracket after group
 * phase completion (used when tiebreakers are unresolvable).
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
  const parsed = SeedPlayoffsBody.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);

  const supabase = createAdminClient();

  const { data: tournament, error: tError } = await supabase
    .from("tournaments")
    .select("id, season_id, status, type, date")
    .eq("id", tournamentId)
    .single();

  if (tError || !tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  if (tournament.status !== "in_progress") {
    return NextResponse.json(
      { error: "Tournament must be in_progress to seed playoffs" },
      { status: 409 },
    );
  }

  // Check no playoff matches exist yet.
  const { data: existingPlayoff } = await supabase
    .from("matches")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("match_type", "tournament_playoff")
    .limit(1);

  if (existingPlayoff && existingPlayoff.length > 0) {
    return NextResponse.json(
      { error: "Playoff matches already exist" },
      { status: 409 },
    );
  }

  // Check all group matches are completed.
  const { data: pendingGroup } = await supabase
    .from("matches")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("match_type", "tournament_group")
    .eq("status", "pending")
    .limit(1);

  if (pendingGroup && pendingGroup.length > 0) {
    return NextResponse.json(
      { error: "Group phase not complete (pending matches remain)" },
      { status: 409 },
    );
  }

  // Build seed → playerId map.
  const seedMap = new Map<number, number>();
  for (const adv of parsed.data.advancements) {
    seedMap.set(adv.seedPosition, adv.playerId);
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

  const DEFAULTS = {
    playoff: { legs_target: 3, starting_score: 501, max_throws: 45 },
    third_place: { legs_target: 3, starting_score: 501, max_throws: 45 },
    final: { legs_target: 3, starting_score: 501, max_throws: 45 },
  } as const;

  function getFormat(phase: string) {
    return formatMap.get(phase) ?? DEFAULTS[phase as keyof typeof DEFAULTS] ?? DEFAULTS.playoff;
  }

  const bracket = getBracket("regular");
  const matches: Array<Record<string, unknown>> = [];

  // QF matches: seeded by admin's advancements.
  for (let i = 0; i < 4; i++) {
    const [seedA, seedB] = QF_SEED_PAIRINGS[i]!;
    const fmt = getFormat("playoff");
    matches.push({
      season_id: tournament.season_id,
      player1_id: seedMap.get(seedA),
      player2_id: seedMap.get(seedB),
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
  const roundNames = ["Semi-Finals", "3rd Place", "Final"];
  const phaseMap: Record<string, string> = {
    "Semi-Finals": "playoff",
    "3rd Place": "third_place",
    "Final": "final",
  };

  for (let i = 4; i < bracket.totalMatches; i++) {
    const roundName = roundNames[i - 4]!;
    const phase = phaseMap[roundName] ?? "playoff";
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

  return NextResponse.json({ success: true, matchesCreated: matches.length });
}
