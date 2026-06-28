"use client";

import Box from "@mui/material/Box";

interface WinBarProps {
  wins: number;
  played: number;
  color: string;
}


/**
 * Win percentage progress bar.
 * @param root0
 * @param root0.wins
 * @param root0.played
 * @param root0.color
 */
const WinBar = ({ wins, played, color }: WinBarProps) => {
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

export default WinBar;
