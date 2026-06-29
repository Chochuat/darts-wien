import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabase, errorResponse, validationError } from "@/lib/api-utils";
import { TournamentListQuery, TournamentCreateBody } from "@/lib/validation";

/**
 * Handles GET requests for tournament listings.
 *
 * @param req - The incoming request.
 */
export async function GET(req: NextRequest) {
  const supabase = await getSupabase();

  const { searchParams } = new URL(req.url);
  const parsed = TournamentListQuery.safeParse(
    Object.fromEntries(searchParams),
  );
  if (!parsed.success) return validationError(parsed.error.issues);
  const params = parsed.data;

  let query = supabase
    .from("tournaments")
    .select(
      "id, week_number, date, type, status, winner_player_id, generation_type, num_groups, season_id",
    )
    .order("week_number");

  if (params.seasonId) {
    query = query.eq("season_id", params.seasonId);
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

      const { count: groupMatchCount } = await supabase
        .from("matches")
        .select("id", { count: "exact", head: true })
        .eq("tournament_id", t.id)
        .eq("match_type", "tournament_group");

      const { count: playoffMatchCount } = await supabase
        .from("matches")
        .select("id", { count: "exact", head: true })
        .eq("tournament_id", t.id)
        .eq("match_type", "tournament_playoff");

      const { data: one80Rows } = await supabase
        .from("matches")
        .select("player1_180, player2_180")
        .eq("tournament_id", t.id);

      const total180s = (one80Rows ?? []).reduce(
        (sum, m) => sum + (m.player1_180 ?? 0) + (m.player2_180 ?? 0),
        0,
      );

      return {
        id: t.id,
        weekNumber: t.week_number,
        date: t.date,
        type: t.type,
        status: t.status,
        winner: winner ?? null,
        generationType: t.generation_type,
        playerCount: registrations ?? 0,
        groupMatchCount: groupMatchCount ?? 0,
        playoffMatchCount: playoffMatchCount ?? 0,
        total180s,
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
  const parsed = TournamentCreateBody.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);
  const b = parsed.data;

  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      season_id: b.seasonId,
      week_number: b.weekNumber,
      date: b.date,
      type: b.type,
      num_groups: b.type === "grand_final" ? null : (b.numGroups ?? null),
    })
    .select()
    .single();

  if (error) return errorResponse(error);

  return NextResponse.json(data, { status: 201 });
}
