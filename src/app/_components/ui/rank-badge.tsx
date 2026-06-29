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
const RankBadge = (props: RankBadgeProps) => {
  return (
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: rankBadgeBg(props.position),
        flexShrink: 0,
      }}
    >
      <Typography
        sx={{
          color: rankBadgeColor(props.position),
          fontWeight: 900,
          fontSize: "0.95rem",
        }}
      >
        {props.position}
      </Typography>
    </Box>
  );
}

export default RankBadge;
