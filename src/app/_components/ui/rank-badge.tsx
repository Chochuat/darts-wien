import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { rankBadgeBg, rankBadgeColor } from "@/lib/design-tokens";

interface RankBadgeProps {
  position: number;
}


/**
 * Rank position badge.
 *
 * @param props - Component properties.
 */
const RankBadge = ({ position }: RankBadgeProps) => {
  return (
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: rankBadgeBg(position),
        flexShrink: 0,
      }}
    >
      <Typography
        sx={{
          color: rankBadgeColor(position),
          fontWeight: 900,
          fontSize: "0.95rem",
        }}
      >
        {position}
      </Typography>
    </Box>
  );
}

export default RankBadge;
