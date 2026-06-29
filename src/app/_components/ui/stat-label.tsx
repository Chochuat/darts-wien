import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { colors } from "@/lib/design-tokens";

interface StatLabelProps {
  label: string;
  value: string | number;
  labelColor?: string;
}


/**
 * Stat label-value pair display.
 *
 * @param props - Component properties.
 */
const StatLabel = (props: StatLabelProps) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
      <Typography
        sx={{
          color: props.labelColor ?? colors.text.muted,
          fontSize: "0.6rem",
          fontWeight: 700,
        }}
      >
        {props.label}
      </Typography>
      <Typography sx={{ color: colors.text.secondary, fontSize: "0.8rem", fontWeight: 600 }}>
        {props.value}
      </Typography>
    </Box>
  );
}

export default StatLabel;
