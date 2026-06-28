export 
/**
 * GROUP_FORMAT component.
 */
const GROUP_FORMAT = { game: "501", legs: 2, maxThrows: 45 } as const;
export 
/**
 * PLAYOFF_FORMAT component.
 */
const PLAYOFF_FORMAT = { game: "501", legs: 3, maxThrows: 45 } as const;
export 
/**
 * GRAND_FINAL_FORMAT component.
 */
const GRAND_FINAL_FORMAT = {
  quarterfinal: { game: "501", legs: 4, maxThrows: 45 },
  semifinal: { game: "501", legs: 5, maxThrows: 45 },
  thirdPlace: { game: "501", legs: 5, maxThrows: 45 },
  final: { game: "501", legs: 6, maxThrows: 45 },
} as const;

export 
/**
 * BONUS_180 component.
 */
const BONUS_180 = 5 as const;
