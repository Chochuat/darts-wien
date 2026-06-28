import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; playerId: string }> },
) {
  const { id, playerId } = await params;
  const tournamentId = Number(id);
  const playerIdNum = Number(playerId);

  if (Number.isNaN(tournamentId) || Number.isNaN(playerIdNum)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; playerId: string }> },
) {
  const { id, playerId } = await params;
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

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("tournament_registrations")
    .update({ checked_in: checkedIn })
    .eq("tournament_id", tournamentId)
    .eq("player_id", playerIdNum)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
