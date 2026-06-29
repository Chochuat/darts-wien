import { z } from "zod";

// ─── Primitives ──────────────────────────────────────────────

export 
/**
 * Zod schema for a non-negative integer (minimum 0).
 */
const positiveInt = z.number().int().min(0);
export 
/**
 * Zod schema for a non-negative integer that fits a Postgres smallint (0-32767).
 */
const positiveSmallInt = z.number().int().min(0).max(32767);
export 
/**
 * Zod schema for a player primary key (positive integer).
 */
const playerId = z.number().int().positive();
export 
/**
 * Zod schema for a season primary key (positive integer).
 */
const seasonId = z.number().int().positive();
export
/**
 * Zod schema for a tournament primary key (positive integer).
 */
const tournamentId = z.number().int().positive();
export 
/**
 * Zod schema for a tournament group primary key (positive integer).
 */
const groupId = z.number().int().positive();
export 
/**
 * Zod schema for a match primary key (positive integer).
 */
const matchId = z.number().int().positive();
export 
/**
 * Zod schema for a non-empty display name (1-255 characters).
 */
const nonEmptyName = z.string().min(1).max(255);
export 
/**
 * Zod schema for an ISO calendar date (YYYY-MM-DD).
 */
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "ISO date YYYY-MM-DD");
export 
/**
 * Zod schema for an ISO 8601 timestamp with timezone offset.
 */
const timestamptz = z.string().datetime({ offset: true });

// ─── Seasons ──────────────────────────────────────────────────

const seasonColumns = {
  name: nonEmptyName,
  start_date: dateString,
  end_date: dateString,
  is_active: z.boolean().default(false),
};

export 
/**
 * Zod schema for a season row as stored in the `seasons` table.
 */
const SeasonRow = z.object({
  id: z.number().int().positive(),
  ...seasonColumns,
  created_at: timestamptz,
});

/**
 * Inferred type of a validated season database row.
 */
export type SeasonRow = z.infer<typeof SeasonRow>;

export 
/**
 * Zod schema for the payload to create a new season.
 */
const SeasonInsert = z.object({
  ...seasonColumns,
});

/**
 * Inferred type of the payload to create a new season.
 */
export type SeasonInsert = z.infer<typeof SeasonInsert>;

// ─── Players ──────────────────────────────────────────────────

const playerColumns = {
  name: nonEmptyName,
};

export 
/**
 * Zod schema for a player row as stored in the `players` table.
 */
const PlayerRow = z.object({
  id: playerId,
  ...playerColumns,
  slug: z.string().min(1),
  created_at: timestamptz,
});

/**
 * Inferred type of a validated player database row.
 */
export type PlayerRow = z.infer<typeof PlayerRow>;

export 
/**
 * Zod schema for the payload to create a new player.
 */
const PlayerInsert = z.object({
  ...playerColumns,
});

/**
 * Inferred type of the payload to create a new player.
 */
export type PlayerInsert = z.infer<typeof PlayerInsert>;

export 
/**
 * Zod schema for a compact player summary (id, name, slug) used in API responses.
 */
const PlayerSummary = z.object({
  id: playerId,
  name: nonEmptyName,
  slug: z.string().min(1),
});

/**
 * Inferred type of a compact player summary used in API responses.
 */
export type PlayerSummary = z.infer<typeof PlayerSummary>;

// ─── Season Players ───────────────────────────────────────────

const seasonPlayerColumns = {
  season_id: seasonId,
  player_id: playerId,
};

export 
/**
 * Zod schema for a season-player association row.
 */
const SeasonPlayerRow = z.object({
  id: z.number().int().positive(),
  ...seasonPlayerColumns,
});

/**
 * Inferred type of a season-player association row.
 */
export type SeasonPlayerRow = z.infer<typeof SeasonPlayerRow>;

export 
/**
 * Zod schema for the payload to associate a player with a season.
 */
const SeasonPlayerInsert = z.object({
  ...seasonPlayerColumns,
});

/**
 * Inferred type of the payload to associate a player with a season.
 */
export type SeasonPlayerInsert = z.infer<typeof SeasonPlayerInsert>;

// ─── Tournament lifecycle ─────────────────────────────────────

export 
/**
 * tournamentStatus.
 */
const tournamentStatus = z.enum(["registration", "ready", "in_progress", "completed"]);
export 
/**
 * tournamentType.
 */
const tournamentType = z.enum(["regular", "grand_final"]);
export 
/**
 * Zod schema for the group/match generation strategy identifier.
 */
const generationType = z.string().min(1);

// ─── Tournaments ──────────────────────────────────────────────

