"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

/**
 * Close tournament confirmation page. Admin only.
 */
const CloseTournamentPage = () => {
  const params = useParams();
  const router = useRouter();
  const tournamentId = Number(params.id);

  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = async () => {
    setClosing(true);
    setError(null);

    const res = await fetch(`/api/admin/tournaments/${tournamentId}/close`, {
      method: "POST",
    });

    setClosing(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed" }));
      setError(err.error ?? "Failed to close tournament");
      return;
    }

    router.push(`/admin/tournaments/${tournamentId}`);
    router.refresh();
  };

  return (
    <Box sx={{ maxWidth: 450 }}>
      <Button onClick={() => router.push(`/admin/tournaments/${tournamentId}`)} size="small" startIcon={<ArrowBackIcon />} sx={{ color: "rgba(255,255,255,0.5)", mb: 2, textTransform: "none" }} type="button">
        Back to Tournament
      </Button>

      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem", mb: 2 }}>
        Close Tournament
      </Typography>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Alert severity="warning" sx={{ mb: 3 }}>
        Closing the tournament will permanently freeze all match results.
        This action cannot be undone.
      </Alert>

      <Button
        color="error"
        disabled={closing}
        onClick={handleClose}
        type="button"
        variant="contained"
      >
        {closing ? "Closing…" : "Close Tournament"}
      </Button>
    </Box>
  );
};

export default CloseTournamentPage;
