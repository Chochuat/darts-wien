"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { colors } from "@/lib/design-tokens";

const darkField = {
  "& .MuiInputBase-root": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
};

/**
 * Create new player page. Admin only.
 */
const NewPlayerPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/players/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed" }));
      setError(err.error ?? "Failed to create player");
      return;
    }

    router.push("/admin/players");
    router.refresh();
  };

  return (
    <Box sx={{ maxWidth: 400 }}>
      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem", mb: 3 }}>
        Add Player
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {error ? <Typography sx={{ color: colors.red }} variant="body2">{error}</Typography> : null}
        <TextField
          fullWidth
          label="Player Name"
          onChange={(e) => setName(e.target.value)}
          required
          sx={darkField}
          value={name}
        />
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button disabled={loading} type="submit" variant="contained">
            {loading ? "Creating…" : "Create"}
          </Button>
          <Button onClick={() => router.back()} type="button" variant="outlined">
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default NewPlayerPage;
