"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { createClient } from "@/lib/supabase/client";

/**
 * Auth callback page. Handles password-reset and email-confirmation
 * redirects from Supabase Auth. Exchanges the code for a session and
 * redirects to `/admin` or the login page.
 */
const AuthCallbackPage = () => {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href,
      );
      if (error) {
        router.push("/admin/login?error=callback");
        return;
      }
      router.push("/admin");
      router.refresh();
    };
    void handleCallback();
  }, [router, supabase]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Completing sign in…
      </Typography>
    </Box>
  );
};

export default AuthCallbackPage;
