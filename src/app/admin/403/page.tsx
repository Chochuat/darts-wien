"use client";

import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

/**
 * 403 Forbidden page. Shown when an authenticated user's role is not
 * `admin` or `scorekeeper`. Signs out and offers a return to login.
 */
const ForbiddenPage = () => {
  const router = useRouter();
  const supabase = createClient();

  const handleBackToLogin = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%" }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="h4" component="h1">
              403
            </Typography>
            <Typography variant="h6">
              Access denied
            </Typography>
            <Typography color="text.secondary" sx={{ textAlign: "center" }} variant="body2">
              Your account does not have permission to access the admin area.
              If you believe this is an error, contact an administrator.
            </Typography>
            <Button onClick={handleBackToLogin} type="button" variant="contained">
              Back to login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForbiddenPage;
