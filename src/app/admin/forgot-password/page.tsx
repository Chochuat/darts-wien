"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import Email from "@mui/icons-material/Email";
import TrackChanges from "@mui/icons-material/TrackChanges";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { useTranslation } from "react-i18next";
import { createClient } from "@/lib/supabase/client";
import { colors } from "@/lib/design-tokens";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["700", "900"] });

const ERROR_MESSAGES: Record<string, string> = {
  "Email not confirmed": "admin.emailNotConfirmed",
  "Rate limit exceeded": "admin.rateLimitExceeded",
};

const getErrorMessageKey = (raw: string): string =>
  Object.entries(ERROR_MESSAGES).find(([key]) => raw.includes(key))?.[1] ?? "admin.unexpectedError";

/**
 * Forgot password page. Sends a reset email via Supabase Auth.
 */
const ForgotPasswordForm = () => {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const supabase = createClient();

  const lang = searchParams.get("lang");
  const linkHref = (path: string) => (lang ? `${path}?lang=${lang}` : path);

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      },
    );

    setLoading(false);

    if (resetError) {
      setError(t(getErrorMessageKey(resetError.message)));
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: colors.background,
          p: 2,
        }}
      >
        <Card
          sx={{
            maxWidth: 400,
            width: "100%",
            bgcolor: "#0a0a0a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <TrackChanges sx={{ color: colors.accent, fontSize: "1.5rem" }} />
              <Typography
                className={orbitron.className}
                sx={{
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: "0.85rem",
                  letterSpacing: 5,
                  textTransform: "uppercase",
                }}
              >
                darts wien
              </Typography>
              <Typography
                sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: "0.95rem", mt: 0.5 }}
                variant="h6"
              >
                {t("admin.checkYourEmail")}
              </Typography>
              <Typography
                sx={{ color: "rgba(255,255,255,0.4)", textAlign: "center", fontSize: "0.85rem", lineHeight: 1.5 }}
              >
                {t("admin.resetSent", { email })}
              </Typography>
              <Link
                href={linkHref("/admin/login")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                  mt: 1.5,
                  py: 0.75,
                  px: 2,
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "0.78rem",
                  textDecoration: "none",
                  borderRadius: 1,
                  width: "100%",
                  transition: "all 0.15s",
                  "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.05)" },
                }}
              >
                <ArrowBack sx={{ fontSize: "0.85rem" }} />
                {t("admin.backToLogin")}
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: colors.background,
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: "100%",
          bgcolor: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            {/* Branding */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, mb: 1 }}>
              <TrackChanges sx={{ color: colors.accent, fontSize: "1.5rem" }} />
              <Typography
                className={orbitron.className}
                sx={{
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: "0.85rem",
                  letterSpacing: 5,
                  textTransform: "uppercase",
                }}
              >
                darts wien
              </Typography>
              <Typography
                sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: "0.95rem", mt: 0.5 }}
                variant="h6"
              >
                {t("admin.forgotPasswordTitle")}
              </Typography>
            </Box>

            {error ? (
              <Alert severity="error" sx={{ borderRadius: 1, py: 0 }}>
                {error}
              </Alert>
            ) : null}

            <TextField
              autoComplete="email"
              fullWidth
              label={t("admin.email")}
              onChange={(e) => setEmail(e.target.value)}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.3)" }} />
                    </InputAdornment>
                  ),
                },
              }}
              type="email"
              value={email}
            />
            <Button
              disabled={loading}
              fullWidth
              size="large"
              sx={{
                bgcolor: colors.accent,
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: 2,
                textTransform: "uppercase",
                py: 1.5,
                "&:hover": { bgcolor: "#6a4ae0" },
              }}
              type="submit"
              variant="contained"
            >
              {loading ? t("admin.sending") : t("admin.sendResetLink")}
            </Button>
            <Box
              sx={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                pt: 1.5,
                mt: 1,
              }}
            >
              <Link
                href={linkHref("/admin/login")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                  py: 0.75,
                  px: 2,
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "0.78rem",
                  textDecoration: "none",
                  borderRadius: 1,
                  width: "100%",
                  transition: "all 0.15s",
                  "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.05)" },
                }}
              >
                <ArrowBack sx={{ fontSize: "0.85rem" }} />
                {t("admin.backToLogin")}
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

/**
 * Forgot password page wrapper.
 */
const ForgotPasswordPage = () => {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
};

export default ForgotPasswordPage;
