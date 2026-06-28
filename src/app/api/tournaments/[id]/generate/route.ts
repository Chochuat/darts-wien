import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getSupabase, errorResponse } from "@/lib/api-utils";

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
  const { generationType } = body;

  if (!generationType) {
    return NextResponse.json(
      { error: "generationType is required" },
      { status: 400 },
    );
  }

  const supabase = await getSupabase();

  const { error } = await supabase
    .from("tournaments")
    .update({
      status: "ready",
      generation_type: generationType,
    })
    .eq("id", tournamentId);

  if (error) return errorResponse(error);

  return NextResponse.json({ success: true });
}
