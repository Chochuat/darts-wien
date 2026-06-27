"use client";

import Box from "@mui/material/Box";
import { colors, borderRadius } from "@/lib/design-tokens";

export default function Section({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: colors.surface,
        borderRadius: borderRadius.xl,
        px: { xs: 1.5, sm: 2.5 },
        py: { xs: 2, sm: 3 },
        maxWidth: { xs: 560, md: 920 },
        mx: "auto",
      }}
    >
      {children}
    </Box>
  );
}
