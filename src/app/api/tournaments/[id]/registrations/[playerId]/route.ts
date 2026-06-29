import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getSupabase, errorResponse } from "@/lib/api-utils";

/**
 * Handles DELETE requests to remove a tournament registration.
 *
 * @param _req - The incoming request.
 * @param context - Route context.
 */
export async function DELETE(
  _req: NextRequest,
  context: { 
  params: Promise<{ 
  id: string; 
  playerId: string }> },
) {
  
  const { id, playerId } = await context.params;
  
  const tournamentId = Number(id);
  
  const playerIdNum = Number(playerId);

  if (Number.isNaN(tournamentId) || Number.isNaN(playerIdNum)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  
  const supabase = await getSupabase();

  
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("status")
    .eq("id", tournamentId)
    .single();

  if (tournament && tournament.status !== "registration") {
    return NextResponse.json(
      { error: "Can only remove registrations during registration phase" },
      { status: 409 },
    );
  }

  
  const { error } = await supabase
    .from("tournament_registrations")
    .delete()
    .eq("tournament_id", tournamentId)
    .eq("player_id", playerIdNum);

  if (error) return errorResponse(error);

  return new NextResponse(null, { status: 204 });
}

/**
 * Handles PATCH requests to update a player's check-in status.
 *
 * @param req - The incoming request.
 * @param context - Route context.
 */
export async function PATCH(
  req: NextRequest,
  context: { 
  params: Promise<{ 
  id: string; 
  playerId: string }> },
) {
  
  const { id, playerId } = await context.params;
  
  const tournamentId = Number(id);
  
  const playerIdNum = Number(playerId);

  if (Number.isNaN(tournamentId) || Number.isNaN(playerIdNum)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  
  const body = await req.json();
  
  const { checkedIn } = body;

  if (typeof checkedIn !== "boolean") {
    return NextResponse.json(
      { error: "checkedIn must be a boolean" },
      { status: 400 },
    );
  }

  
  const supabase = await getSupabase();

  
  const { data, error } = await supabase
    .from("tournament_registrations")
    .update({ checked_in: checkedIn })
    .eq("tournament_id", tournamentId)
    .eq("player_id", playerIdNum)
    .select()
    .single();

  if (error) return errorResponse(error);

  return NextResponse.json(data);
}
