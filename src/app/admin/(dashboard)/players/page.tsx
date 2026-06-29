"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import AddIcon from "@mui/icons-material/Add";
import { createClient } from "@/lib/supabase/client";

interface Player { id: number; name: string; slug: string; }

/**
 * Admin players list page. Admin only.
 */
const PlayersPage = () => {
  const router = useRouter();
  const supabase = createClient();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/admin/login"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!profile || profile.role !== "admin") { router.push("/admin/403"); return; }
      setSession(profile.role);
    };
    void checkSession();
  }, [router, supabase]);

  const fetchPlayers = useCallback(async () => {
    const { data, error } = await supabase
      .from("players")
      .select("id, name, slug")
      .order("name");
    if (!error) setPlayers((data ?? []) as Player[]);
    setLoading(false);
  }, [supabase]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (session) void fetchPlayers(); }, [session, fetchPlayers]);

  if (loading || !session) return <Typography sx={{ color: "#fff" }}>Loading…</Typography>;

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem" }}>
          Players
        </Typography>
        <Link href="/admin/players/new">
          <Button startIcon={<AddIcon />} type="button" variant="contained">Add Player</Button>
        </Link>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {players.map((p) => (
          <Link href={`/admin/players/${p.id}`} key={p.id} style={{ textDecoration: "none" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2,
                py: 1.5,
                borderRadius: 1,
                bgcolor: "rgba(255,255,255,0.03)",
                cursor: "pointer",
                "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
              }}
            >
              <Typography sx={{ color: "#fff", fontSize: "0.9rem" }}>{p.name}</Typography>
            </Box>
          </Link>
        ))}
      </Box>
    </Box>
  );
};

export default PlayersPage;
