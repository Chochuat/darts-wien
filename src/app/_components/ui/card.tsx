"use client";

import Box from "@mui/material/Box";
import { borderRadius } from "@/lib/design-tokens";

interface CardProps {
  children: React.ReactNode;
  borderColor: string;
}

export default function Card({ children, borderColor }: CardProps) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: borderRadius.sm,
        overflow: "hidden",
        border: "1px solid",
        borderColor,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "box-shadow 0.2s",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        },
      }}
    >
      {children}
    </Box>
  );
}