const tournamentColumns = {
  season_id: seasonId,
  week_number: z.number().int().min(1).max(16),
  date: dateString,
  type: tournamentType.default("regular"),
  status: tournamentStatus.default("registration"),
  generation_type: z.string().min(1).nullable().default(null),
  num_groups: z.number().int().min(2).max(4).nullable().default(null),
  winner_player_id: playerId.nullable().default(null),
};

export 
/**
 * Zod schema for a tournament row as stored in the `tournaments` table.
 */
const TournamentRow = z.object({
  id: tournamentId,
  ...tournamentColumns,
  created_at: timestamptz,
});

/**
 * Inferred type of a validated tournament database row.
 */
export type TournamentRow = z.infer<typeof TournamentRow>;

const tournamentInsertBase = z.object({
  season_id: seasonId,
  week_number: z.number().int().min(1).max(16),
  date: dateString,
  type: tournamentType.default("regular"),
  num_groups: z.number().int().min(2).max(4).nullable().default(null),
});

export 
/**
 * Zod schema for the payload to create a new tournament; rejects `num_groups` on grand_final.
 */
const TournamentInsert = tournamentInsertBase.refine(
  (t) => t.type === "grand_final" ? t.num_groups === null : true,
  { message: "num_groups must be null for grand_final" },
);

/**
 * Inferred type of the payload to create a new tournament.
 */
export type TournamentInsert = z.infer<typeof TournamentInsert>;

export 
/**
 * Zod schema for a partial tournament update payload.
 */
const TournamentUpdate = tournamentInsertBase.partial();

/**
 * Inferred type of a partial tournament update payload.
 */
export type TournamentUpdate = z.infer<typeof TournamentUpdate>;

export 
/**
 * Zod schema for the camelCase request body to create a tournament via the API.
 */
const TournamentCreateBody = z.object({
  seasonId: seasonId,
  weekNumber: z.number().int().min(1).max(16),
  date: dateString,
  type: tournamentType.default("regular"),
  numGroups: z.number().int().min(2).max(4).nullable().default(null),
}).refine(
  (t) => t.type === "grand_final" ? t.numGroups === null : true,
  { message: "numGroups must be null for grand_final" },
);

/**
 * Inferred type of the request body to create a tournament via the API.
 */
export type TournamentCreateBody = z.infer<typeof TournamentCreateBody>;

// ─── Tournament Registrations ─────────────────────────────────

const registrationColumns = {
  tournament_id: tournamentId,
  player_id: playerId,
  checked_in: z.boolean().default(false),
};

export 
/**
 * Zod schema for a tournament registration row.
 */
const TournamentRegistrationRow = z.object({
  id: z.number().int().positive(),
  ...registrationColumns,
  created_at: timestamptz,
});

/**
 * Inferred type of a tournament registration row.
 */
export type TournamentRegistrationRow = z.infer<typeof TournamentRegistrationRow>;

export 
/**
 * Zod schema for the payload to register a player to a tournament.
 */
const TournamentRegistrationInsert = z.object({
  tournament_id: tournamentId,
  player_id: playerId,
});

/**
 * Inferred type of the payload to register a player to a tournament.
 */
export type TournamentRegistrationInsert = z.infer<typeof TournamentRegistrationInsert>;

export 
/**
 * Zod schema for updating a registration (check-in toggle).
 */
const TournamentRegistrationUpdate = z.object({
  checked_in: z.boolean(),
});

/**
 * Inferred type of a registration update payload.
 */
export type TournamentRegistrationUpdate = z.infer<typeof TournamentRegistrationUpdate>;

// ─── Tournament Groups ────────────────────────────────────────

export 
/**
 * Zod enum of tournament group labels (A-D).
 */
const groupLabel = z.enum(["A", "B", "C", "D"]);

const tournamentGroupColumns = {
  tournament_id: tournamentId,
  label: groupLabel,
};

export 
/**
 * Zod schema for a tournament group row.
 */
const TournamentGroupRow = z.object({
  id: groupId,
  ...tournamentGroupColumns,
});

/**
 * Inferred type of a tournament group row.
 */
export type TournamentGroupRow = z.infer<typeof TournamentGroupRow>;

export 
/**
 * Zod schema for the payload to create a tournament group.
 */
const TournamentGroupInsert = z.object({
  ...tournamentGroupColumns,
});

/**
 * Inferred type of the payload to create a tournament group.
 */
export type TournamentGroupInsert = z.infer<typeof TournamentGroupInsert>;

// ─── Tournament Group Players ─────────────────────────────────

const tournamentGroupPlayerColumns = {
  group_id: groupId,
  player_id: playerId,
};

export 
/**
 * Zod schema for a tournament group membership row.
 */
