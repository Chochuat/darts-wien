import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/api-utils";
import { SignupBody } from "@/lib/validation";

/**
 * Handles POST requests to sign up a new user. Creates the auth user and a
 * `profiles` row with role 'pending'. The profile row is inserted via the
 * client (RLS allows self-insert with role 'pending').
 *
 * @param req - The incoming request.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = SignupBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const supabase = await getSupabase();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const userId = data.user?.id;
  if (!userId) {
    return NextResponse.json(
      { error: "Signup succeeded but no user ID returned" },
      { status: 500 },
    );
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    user_id: userId,
    role: "pending",
    display_name: parsed.data.displayName ?? null,
  });

  if (profileError) {
    return NextResponse.json(
      { error: "Auth user created but profile insertion failed", details: profileError.message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { user: { id: userId, email: parsed.data.email } },
    { status: 201 },
  );
}
