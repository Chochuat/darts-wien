import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const tournamentId = Number(id);
  if (Number.isNaN(tournamentId)) {
    return NextResponse.json({ error: "Invalid tournament ID" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: pendingMatches } = await supabase
    .from("matches")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("status", "pending");

  if (pendingMatches && pendingMatches.length > 0) {
    return NextResponse.json(
      { error: `${pendingMatches.length} match(es) still pending` },
      { status: 409 },
    );
  }

  const { data: finalMatch } = await supabase
    .from("matches")
    .select("player1_id, player2_id, legs_player1, legs_player2")
    .eq("tournament_id", tournamentId)
    .eq("match_type", "tournament_playoff")
    .eq("tournament_round_name", "Final")
    .single();

  let winnerPlayerId: number | null = null;
  if (finalMatch) {
    winnerPlayerId =
      finalMatch.legs_player1 > finalMatch.legs_player2
        ? finalMatch.player1_id
        : finalMatch.player2_id;
  }

  const { error } = await supabase
    .from("tournaments")
    .update({
      status: "completed",
      winner_player_id: winnerPlayerId,
    })
    .eq("id", tournamentId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, winnerPlayerId });
}
