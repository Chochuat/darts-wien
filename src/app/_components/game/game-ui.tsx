"use client";

import { Box, Typography, Button } from "@mui/material";
import { useGame } from "./game-context";

const pubFont = '"Georgia", serif';
const cream = "#e8d5a3";
const muted = "#7a6040";

export default function GameUI() {
  const { state, throwDarts } = useGame();

  const labels = state.outcomes.map((o) => o.label).join(" · ");
  const roundScore = state.outcomes.reduce((s, o) => s + o.score, 0);
  const showRound =
    !state.isThrowing && state.landedCount >= 3 && state.outcomes.length > 0;

  return (
    <Box
      sx={{
        background: "linear-gradient(to bottom, #1a0c04, #120802)",
        borderTop: "3px solid #5a3e20",
        padding: { xs: "14px 20px 20px", md: "32px 24px" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: "10px", md: "16px" },
        justifyContent: { md: "center" },
        width: { md: 220 },
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          minHeight: 40,
          textAlign: "center",
          color: muted,
          fontFamily: pubFont,
          fontSize: 13,
          letterSpacing: 1,
          opacity: showRound ? 1 : 0.3,
          transition: "opacity .3s",
        }}
      >
        {labels || "—"}
        <Typography
          component="div"
          sx={{
            color: cream,
            fontFamily: pubFont,
            fontSize: 22,
            fontWeight: "bold",
            marginTop: "2px",
          }}
        >
          {showRound ? `${roundScore} pts` : ""}
        </Typography>
      </Box>

      <Typography
        sx={{
          color: cream,
          fontFamily: pubFont,
          fontSize: 14,
          letterSpacing: 1,
          opacity: 0.6,
        }}
      >
        Total: <strong style={{ fontSize: 18 }}>{state.totalScore}</strong>
      </Typography>

      <Button
        variant="contained"
        disabled={state.isThrowing}
        onClick={throwDarts}
        sx={{
          fontFamily: pubFont,
          fontSize: 18,
          fontWeight: "bold",
          letterSpacing: 2,
          padding: "16px 48px",
          width: "100%",
          maxWidth: 240,
          background: "linear-gradient(to bottom, #8b0000, #660000)",
          color: cream,
          boxShadow: "0 4px 12px rgba(139,0,0,.4)",
          "&:hover": {
            background: "linear-gradient(to bottom, #a00000, #770000)",
          },
          "&:active": { transform: "scale(.96)" },
          "&.Mui-disabled": {
            opacity: 0.4,
            background: "linear-gradient(to bottom, #8b0000, #660000)",
            color: cream,
          },
        }}
      >
        THROW
      </Button>
    </Box>
  );
}