const TournamentGroupPlayerRow = z.object({
  id: z.number().int().positive(),
  ...tournamentGroupPlayerColumns,
});

/**
 * Inferred type of a tournament group membership row.
 */
export type TournamentGroupPlayerRow = z.infer<typeof TournamentGroupPlayerRow>;

export 
/**
 * Zod schema for the payload to add a player to a tournament group.
 */
const TournamentGroupPlayerInsert = z.object({
  ...tournamentGroupPlayerColumns,
});

/**
 * Inferred type of the payload to add a player to a tournament group.
 */
export type TournamentGroupPlayerInsert = z.infer<typeof TournamentGroupPlayerInsert>;

// ─── Match lifecycle ──────────────────────────────────────────

export 
/**
 * Zod enum of match lifecycle states.
 */
const matchStatus = z.enum(["pending", "completed", "no_show"]);
export 
/**
 * Zod enum of match types (league, tournament group, tournament playoff).
 */
const matchType = z.enum(["league", "tournament_group", "tournament_playoff"]);
export 
/**
 * Zod enum of playoff round names.
 */
const roundName = z.enum(["Quarter-Finals", "Semi-Finals", "3rd Place", "Final"]);

// ─── Matches (unified, one row per match) ─────────────────────

const matchColumns = {
  season_id: seasonId,
  player1_id: playerId.nullable().default(null),
  player2_id: playerId.nullable().default(null),
  status: matchStatus.default("pending"),
  legs_player1: positiveSmallInt.nullable().default(null),
  legs_player2: positiveSmallInt.nullable().default(null),
  legs_target: z.number().int().min(1).max(10),
  max_throws: z.number().int().min(1).default(45),
  player1_180: positiveSmallInt.default(0),
  player2_180: positiveSmallInt.default(0),
  no_show_player_id: playerId.nullable().default(null),
  match_type: matchType,
  tournament_id: tournamentId.nullable().default(null),
  tournament_group_id: groupId.nullable().default(null),
  tournament_round_name: roundName.nullable().default(null),
  sort_order: z.number().int().min(0).nullable().default(null),
  match_date: dateString,
  next_match_id: matchId.nullable().default(null),
  advances: z.enum(["winner", "loser"]).default("winner"),
  player_slot: z.enum(["player1", "player2"]).nullable().default(null),
  starting_score: z.number().int().min(1).default(501),
};

export 
/**
 * Zod schema for a match row as stored in the `matches` table, with cross-field validation for type/status/legs.
 */
const MatchRow = z.object({
  id: matchId,
  ...matchColumns,
  created_at: timestamptz,
}).refine(
  (m) => m.player1_id === null || m.player2_id === null || m.player1_id !== m.player2_id,
  { message: "player1_id and player2_id must be different when both are set" },
).refine(
  (m) => {
    switch (m.match_type) {
      case "league":
        return m.tournament_id === null && m.tournament_group_id === null
          && m.tournament_round_name === null && m.sort_order === null;
      case "tournament_group":
        return m.tournament_id !== null && m.tournament_group_id !== null
          && m.tournament_round_name === null && m.sort_order === null;
      case "tournament_playoff":
        return m.tournament_id !== null && m.tournament_group_id === null
          && m.tournament_round_name !== null && m.sort_order !== null;
    }
  },
  { message: "FK/sort_order combination does not match match_type" },
).refine(
  (m) => {
    switch (m.status) {
      case "pending":
        return m.legs_player1 === null && m.legs_player2 === null && m.no_show_player_id === null;
      case "completed":
        return m.legs_player1 !== null && m.legs_player2 !== null && m.no_show_player_id === null;
      case "no_show":
        return m.legs_player1 !== null && m.legs_player2 !== null && m.no_show_player_id !== null;
    }
  },
  { message: "legs/no_show_player_id combination does not match status" },
);

/**
 * Inferred type of a validated match database row.
 */
export type MatchRow = z.infer<typeof MatchRow>;

export 
/**
 * Zod schema for the payload to create a new match, with cross-field validation for type/status/legs.
 */
const MatchInsert = z.object({
  ...matchColumns,
}).refine(
  (m) => m.player1_id === null || m.player2_id === null || m.player1_id !== m.player2_id,
  { message: "player1_id and player2_id must be different when both are set" },
).refine(
  (m) => {
    switch (m.match_type) {
      case "league":
        return m.tournament_id === null && m.tournament_group_id === null
          && m.tournament_round_name === null && m.sort_order === null;
      case "tournament_group":
        return m.tournament_id !== null && m.tournament_group_id !== null
          && m.tournament_round_name === null && m.sort_order === null;
      case "tournament_playoff":
        return m.tournament_id !== null && m.tournament_group_id === null
          && m.tournament_round_name !== null && m.sort_order !== null;
    }
  },
  { message: "FK/sort_order combination does not match match_type" },
).refine(
  (m) => {
    switch (m.status) {
      case "pending":
        return m.legs_player1 === null && m.legs_player2 === null && m.no_show_player_id === null;
      case "completed":
        return m.legs_player1 !== null && m.legs_player2 !== null && m.no_show_player_id === null;
      case "no_show":
        return m.legs_player1 !== null && m.legs_player2 !== null && m.no_show_player_id !== null;
    }
  },
  { message: "legs/no_show_player_id combination does not match status" },
);

