import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  requireAdmin,
  isAuthError,
  errorResponse,
  validationError,
} from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { nonEmptyName } from "@/lib/validation";

const PlayerCreateBody = z.object({ name: nonEmptyName });

/**
 * Handles POST requests to create a new player (admin only).
 *
 * @param req - The incoming request.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = PlayerCreateBody.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("players")
    .insert({ name: parsed.data.name })
    .select("id, name, slug")
    .single();

  if (error) return errorResponse(error);

  return NextResponse.json(data, { status: 201 });
}
