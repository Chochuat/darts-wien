import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(
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

  const { data: registrations, error } = await supabase
    .from("tournament_registrations")
    .select("player_id, checked_in, created_at")
    .eq("tournament_id", tournamentId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const playerIds = registrations.map((r) => r.player_id);
  const { data: players } = await supabase
    .from("players")
    .select("id, name, slug")
    .in("id", playerIds);

  const playerMap = new Map(
    (players ?? []).map((p) => [p.id, p]),
  );

  const entries = registrations.map((r) => ({
    player: playerMap.get(r.player_id) ?? { id: r.player_id, name: "Unknown", slug: "unknown" },
    checkedIn: r.checked_in,
    createdAt: r.created_at,
  }));

  return NextResponse.json({ registrations: entries });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const tournamentId = Number(id);
  if (Number.isNaN(tournamentId)) {
    return NextResponse.json({ error: "Invalid tournament ID" }, { status: 400 });
  }

  const body = await req.json();
  const { playerId } = body;

  if (!playerId) {
    return NextResponse.json({ error: "playerId is required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("tournament_registrations")
    .insert({ tournament_id: tournamentId, player_id: playerId })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