/**
 * Inferred type of the payload to create a new match.
 */
export type MatchInsert = z.infer<typeof MatchInsert>;

// ─── Match result update (API: PATCH /api/matches/[id]) ───────

export 
/**
 * Zod schema for submitting a completed match result (no draws, at least one leg won).
 */
const MatchResultUpdate = z.object({
  legs_player1: positiveSmallInt,
  legs_player2: positiveSmallInt,
  player1_180: positiveSmallInt.optional().default(0),
  player2_180: positiveSmallInt.optional().default(0),
}).refine(
  (m) => m.legs_player1 !== m.legs_player2,
  { message: "legs must not be equal (no draws)" },
).refine(
  (m) => m.legs_player1 > 0 || m.legs_player2 > 0,
  { message: "at least one player must have won a leg" },
);

/**
 * Inferred type of a completed match result payload.
 */
export type MatchResultUpdate = z.infer<typeof MatchResultUpdate>;

// ─── Match no-show (API: PATCH /api/matches/[id]/no-show) ────

export 
/**
 * Zod schema for recording a no-show (walkover) result.
 */
const MatchNoShowUpdate = z.object({
  no_show_player_id: playerId,
});

/**
 * Inferred type of a no-show result payload.
 */
export type MatchNoShowUpdate = z.infer<typeof MatchNoShowUpdate>;

// ─── Tournament Final Standings ───────────────────────────────

const finalStandingColumns = {
  tournament_id: tournamentId,
  player_id: playerId,
  position: z.number().int().min(1),
  played: positiveSmallInt.default(0),
  wins: positiveSmallInt.default(0),
  losses: positiveSmallInt.default(0),
  sets_for: positiveSmallInt.default(0),
  sets_against: positiveSmallInt.default(0),
  one80s: positiveSmallInt.default(0),
  group_points: positiveSmallInt.default(0),
  playoff_points: positiveSmallInt.default(0),
  bonus_points: positiveSmallInt.default(0),
  total_points: positiveSmallInt.default(0),
};

export 
/**
 * Zod schema for a tournament final standing row.
 */
const TournamentFinalStandingRow = z.object({
  id: z.number().int().positive(),
  ...finalStandingColumns,
});

/**
 * Inferred type of a tournament final standing row.
 */
export type TournamentFinalStandingRow = z.infer<typeof TournamentFinalStandingRow>;

export 
/**
 * Zod schema for the payload to create a final standing entry.
 */
const TournamentFinalStandingInsert = z.object({
  ...finalStandingColumns,
});

/**
 * Inferred type of the payload to create a final standing entry.
 */
export type TournamentFinalStandingInsert = z.infer<typeof TournamentFinalStandingInsert>;

// ─── Game Throw (existing) ───────────────────────────────────

export 
/**
 * Zod schema for a `game_throw` row (3D game leaderboard entry).
 */
const GameThrowRow = z.object({
  id: z.number().int().positive(),
  name: nonEmptyName,
  throw: z.number().int().min(0),
  created_at: timestamptz,
});

/**
 * Inferred type of a game throw leaderboard row.
 */
export type GameThrowRow = z.infer<typeof GameThrowRow>;

export 
/**
 * Zod schema for the payload to insert a game throw score.
 */
const GameThrowInsert = z.object({
  name: nonEmptyName,
  throw: z.number().int().min(0),
});

/**
 * Inferred type of the payload to insert a game throw score.
 */
export type GameThrowInsert = z.infer<typeof GameThrowInsert>;

// ─── API: Registration request bodies ─────────────────────────

export 
/**
 * Zod schema for the request body to add a tournament registration.
 */
const RegistrationAddBody = z.object({
  playerId: playerId,
});

/**
 * Inferred type of the request body to add a registration.
 */
export type RegistrationAddBody = z.infer<typeof RegistrationAddBody>;

export 
/**
 * Zod schema for the request body to toggle a registration's check-in flag.
 */
const RegistrationCheckinBody = z.object({
  checkedIn: z.boolean(),
});

/**
 * Inferred type of the request body to toggle check-in.
 */
