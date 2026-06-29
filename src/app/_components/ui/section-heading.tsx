import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { colors } from "@/lib/design-tokens";

interface SectionHeadingProps {
  icon: React.ReactNode;
  label: string;
}


/**
 * Section heading with icon and label.
 *
 * @param props - Component properties.
 */
const SectionHeading = (props: SectionHeadingProps) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 2 }}>
      <Box sx={{ color: colors.accent, fontSize: "1.1rem", display: "flex" }}>
        {props.icon}
      </Box>
      <Typography sx={{ color: colors.text.primary, fontWeight: 700, fontSize: "0.95rem", letterSpacing: 1 }}>
        {props.label}
      </Typography>
    </Box>
  );
}

export default SectionHeading;
