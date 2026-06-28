export const GROUP_FORMAT = { game: "501", legs: 2, maxThrows: 45 } as const;
export const PLAYOFF_FORMAT = { game: "501", legs: 3, maxThrows: 45 } as const;
export const GRAND_FINAL_FORMAT = {
  quarterfinal: { game: "501", legs: 4, maxThrows: 45 },
  semifinal: { game: "501", legs: 5, maxThrows: 45 },
  thirdPlace: { game: "501", legs: 5, maxThrows: 45 },
  final: { game: "501", legs: 6, maxThrows: 45 },
} as const;

export const BONUS_180 = 5 as const;
