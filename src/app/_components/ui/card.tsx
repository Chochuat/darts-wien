"use client";

import Box from "@mui/material/Box";
import { colors, borderRadius } from "@/lib/design-tokens";

interface CardProps {
  children: React.ReactNode;
  borderColor: string;
  hoverBorderColor?: string;
}

export default function Card({ children, borderColor, hoverBorderColor }: CardProps) {
  return (
    <Box
      sx={{
        bgcolor: colors.card,
        borderRadius: borderRadius.sm,
        overflow: "hidden",
        border: "1px solid",
        borderColor,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "box-shadow 0.2s, border-color 0.2s",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          ...(hoverBorderColor ? { borderColor: hoverBorderColor } : {}),
        },
      }}
    >
      {children}
    </Box>
  );
}
