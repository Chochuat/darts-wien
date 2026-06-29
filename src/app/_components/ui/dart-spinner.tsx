"use client";

import Box from "@mui/material/Box";
import styles from "./dart-spinner.module.css";

const SECTOR = "M50,50 L43.12,6.54 A44,44 0 0,1 56.88,6.54 Z";

interface DartSpinnerProps {
  size?: number;
}

/**
 * Animated dartboard spinner for loading states.
 *
 * Renders an SVG dartboard with 20 alternating black/beige sectors,
 * wire rings, and a red/green bullseye, continuously spinning via CSS.
 */
export const DartSpinner = ({ size = 48 }: DartSpinnerProps) => (
  <Box className={styles.dartboard} sx={{ height: size, lineHeight: 0, width: size }}>
    <svg height={size} viewBox="0 0 100 100" width={size}>
      {Array.from({ length: 20 }, (_, i) => (
        <path
          d={SECTOR}
          fill={i % 2 === 0 ? "#f5f0e0" : "#111"}
          key={i}
          transform={`rotate(${i * 18}, 50, 50)`}
        />
      ))}
      <circle cx="50" cy="50" fill="none" r="44" stroke="#444" strokeWidth="1.5" />
      <circle cx="50" cy="50" fill="none" r="33" stroke="#555" strokeWidth="1" />
      <circle cx="50" cy="50" fill="none" r="38" stroke="#777" strokeWidth="0.5" />
      <circle cx="50" cy="50" fill="#e74c3c" r="12" />
      <circle cx="50" cy="50" fill="none" r="12" stroke="#444" strokeWidth="1" />
      <circle cx="50" cy="50" fill="#27ae60" r="6" />
      <circle cx="50" cy="50" fill="none" r="6" stroke="#444" strokeWidth="1" />
    </svg>
  </Box>
);