export type RegistrationCheckinBody = z.infer<typeof RegistrationCheckinBody>;

// ─── API: Match list query params (coerced) ───────────────────

export 
/**
 * Zod schema for the matches list query parameters (values are coerced to numbers).
 */
const MatchListQuery = z.object({
  seasonId: z.coerce.number().int().positive().optional(),
  playerId: z.coerce.number().int().positive().optional(),
  matchType: matchType.optional(),
  result: z.enum(["W", "L"]).optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(5000).default(20),
});

/**
 * Inferred type of the matches list query parameters.
 */
export type MatchListQuery = z.infer<typeof MatchListQuery>;

// ─── API: Tournament list query params ────────────────────────

export 
/**
 * Zod schema for the tournaments list query parameters (values are coerced to numbers).
 */
const TournamentListQuery = z.object({
  seasonId: z.coerce.number().int().positive().optional(),
});

/**
 * Inferred type of the tournaments list query parameters.
 */
export type TournamentListQuery = z.infer<typeof TournamentListQuery>;

// ─── Recent match for standings expanded view ─────────────────

export 
/**
 * Zod schema for a recent-match summary shown in the standings expanded view.
 */
const StandingRecentMatch = z.object({
  opponent: nonEmptyName,
  score: z.string().min(1),
  result: z.enum(["W", "L"]),
  date: dateString,
  one80: positiveSmallInt.default(0),
});

/**
 * Inferred type of a recent-match summary shown in standings.
 */
export type StandingRecentMatch = z.infer<typeof StandingRecentMatch>;

// ─── API: Season standings response ───────────────────────────

export 
/**
 * Zod schema for a single player's standings row, including form and recent matches.
 */
const StandingPlayer = z.object({
  pos: z.number().int().min(1),
  playerId: playerId,
  name: nonEmptyName,
  slug: z.string().min(1),
  played: positiveSmallInt,
  wins: positiveSmallInt,
  losses: positiveSmallInt,
  setsFor: positiveSmallInt,
  setsAgainst: positiveSmallInt,
  points: positiveSmallInt,
  one80s: positiveSmallInt,
  form: z.array(z.enum(["W", "L"])),
  recentMatches: z.array(StandingRecentMatch).default([]),
});

/**
 * Inferred type of a single player's standings row.
 */
export type StandingPlayer = z.infer<typeof StandingPlayer>;

export 
/**
 * Zod schema for the season standings API response.
 */
const StandingsResponse = z.object({
  season: z.object({
    id: seasonId,
    name: nonEmptyName,
    isActive: z.boolean(),
  }),
  players: z.array(StandingPlayer),
});

/**
 * Inferred type of the season standings API response.
 */
export type StandingsResponse = z.infer<typeof StandingsResponse>;

// ─── API: Player match perspective ────────────────────────────

export 
/**
 * Zod schema for a match viewed from a single player's perspective.
 */
const PlayerMatchPerspective = z.object({
  id: matchId,
  opponentName: nonEmptyName,
  opponentSlug: z.string().min(1),
  score: z.string().min(1),
  result: z.enum(["W", "L"]),
  date: dateString,
  one80: positiveSmallInt,
  matchType: matchType,
  tournamentWeek: z.number().int().min(1).max(16).nullable().optional(),
  tournamentType: tournamentType.nullable().optional(),
  roundName: roundName.nullable().optional(),
  groupLabel: groupLabel.nullable().optional(),
});

/**
 * Inferred type of a match viewed from a player's perspective.
 */
export type PlayerMatchPerspective = z.infer<typeof PlayerMatchPerspective>;

// ─── API: Tournament summary ──────────────────────────────────

export 
/**
 * Zod schema for a tournament summary used in tournament list responses.
 */
const TournamentSummary = z.object({
  id: tournamentId,
  weekNumber: z.number().int().min(1).max(16),
  date: dateString,
  type: tournamentType,
  status: tournamentStatus,
  winner: PlayerSummary.nullable(),
  generationType: z.string().nullable(),
  playerCount: positiveSmallInt,
  groupMatchCount: positiveSmallInt,
  playoffMatchCount: positiveSmallInt,
  total180s: positiveSmallInt,
});

/**
 * Inferred type of a tournament summary used in list responses.
 */
export type TournamentSummary = z.infer<typeof TournamentSummary>;

// ─── API: Group standing row ──────────────────────────────────

export 
/**
 * Zod schema for a single group's standing row.
 */
const GroupStandingRow = z.object({
  player: PlayerSummary,
  pos: z.number().int().min(1),
  played: positiveSmallInt,
  wins: positiveSmallInt,
  losses: positiveSmallInt,
  setsFor: positiveSmallInt,
  setsAgainst: positiveSmallInt,
  points: positiveSmallInt,
  one80s: positiveSmallInt,
});

