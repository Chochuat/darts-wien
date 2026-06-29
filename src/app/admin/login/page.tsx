"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { createClient } from "@/lib/supabase/client";

/**
 * Login form component. Uses useSearchParams for the `next` redirect.
 */
const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    const next = searchParams.get("next") ?? "/admin";
    router.push(next);
    router.refresh();
  };

  return (
    <Card sx={{ maxWidth: 400, width: "100%" }}>
      <CardContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Typography variant="h5" component="h1" gutterBottom>
            Admin Login
          </Typography>
          {error ? (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          ) : null}
          <TextField
            autoComplete="email"
            fullWidth
            label="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            value={email}
          />
          <TextField
            autoComplete="current-password"
            fullWidth
            label="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            value={password}
          />
          <Button
            disabled={loading}
            fullWidth
            type="submit"
            variant="contained"
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Link href="/admin/forgot-password" variant="body2">
              Forgot password?
            </Link>
            <Link href="/admin/signup" variant="body2">
              Sign up
            </Link>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * Admin login page. Email + password via Supabase Auth.
 * Redirects to `?next=` param or `/admin` on success.
 */
const LoginPage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </Box>
  );
};

export default LoginPage;
