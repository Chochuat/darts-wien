export
/**
 * Group-stage format: 501 Double Out, first to 2 legs, max 45 throws per leg.
 */
const GROUP_FORMAT = { game: "501", legs: 2, maxThrows: 45 } as const;
export
/**
 * Regular playoff format: 501 Double Out, first to 3 legs, max 45 throws per leg.
 */
const PLAYOFF_FORMAT = { game: "501", legs: 3, maxThrows: 45 } as const;
export
/**
 * Grand Final formats per round: QF first to 4, SF & 3rd place first to 5, Final first to 6.
 */
const GRAND_FINAL_FORMAT = {
  quarterfinal: { game: "501", legs: 4, maxThrows: 45 },
  semifinal: { game: "501", legs: 5, maxThrows: 45 },
  thirdPlace: { game: "501", legs: 5, maxThrows: 45 },
  final: { game: "501", legs: 6, maxThrows: 45 },
} as const;

export
/**
 * Points awarded for each 180 thrown (bonus points).
 */
const BONUS_180 = 5 as const;