/**
 * Inferred type of a single group's standing row.
 */
export type GroupStandingRow = z.infer<typeof GroupStandingRow>;

// ─── API: Tournament match row ────────────────────────────────

export 
/**
 * Zod schema for a match row in API responses.
 */
const ApiMatchRow = z.object({
  id: matchId,
  matchType: matchType,
  status: matchStatus,
  player1: PlayerSummary.nullable(),
  player2: PlayerSummary.nullable(),
  legsPlayer1: positiveSmallInt.nullable(),
  legsPlayer2: positiveSmallInt.nullable(),
  legsTarget: z.number().int().min(1).max(10),
  maxThrows: z.number().int().min(1),
  startingScore: z.number().int().min(1).default(501),
  player1_180: positiveSmallInt,
  player2_180: positiveSmallInt,
  noShowPlayerId: playerId.nullable(),
  matchDate: dateString,
  tournamentWeek: z.number().int().min(1).max(16).nullable().optional(),
  tournamentType: tournamentType.nullable().optional(),
  groupLabel: groupLabel.nullable().optional(),
  roundName: roundName.nullable().optional(),
  sortOrder: z.number().int().min(0).nullable().optional(),
  nextMatchId: matchId.nullable().optional(),
  advances: z.enum(["winner", "loser"]).optional(),
  playerSlot: z.enum(["player1", "player2"]).nullable().optional(),
});

/**
 * Inferred type of a match row in API responses.
 */
export type ApiMatchRow = z.infer<typeof ApiMatchRow>;

// ─── API: Tournament group (detail) ───────────────────────────

export 
/**
 * Zod schema for a tournament group in the detail response.
 */
const ApiTournamentGroup = z.object({
  label: groupLabel,
  players: z.array(PlayerSummary),
  standings: z.array(GroupStandingRow),
  matches: z.array(ApiMatchRow),
});

/**
 * Inferred type of a tournament group in the detail response.
 */
export type ApiTournamentGroup = z.infer<typeof ApiTournamentGroup>;

// ─── API: Playoff round ──────────────────────────────────────

export 
/**
 * Zod schema for a playoff round in the tournament detail response.
 */
const ApiPlayoffRound = z.object({
  name: roundName,
  matches: z.array(ApiMatchRow),
});

/**
 * Inferred type of a playoff round in the detail response.
 */
export type ApiPlayoffRound = z.infer<typeof ApiPlayoffRound>;

// ─── API: Final standing entry ───────────────────────────────

export 
/**
 * Zod schema for a final standing entry in the tournament detail response.
 */
const ApiFinalStandingEntry = z.object({
  pos: z.number().int().min(1),
  player: PlayerSummary,
  played: positiveSmallInt,
  wins: positiveSmallInt,
  losses: positiveSmallInt,
  setsFor: positiveSmallInt,
  setsAgainst: positiveSmallInt,
  groupPoints: positiveSmallInt,
  playoffPoints: positiveSmallInt,
  bonusPoints: positiveSmallInt,
  totalPoints: positiveSmallInt,
  one80s: positiveSmallInt,
});

/**
 * Inferred type of a final standing entry in the detail response.
 */
export type ApiFinalStandingEntry = z.infer<typeof ApiFinalStandingEntry>;

// ─── API: Tournament detail response ──────────────────────────

export 
/**
 * Zod schema for the tournament detail API response.
 */
const TournamentDetailResponse = z.object({
  tournament: TournamentSummary,
  groups: z.array(ApiTournamentGroup),
  playoffs: z.array(ApiPlayoffRound),
  finalStandings: z.array(ApiFinalStandingEntry),
});

/**
 * Inferred type of the tournament detail API response.
 */
export type TournamentDetailResponse = z.infer<typeof TournamentDetailResponse>;

// ─── API: Matches response (list) ─────────────────────────────

export 
/**
 * Zod schema for the paginated matches list API response.
 */
const ApiMatchesResponse = z.object({
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(5000),
  matches: z.array(ApiMatchRow),
});

/**
 * Inferred type of the matches list API response.
 */
export type ApiMatchesResponse = z.infer<typeof ApiMatchesResponse>;

// ─── API: Registrations ──────────────────────────────────────

export 
/**
 * Zod schema for a registration entry in API responses.
 */
const ApiRegistrationEntry = z.object({
  player: PlayerSummary,
  checkedIn: z.boolean(),
  createdAt: timestamptz,
});

/**
 * Inferred type of a registration entry in API responses.
 */
export type ApiRegistrationEntry = z.infer<typeof ApiRegistrationEntry>;

export 
/**
 * Zod schema for the tournament registrations API response.
 */
