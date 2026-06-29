import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/signup",
  "/admin/forgot-password",
  "/admin/reset-password",
  "/admin/auth/callback",
  "/admin/403",
];

/**
 * Proxy that gates `/admin/*` routes. Unauthenticated users are
 * redirected to `/admin/login`. Authenticated users without a valid role
 * (`admin` or `scorekeeper`) are redirected to `/admin/403`.
 *
 * @param req - The incoming request.
 * @returns A redirect response or `NextResponse.next()`.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only gate /admin/* routes.
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow public admin paths.
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          req.cookies.set({ name, value, ...options }),
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check profile role.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "admin" && profile.role !== "scorekeeper")) {
    const forbiddenUrl = new URL("/admin/403", req.url);
    return NextResponse.redirect(forbiddenUrl);
  }

  return NextResponse.next();
}

export
/**
 * Next.js proxy config: match all /admin/* routes.
 */
const config = {
  matcher: ["/admin/:path*"],
};
