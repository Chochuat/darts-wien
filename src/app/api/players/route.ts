import { NextResponse } from "next/server";
import { getSupabase, errorResponse } from "@/lib/api-utils";

/** Handles GET requests for all players. */
export async function GET() {
  
  const supabase = await getSupabase();

  
  const { data: players, error } = await supabase
    .from("players")
    .select("id, name, slug")
    .order("name");

  if (error) return errorResponse(error);

  return NextResponse.json({ players });
}