const ApiRegistrationsResponse = z.object({
  registrations: z.array(ApiRegistrationEntry),
});

/**
 * Inferred type of the tournament registrations API response.
 */
export type ApiRegistrationsResponse = z.infer<typeof ApiRegistrationsResponse>;

// ─── Admin: Profile ───────────────────────────────────────────

export
/**
 * Zod enum of profile roles.
 */
const profileRole = z.enum(["pending", "scorekeeper", "admin"]);
export
/**
 * Zod schema for a profile row as stored in the `profiles` table.
 */
const ProfileRow = z.object({
  user_id: z.string().uuid(),
  role: profileRole,
  player_id: playerId.nullable().default(null),
  display_name: z.string().nullable().default(null),
  created_at: timestamptz,
});

/**
 * Inferred type of a validated profile database row.
 */
export type ProfileRow = z.infer<typeof ProfileRow>;

export
/**
 * Zod schema for the request body to update a profile (promote/demote/link player).
 */
const ProfileUpdateBody = z.object({
  role: profileRole.optional(),
  playerId: playerId.nullable().optional(),
  displayName: z.string().max(255).nullable().optional(),
});

/**
 * Inferred type of the profile update request body.
 */
export type ProfileUpdateBody = z.infer<typeof ProfileUpdateBody>;

// ─── Admin: Auth request bodies ───────────────────────────────

export
/**
 * Zod schema for the login request body.
 */
const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Inferred type of the login request body.
 */
export type LoginBody = z.infer<typeof LoginBody>;

export
/**
 * Zod schema for the signup request body. New profiles default to role 'pending'.
 */
const SignupBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(255).optional(),
});

/**
 * Inferred type of the signup request body.
 */
export type SignupBody = z.infer<typeof SignupBody>;

export
/**
 * Zod schema for the forgot-password request body.
 */
const ForgotPasswordBody = z.object({
  email: z.string().email(),
});

/**
 * Inferred type of the forgot-password request body.
 */
export type ForgotPasswordBody = z.infer<typeof ForgotPasswordBody>;

export
/**
 * Zod schema for the reset-password request body.
 */
const ResetPasswordBody = z.object({
  password: z.string().min(8),
});

/**
 * Inferred type of the reset-password request body.
 */
export type ResetPasswordBody = z.infer<typeof ResetPasswordBody>;

// ─── Admin: Tournament format config ──────────────────────────

export
/**
 * Zod enum of tournament format phases.
 */
const tournamentFormatPhase = z.enum([
  "group", "playoff", "third_place", "final",
  "grand_final_qf", "grand_final_sf", "grand_final_third",
  "grand_final_final", "grand_final_consolation_sf",
  "grand_final_5th", "grand_final_7th",
]);
export
/**
 * Zod schema for a tournament_format row.
 */
const TournamentFormatRow = z.object({
  tournament_id: tournamentId,
  phase: tournamentFormatPhase,
  legs_target: z.number().int().min(1).max(10),
  starting_score: z.number().int().min(1).default(501),
  max_throws: z.number().int().min(1).default(45),
});

/**
 * Inferred type of a tournament_format row.
 */
export type TournamentFormatRow = z.infer<typeof TournamentFormatRow>;

export
/**
 * Zod schema for a single phase entry in a format config update body.
 */
const TournamentFormatEntry = z.object({
  phase: tournamentFormatPhase,
  legsTarget: z.number().int().min(1).max(10),
  startingScore: z.number().int().min(1).default(501),
  maxThrows: z.number().int().min(1).default(45),
});

/**
 * Inferred type of a format config entry.
 */
export type TournamentFormatEntry = z.infer<typeof TournamentFormatEntry>;

export
/**
 * Zod schema for the request body to set tournament format config.
 */
const TournamentFormatBody = z.object({
  entries: z.array(TournamentFormatEntry).min(1),
});

/**
 * Inferred type of the tournament format config request body.
 */
export type TournamentFormatBody = z.infer<typeof TournamentFormatBody>;

// ─── Admin: Club settings ─────────────────────────────────────

export
/**
 * Zod enum of tiebreaker dimensions used for group advancement.
 */
const tiebreakerDimension = z.enum([
  "head_to_head", "leg_diff", "legs_won", "legs_lost", "one80s",
]);
export
/**
 * Zod schema for the club_settings row.
 */
const ClubSettingsRow = z.object({
  id: z.number().int().min(1),
  tiebreaker_order: z.array(tiebreakerDimension),
  updated_at: timestamptz,
});

/**
 * Inferred type of the club_settings row.
 */
export type ClubSettingsRow = z.infer<typeof ClubSettingsRow>;

