"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { colors } from "@/lib/design-tokens";
import { createClient } from "@/lib/supabase/client";

const darkField = {
  "& .MuiInputBase-root": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
};

/**
 * Edit/delete player page. Admin only.
 */
const EditPlayerPage = () => {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const playerId = Number(params.id);

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayer = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("players")
      .select("name")
      .eq("id", playerId)
      .single();

    if (err || !data) {
      setError("Player not found");
      setLoading(false);
      return;
    }
    setName(data.name);
    setLoading(false);
  }, [supabase, playerId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void fetchPlayer(); }, [fetchPlayer]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/admin/players/${playerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setSaving(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed" }));
      setError(err.error ?? "Failed to update player");
      return;
    }

    router.push("/admin/players");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this player? This cannot be undone.")) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/admin/players/${playerId}`, {
      method: "DELETE",
    });

    setSaving(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed" }));
      setError(err.error ?? "Failed to delete player");
      return;
    }

    router.push("/admin/players");
    router.refresh();
  };

  if (loading) return <Typography sx={{ color: "#fff" }}>Loading…</Typography>;

  return (
    <Box sx={{ maxWidth: 400 }}>
      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem", mb: 3 }}>
        Edit Player
      </Typography>

      {error ? <Typography sx={{ color: colors.red, mb: 2 }} variant="body2">{error}</Typography> : null}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          fullWidth
          label="Player Name"
          onChange={(e) => setName(e.target.value)}
          sx={darkField}
          value={name}
        />
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button disabled={saving} onClick={handleSave} type="button" variant="contained">
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button color="error" disabled={saving} onClick={handleDelete} type="button" variant="outlined">
            Delete
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EditPlayerPage;
