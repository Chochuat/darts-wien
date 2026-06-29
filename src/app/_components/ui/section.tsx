import Box from "@mui/material/Box";
import { colors, borderRadius } from "@/lib/design-tokens";


/**
 * Generic section wrapper.
 *
 * @param props - Component properties.
 */
const Section = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        bgcolor: colors.surface,
        borderRadius: { xs: borderRadius.sm, md: borderRadius.xl },
        px: { xs: 1.5, sm: 2.5 },
        py: { xs: 2, sm: 3 },
        maxWidth: { xs: 560, md: 920, lg: "none" },
        mx: "auto",
      }}
    >
      {children}
    </Box>
  );
}

export default Section;
