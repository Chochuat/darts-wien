import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Creates a Supabase server client that uses the service-role key and bypasses
 * RLS. Use this ONLY in Route Handlers / Server Actions for admin write
 * operations. Never expose this client to the browser (the key must not be
 * prefixed with NEXT_PUBLIC_).
 *
 * Authorization (is the caller an admin/scorekeeper?) is enforced separately
 * via `requireAdmin` / `requireScorekeeper` in `@/lib/api-utils`, which reads
 * the user's session from the cookie store.
 *
 * @throws if `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_URL` is not set.
 */
export function createAdminClient() {
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
