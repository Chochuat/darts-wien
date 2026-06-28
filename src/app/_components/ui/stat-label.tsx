import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { colors } from "@/lib/design-tokens";

interface StatLabelProps {
  label: string;
  value: string | number;
  labelColor?: string;
}


/**
 * Statistic label with value.
 * @param root0
 * @param root0.label
 * @param root0.value
 * @param root0.labelColor
 */
const StatLabel = ({ label, value, labelColor }: StatLabelProps) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
      <Typography
        sx={{
          color: labelColor ?? colors.text.muted,
          fontSize: "0.6rem",
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ color: colors.text.secondary, fontSize: "0.8rem", fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default StatLabel;