export
/**
 * Zod schema for the request body to update the tiebreaker order. Must contain all five dimensions exactly once.
 */
const ClubSettingsBody = z.object({
  tiebreakerOrder: z.array(tiebreakerDimension).length(5),
}).refine(
  (b) => new Set(b.tiebreakerOrder).size === 5,
  { message: "tiebreakerOrder must contain each dimension exactly once" },
);

/**
 * Inferred type of the club settings update body.
 */
export type ClubSettingsBody = z.infer<typeof ClubSettingsBody>;

// ─── Admin: Standings snapshot ────────────────────────────────

export
/**
 * Zod schema for a tournament_standings_snapshot row.
 */
const StandingsSnapshotRow = z.object({
  tournament_id: tournamentId,
  player_id: playerId,
  rank: z.number().int().min(1),
  points: z.number().int().default(0),
  leg_diff: z.number().int().default(0),
  legs_won: z.number().int().default(0),
  legs_lost: z.number().int().default(0),
  one80s: z.number().int().default(0),
});

/**
 * Inferred type of a standings snapshot row.
 */
export type StandingsSnapshotRow = z.infer<typeof StandingsSnapshotRow>;

// ─── Admin: Tournament generation ─────────────────────────────

export
/**
 * Zod enum of group generation strategies.
 */
const generationStrategy = z.enum([
  "split_contiguous", "interleaved_strict", "snake", "manual",
]);
export
/**
 * Zod enum of extra-match pairing rules for unequal-group compensation.
 */
const extraMatchPairing = z.enum([
  "top_vs_bottom", "top_vs_top", "cross", "manual",
]);
export
/**
 * Zod schema for a manual group assignment (player_id to group label).
 */
const ManualAssignment = z.object({
  playerId: playerId,
  groupLabel: groupLabel,
});

/**
 * Inferred type of a manual group assignment.
 */
export type ManualAssignment = z.infer<typeof ManualAssignment>;

export
/**
 * Zod schema for a manual extra-match pairing (two player_ids in a smaller group).
 */
const ManualExtraMatch = z.object({
  player1Id: playerId,
  player2Id: playerId,
  groupLabel: groupLabel,
}).refine(
  (m) => m.player1Id !== m.player2Id,
  { message: "player1Id and player2Id must be different" },
);

/**
 * Inferred type of a manual extra-match pairing.
 */
export type ManualExtraMatch = z.infer<typeof ManualExtraMatch>;

export
/**
 * Zod schema for the tournament generate request body.
 */
const TournamentGenerateBody = z.object({
  generationType: generationStrategy,
  numGroups: z.number().int().min(2).max(4),
  manualAssignments: z.array(ManualAssignment).optional(),
  extraMatchPairing: extraMatchPairing.optional(),
  manualExtraMatches: z.array(ManualExtraMatch).optional(),
}).refine(
  (b) => b.generationType === "manual" ? Array.isArray(b.manualAssignments) && b.manualAssignments.length > 0 : true,
  { message: "manualAssignments is required when generationType is 'manual'" },
);

/**
 * Inferred type of the tournament generate request body.
 */
export type TournamentGenerateBody = z.infer<typeof TournamentGenerateBody>;

// ─── Admin: Seed playoffs ─────────────────────────────────────

export
/**
 * Zod schema for a single advancement entry (player + QF seed position 1-8).
 */
const AdvancementEntry = z.object({
  playerId: playerId,
  seedPosition: z.number().int().min(1).max(8),
});

/**
 * Inferred type of an advancement entry.
 */
export type AdvancementEntry = z.infer<typeof AdvancementEntry>;

export
/**
 * Zod schema for the seed-playoffs request body. Must contain exactly 8 advancement entries with distinct seed positions.
 */
const SeedPlayoffsBody = z.object({
  advancements: z.array(AdvancementEntry).length(8),
}).refine(
  (b) => new Set(b.advancements.map((a) => a.seedPosition)).size === 8,
  { message: "seedPosition values must be unique across advancements" },
).refine(
  (b) => new Set(b.advancements.map((a) => a.playerId)).size === 8,
  { message: "playerId values must be unique across advancements" },
);

/**
 * Inferred type of the seed-playoffs request body.
 */
export type SeedPlayoffsBody = z.infer<typeof SeedPlayoffsBody>;

// ─── Admin: Session response ──────────────────────────────────

export
/**
 * Zod schema for the admin session API response.
 */
const AdminSessionResponse = z.object({
  userId: z.string().uuid(),
  role: profileRole,
  playerId: playerId.nullable(),
  displayName: z.string().nullable(),
});

/**
 * Inferred type of the admin session API response.
 */
export type AdminSessionResponse = z.infer<typeof AdminSessionResponse>;
