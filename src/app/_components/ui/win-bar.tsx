"use client";

import Box from "@mui/material/Box";

interface WinBarProps {
  wins: number;
  played: number;
  color: string;
}


/**
 * Win percentage bar visualization.
 *
 * @param props - Component properties.
 */
const WinBar = (props: WinBarProps) => {
  const pct = props.played > 0 ? (props.wins / props.played) * 100 : 0;

  return (
    <Box sx={{ height: 2.5, bgcolor: "#f4f4f5" }}>
      <Box
        sx={{
          height: "100%",
          width: `${pct}%`,
          bgcolor: props.color,
          transition: "width 0.3s",
        }}
      />
    </Box>
  );
}

export default WinBar;
