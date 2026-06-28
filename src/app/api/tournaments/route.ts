import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getSupabase, errorResponse } from "@/lib/api-utils";

/**
 * Handles GET requests for tournament listings.
 *
 * @param req - The incoming request.
 */
export async function GET(req: NextRequest) {
  
  const supabase = await getSupabase();

  
  const { searchParams } = new URL(req.url);
  
  const seasonId = searchParams.get("seasonId");

  
  let query = supabase
    .from("tournaments")
    .select("id, week_number, date, type, status, winner_player_id, generation_type, num_groups, season_id")
    .order("week_number");

  if (seasonId) {
    query = query.eq("season_id", Number(seasonId));
  }

  
  const { data: tournaments, error } = await query;

  if (error) return errorResponse(error);

  
  const result = await Promise.all(
    (tournaments ?? []).map(async (t) => {
      
      const { count: registrations } = await supabase
        .from("tournament_registrations")
        .select("id", { count: "exact", head: true })
        .eq("tournament_id", t.id)
        .eq("checked_in", true);

      
      const winner =
        t.winner_player_id != null
          ? await supabase
              .from("players")
              .select("id, name, slug")
              .eq("id", t.winner_player_id)
              .single()
              .then((r) => r.data)
          : null;

      return {
        id: t.id,
        weekNumber: t.week_number,
        date: t.date,
        type: t.type,
        status: t.status,
        winner: winner ?? null,
        generationType: t.generation_type,
        playerCount: registrations ?? 0,
        groupMatchCount: 0,
        playoffMatchCount: 0,
        total180s: 0,
      };
    }),
  );

  return NextResponse.json({ tournaments: result });
}

/**
 * Handles POST requests to create a new tournament.
 *
 * @param req - The incoming request.
 */
export async function POST(req: NextRequest) {
  
  const supabase = await getSupabase();

  
  const body = await req.json();
  
  const { seasonId, weekNumber, date, type, numGroups } = body;

  if (!seasonId || !weekNumber || !date) {
    return NextResponse.json(
      { error: "Missing required fields: seasonId, weekNumber, date" },
      { status: 400 },
    );
  }

  
  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      season_id: seasonId,
      week_number: weekNumber,
      date,
      type: type ?? "regular",
      num_groups: type === "grand_final" ? null : (numGroups ?? null),
    })
    .select()
    .single();

  if (error) return errorResponse(error);

  return NextResponse.json(data, { status: 201 });
}
