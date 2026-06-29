import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/api-utils";
import type { PlayerMatchPerspective } from "@/lib/validation";

/**
 * Handles GET requests for a player's matches.
 *
 * @param _req - The incoming request.
 * @param context - Route context.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const supabase = await getSupabase();

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  if (playerError || !player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const { data: season } = await supabase
    .from("seasons")
    .select("id")
    .eq("is_active", true)
    .single();

  if (!season) {
    return NextResponse.json({ error: "No active season" }, { status: 404 });
  }

  const { data: matches } = await supabase
    .from("matches")
    .select(
      "id, player1_id, player2_id, legs_player1, legs_player2, player1_180, player2_180, match_type, match_date, tournament_id, tournament_group_id, tournament_round_name, sort_order",
    )
    .eq("season_id", season.id)
    .eq("status", "completed")
    .or(`player1_id.eq.${player.id},player2_id.eq.${player.id}`)
    .order("match_date", { ascending: false });

  const opponentIds = new Set<number>();
  const tournamentIds = new Set<number>();
  const groupIds = new Set<number>();
  for (const m of matches ?? []) {
    opponentIds.add(m.player1_id);
    opponentIds.add(m.player2_id);
    if (m.tournament_id) tournamentIds.add(m.tournament_id);
    if (m.tournament_group_id) groupIds.add(m.tournament_group_id);
  }

  const [opponentsRes, tournamentsRes, groupsRes] = await Promise.all([
    supabase
      .from("players")
      .select("id, name, slug")
      .in("id", opponentIds.size ? [...opponentIds] : [0]),
    supabase
      .from("tournaments")
      .select("id, week_number, type")
      .in("id", tournamentIds.size ? [...tournamentIds] : [0]),
    supabase
      .from("tournament_groups")
      .select("id, label")
      .in("id", groupIds.size ? [...groupIds] : [0]),
  ]);

  const opponentMap = new Map(
    (opponentsRes.data ?? []).map((p) => [p.id, { name: p.name, slug: p.slug }]),
  );

  const tournamentMap = new Map(
    (tournamentsRes.data ?? []).map((t) => [
      t.id,
      { weekNumber: t.week_number, type: t.type },
    ]),
  );

  const groupMap = new Map((groupsRes.data ?? []).map((g) => [g.id, g.label]));

  const perspectives: PlayerMatchPerspective[] = (matches ?? []).map((m) => {
    const isPlayer1 = m.player1_id === player.id;
    const opponentId = isPlayer1 ? m.player2_id : m.player1_id;
    const opponent = opponentMap.get(opponentId);
    const legsFor = isPlayer1 ? m.legs_player1 : m.legs_player2;
    const legsAgainst = isPlayer1 ? m.legs_player2 : m.legs_player1;
    const won = legsFor > legsAgainst;
    const player180 = isPlayer1 ? m.player1_180 : m.player2_180;
    const t = m.tournament_id ? tournamentMap.get(m.tournament_id) : undefined;

    return {
      id: m.id,
      opponentName: opponent?.name ?? "Unknown",
      opponentSlug: opponent?.slug ?? "unknown",
      score: `${legsFor}-${legsAgainst}`,
      result: won ? "W" : "L",
      date: m.match_date,
      one80: player180,
      matchType: m.match_type,
      tournamentWeek: t?.weekNumber,
      tournamentType: t?.type,
      roundName: m.tournament_round_name,
      groupLabel: m.tournament_group_id
        ? groupMap.get(m.tournament_group_id)
        : undefined,
    };
  });

  return NextResponse.json(perspectives);
}
