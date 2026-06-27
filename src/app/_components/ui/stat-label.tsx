"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { colors } from "@/lib/design-tokens";

interface StatLabelProps {
  label: string;
  value: string | number;
  labelColor?: string;
}

export default function StatLabel({ label, value, labelColor }: StatLabelProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
      <Typography
        sx={{
          color: labelColor ?? colors.text.muted,
          fontSize: "0.5rem",
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ color: colors.text.secondary, fontSize: "0.7rem", fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}
