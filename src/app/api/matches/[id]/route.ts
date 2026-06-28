import { NextRequest, NextResponse } from "next/server";
import { getSupabase, errorResponse, validationError } from "@/lib/api-utils";
import { MatchResultUpdate } from "@/lib/validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const matchId = Number(id);
  if (Number.isNaN(matchId)) {
    return NextResponse.json({ error: "Invalid match ID" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = MatchResultUpdate.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);

  const supabase = await getSupabase();

  const { data: match, error: findError } = await supabase
    .from("matches")
    .select("id, tournament_id, season_id, match_type, status")
    .eq("id", matchId)
    .single();

  if (findError || !match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (match.status !== "pending") {
    return NextResponse.json(
      { error: "Match is not in pending status" },
      { status: 409 },
    );
  }

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

  return NextResponse.json(data);
}
