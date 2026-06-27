"use client";

import Box from "@mui/material/Box";

interface WinBarProps {
  wins: number;
  played: number;
  color: string;
}

export default function WinBar({ wins, played, color }: WinBarProps) {
  const pct = played > 0 ? (wins / played) * 100 : 0;

  return (
    <Box sx={{ height: 2.5, bgcolor: "#f4f4f5" }}>
      <Box
        sx={{
          height: "100%",
          width: `${pct}%`,
          bgcolor: color,
          transition: "width 0.3s",
        }}
      />
    </Box>
  );
}
