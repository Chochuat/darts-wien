import Typography from "@mui/material/Typography";
import { colors } from "@/lib/design-tokens";


/**
 * Badge indicating a 180 score.
 */
const Badge180 = () => {
  return (
    <Typography
      component="span"
      sx={{
        color: colors.accent,
        fontSize: "0.5rem",
        fontWeight: 900,
        letterSpacing: 0.5,
        bgcolor: `${colors.accent}15`,
        px: 0.5,
        py: 0.15,
        borderRadius: 0.5,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      180
    </Typography>
  );
}

export default Badge180;
