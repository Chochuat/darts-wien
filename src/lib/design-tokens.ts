export 
/**
 * colors component.
 */
const colors = {
  background: "#000",
  surface: "#e8e8e8",
  card: "#f7f7f7",

  accent: "#7c5cff",
  accent15: "#7c5cff15",
  accent4d: "#7c5cff4d",

  green: "#16a34a",
  red: "#dc2626",
  gold: "#fbbf24",
  goldText: "#c8961e",
  silver: "#a1a1aa",
  bronze: "#cd7f32",

  text: {
    primary: "#18181b",
    secondary: "#3f3f46",
    muted: "#a1a1aa",
    subtle: "#71717a",
  },
} as const;

export 
/**
 * borderRadius component.
 */
const borderRadius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  xxl: 20,
} as const;

export 
/**
 * spacing component.
 */
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/**
 * Returns a border color for a given rank position.
 *
 * @param pos - The rank position (1-based).
 */
export const borderForRank = (pos: number): string => {
  if (pos === 1) return colors.gold;
  if (pos === 2) return colors.silver;
  if (pos === 3) return colors.bronze;
  return colors.accent4d;
};

/**
 * Returns a background color for a rank badge.
 *
 * @param pos - The rank position (1-based).
 */
export const rankBadgeBg = (pos: number): string => {
  if (pos === 1) return colors.accent;
  if (pos <= 3) return colors.accent15;
  return "#f4f4f5";
};

/**
 * Returns a text color for a rank badge.
 *
 * @param pos - The rank position (1-based).
 */
export const rankBadgeColor = (pos: number): string => {
  if (pos === 1) return "#fff";
  if (pos <= 3) return colors.accent;
  return colors.text.subtle;
};
