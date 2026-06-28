import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getSupabase, errorResponse, validationError } from "@/lib/api-utils";
import { MatchNoShowUpdate } from "@/lib/validation";

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
  const parsed = MatchNoShowUpdate.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);

  const supabase = await getSupabase();

  const { data: match, error: findError } = await supabase
    .from("matches")
    .select("id, legs_target, player1_id, player2_id, status")
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

  const noShowPlayerId = parsed.data.no_show_player_id;
  const isPlayer1NoShow = noShowPlayerId === match.player1_id;
  const isPlayer2NoShow = noShowPlayerId === match.player2_id;

  if (!isPlayer1NoShow && !isPlayer2NoShow) {
    return NextResponse.json(
      { error: "no_show_player_id must be one of the match participants" },
      { status: 400 },
    );
  }

  const winnerLegs = match.legs_target;
  const loserLegs = 0;

  const { data, error } = await supabase
    .from("matches")
    .update({
      status: "no_show",
      legs_player1: isPlayer1NoShow ? loserLegs : winnerLegs,
      legs_player2: isPlayer2NoShow ? loserLegs : winnerLegs,
      no_show_player_id: noShowPlayerId,
    })
    .eq("id", matchId)
    .select()
    .single();

  if (error) return errorResponse(error);

  return NextResponse.json(data);
}
