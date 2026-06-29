"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
 * Admin signup page. Creates an auth user with a 'pending' profile.
 * An admin must promote the user before they can access the admin area.
 */
const SignupPage = () => {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError("Signup succeeded but no user ID returned");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: userId,
      role: "pending",
      display_name: displayName || null,
    });

    setLoading(false);

    if (profileError) {
      setError("Account created but profile setup failed. Contact an admin.");
      return;
    }

    setSuccess(true);
  };

  if (success) {
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
              <Typography variant="h5" component="h1">
                Account created
              </Typography>
              <Typography color="text.secondary" sx={{ textAlign: "center" }} variant="body2">
                Your account is pending approval. An administrator must promote
                you before you can log in.
              </Typography>
              <Button
                onClick={() => router.push("/admin/login")}
                variant="contained"
              >
                Back to login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Typography variant="h5" component="h1" gutterBottom>
              Sign up
            </Typography>
            {error ? (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            ) : null}
            <TextField
              fullWidth
              label="Display name (optional)"
              onChange={(e) => setDisplayName(e.target.value)}
              value={displayName}
            />
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
              autoComplete="new-password"
              fullWidth
              label="Password (min 8 chars)"
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
              {loading ? "Creating account…" : "Sign up"}
            </Button>
            <Link href="/admin/login" variant="body2">
              Already have an account? Log in
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SignupPage;
