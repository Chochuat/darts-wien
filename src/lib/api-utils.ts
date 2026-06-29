import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/** Creates a Supabase server client using the cookie store. */
export async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

/** A profile row joined to the current session, returned by `getSessionProfile`. */
export interface SessionProfile {
  userId: string;
  role: "pending" | "scorekeeper" | "admin";
  playerId: number | null;
  displayName: string | null;
}

/**
 * Reads the current Supabase session and the caller's `profiles` row.
 *
 * @returns The session + profile, or `null` if there is no session or no profile row.
 */
export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, role, player_id, display_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) return null;
  return {
    userId: profile.user_id as string,
    role: profile.role as SessionProfile["role"],
    playerId: (profile.player_id as number | null) ?? null,
    displayName: (profile.display_name as string | null) ?? null,
  };
}

/**
 * Requires the caller to be authenticated with role `admin`.
 *
 * @returns The session profile on success, or a 401/403 NextResponse on failure.
 */
export async function requireAdmin(): Promise<SessionProfile | NextResponse> {
  const session = await getSessionProfile();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: admin role required" }, { status: 403 });
  }
  return session;
}

/**
 * Requires the caller to be authenticated with role `admin` or `scorekeeper`.
 *
 * @returns The session profile on success, or a 401/403 NextResponse on failure.
 */
export async function requireAdminOrScorekeeper(): Promise<SessionProfile | NextResponse> {
  const session = await getSessionProfile();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "admin" && session.role !== "scorekeeper") {
    return NextResponse.json({ error: "Forbidden: admin or scorekeeper role required" }, { status: 403 });
  }
  return session;
}

/**
 * Type guard: was the result of a `require*` guard a NextResponse (error)?
 *
 * @param result - The value returned by a `require*` guard.
 */
export function isAuthError(result: SessionProfile | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}

/**
 * Parses a string into a number, returning null if invalid.
 *
 * @param value - The string to parse.
 */
export function parseNumericParam(value: string): number | null {
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

/**
 * Parses a numeric query param, returning an error response if invalid.
 *
 * @param value - The string value to parse.
 * @param label - Human-readable name for error messages.
 */
export function requireNumericParam(
  value: string,
  label: string,
): { id: number } | NextResponse {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return NextResponse.json(
      { error: `Invalid ${label}` },
      { status: 400 },
    ) as NextResponse;
  }
  return { id: num };
}

/**
 * Creates a JSON error response from an unknown error value.
 *
 * @param error - The error to convert.
 * @param status - The HTTP status code (default 500).
 */
export function errorResponse(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ error: message }, { status });
}

/**
 * Creates a 400 validation error response with the given issues.
 *
 * @param issues - The validation issues to return.
 */
export function validationError(issues: unknown) {
  return NextResponse.json(
    { error: "Validation failed", details: issues },
    { status: 400 },
  );
}
