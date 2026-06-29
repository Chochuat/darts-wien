import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/api-utils";
import { LoginBody } from "@/lib/validation";

/**
 * Handles POST requests to sign in a user with email and password.
 *
 * @param req - The incoming request.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = LoginBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const supabase = await getSupabase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 },
    );
  }

  return NextResponse.json({ user: { id: data.user.id, email: data.user.email } });
}
