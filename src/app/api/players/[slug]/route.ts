import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/api-utils";

/**
 * Handles GET requests for a player's details (stats + matches).
 *
 * @param _req - The incoming request.
 */
export async function GET(
  _req: NextRequest,
  { params }: { 
  params: Promise<{ 
  slug: string }> },
) {
  
  const { slug } = await params;
  
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

  
  const { data: matches, error: matchError } = await supabase
    .from("matches")
    .select(
      "id, player1_id, player2_id, legs_player1, legs_player2, player1_180, player2_180, match_type, match_date, status, tournament_id, tournament_group_id, tournament_round_name, sort_order, legs_target",
    )
    .eq("season_id", season.id)
    .eq("status", "completed")
    .or(`player1_id.eq.${player.id},player2_id.eq.${player.id}`)
    .order("match_date", { ascending: false });

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  
  const allPlayerIds = new Set<number>();
  for (
  const m of matches) {
    allPlayerIds.add(m.player1_id);
    allPlayerIds.add(m.player2_id);
  }

  
  const { data: allPlayers } = await supabase
    .from("players")
    .select("id, name, slug");

  
  const playerMap = new Map(
    (allPlayers ?? []).map((p) => [p.id, { name: p.name, slug: p.slug }]),
  );

  
  let wins = 0;
  
  let losses = 0;
  
  let setsFor = 0;
  
  let setsAgainst = 0;
  
  let one80s = 0;
  
  const form: ("W" | "L")[] = [];

  
  const matchPerspectives = matches.map((m) => {
    
    const isPlayer1 = m.player1_id === player.id;
    
    const opponentId = isPlayer1 ? m.player2_id : m.player1_id;
    
    const opponent = playerMap.get(opponentId);
    
    const legsFor = isPlayer1 ? m.legs_player1 : m.legs_player2;
    
    const legsAgainst = isPlayer1 ? m.legs_player2 : m.legs_player1;
    
    const won = legsFor > legsAgainst;
    
    const player180 = isPlayer1 ? m.player1_180 : m.player2_180;

    wins += won ? 1 : 0;
    losses += won ? 0 : 1;
    setsFor += legsFor;
    setsAgainst += legsAgainst;
    one80s += player180;
    form.push(won ? "W" : "L");

    return {
      id: m.id,
      opponentName: opponent?.name ?? "Unknown",
      opponentSlug: opponent?.slug ?? "unknown",
      score: `${legsFor}-${legsAgainst}`,
      result: won ? ("W" as const) : ("L" as const),
      date: m.match_date,
      one80: player180,
      matchType: m.match_type,
      tournamentWeek: undefined as number | undefined,
      tournamentType: undefined as "regular" | "grand_final" | undefined,
      roundName: m.tournament_round_name as
        | "Quarter-Finals"
        | "Semi-Finals"
        | "3rd Place"
        | "Final"
        | undefined,
      groupLabel: undefined as string | undefined,
    };
  });

  
  const recentForm = form.slice(-5);

  
  const response = {
    player: {
      id: player.id,
      name: player.name,
      slug: player.slug,
      pos: 1,
      played: matches.length,
      wins,
      losses,
      setsFor,
      setsAgainst,
      points: wins * 2,
      one80s,
      form: recentForm,
    },
    matches: matchPerspectives,
  };

  return NextResponse.json(response);
}
