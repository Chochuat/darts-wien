import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/api-utils";

/** Handles POST requests to sign out the current user. */
export async function POST() {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
