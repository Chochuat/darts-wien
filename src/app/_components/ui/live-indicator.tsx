import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";


/**
 * Live status indicator dot.
 */
const LiveIndicator = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: colors.green,
          animation: "pulse 1.5s ease-in-out infinite",
          "@keyframes pulse": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.3 },
          },
        }}
      />
      <Typography sx={{ color: colors.green, fontSize: "0.5rem", fontWeight: 800, letterSpacing: 1 }}>
        {t("common.live")}
      </Typography>
    </Box>
  );
}

export default LiveIndicator;
