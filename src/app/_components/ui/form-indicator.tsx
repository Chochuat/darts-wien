import Box from "@mui/material/Box";
import { colors } from "@/lib/design-tokens";

interface FormIndicatorProps {
  form: ("W" | "L")[];
}

const FormIndicator = ({ form }: FormIndicatorProps) => {
  return (
    <Box sx={{ display: "flex", gap: 0.3, alignItems: "center" }}>
      {form.map((r, i) => (
        <Box
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            bgcolor: r === "W" ? colors.green : colors.red,
            flexShrink: 0,
          }}
        />
      ))}
    </Box>
  );
}

export default FormIndicator;
