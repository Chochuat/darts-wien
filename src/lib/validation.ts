import { z } from "zod";

// ─── Primitives ──────────────────────────────────────────────

export const positiveInt = z.number().int().min(0);
export const positiveSmallInt = z.number().int().min(0).max(32767);
export const playerId = z.number().int().positive();
export const seasonId = z.number().int().positive();
export const tournamentId = z.number().int().positive();
export const groupId = z.number().int().positive();
export const matchId = z.number().int().positive();
export const nonEmptyName = z.string().min(1).max(255);
export const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "ISO date YYYY-MM-DD");
export const timestamptz = z.string().datetime({ offset: true });

// ─── Seasons ──────────────────────────────────────────────────

const seasonColumns = {
  name: nonEmptyName,
  start_date: dateString,
  end_date: dateString,
  is_active: z.boolean().default(false),
};

export const SeasonRow = z.object({
  id: z.number().int().positive(),
  ...seasonColumns,
  created_at: timestamptz,
});
export type SeasonRow = z.infer<typeof SeasonRow>;

export const SeasonInsert = z.object({
  ...seasonColumns,
});
export type SeasonInsert = z.infer<typeof SeasonInsert>;

// ─── Players ──────────────────────────────────────────────────

const playerColumns = {
  name: nonEmptyName,
};

export const PlayerRow = z.object({
  id: playerId,
  ...playerColumns,
  slug: z.string().min(1),
  created_at: timestamptz,
});
export type PlayerRow = z.infer<typeof PlayerRow>;

export const PlayerInsert = z.object({
  ...playerColumns,
});
export type PlayerInsert = z.infer<typeof PlayerInsert>;

export const PlayerSummary = z.object({
  id: playerId,
  name: nonEmptyName,
  slug: z.string().min(1),
});
export type PlayerSummary = z.infer<typeof PlayerSummary>;

// ─── Season Players ───────────────────────────────────────────

const seasonPlayerColumns = {
  season_id: seasonId,
  player_id: playerId,
};

export const SeasonPlayerRow = z.object({
  id: z.number().int().positive(),
  ...seasonPlayerColumns,
});
export type SeasonPlayerRow = z.infer<typeof SeasonPlayerRow>;

export const SeasonPlayerInsert = z.object({
  ...seasonPlayerColumns,
});
export type SeasonPlayerInsert = z.infer<typeof SeasonPlayerInsert>;

// ─── Tournament lifecycle ─────────────────────────────────────

export const tournamentStatus = z.enum(["registration", "ready", "in_progress", "completed"]);
export const tournamentType = z.enum(["regular", "grand_final"]);
export const generationType = z.string().min(1);

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

export const TournamentRow = z.object({
  id: tournamentId,
  ...tournamentColumns,
  created_at: timestamptz,
});
export type TournamentRow = z.infer<typeof TournamentRow>;

const tournamentInsertBase = z.object({
  season_id: seasonId,
  week_number: z.number().int().min(1).max(16),
  date: dateString,
  type: tournamentType.default("regular"),
  num_groups: z.number().int().min(2).max(4).nullable().default(null),
});

export const TournamentInsert = tournamentInsertBase.refine(
  (t) => t.type === "grand_final" ? t.num_groups === null : true,
  { message: "num_groups must be null for grand_final" },
);
export type TournamentInsert = z.infer<typeof TournamentInsert>;

export const TournamentUpdate = tournamentInsertBase.partial();
export type TournamentUpdate = z.infer<typeof TournamentUpdate>;

// ─── Tournament Registrations ─────────────────────────────────

const registrationColumns = {
  tournament_id: tournamentId,
  player_id: playerId,
  checked_in: z.boolean().default(false),
};

export const TournamentRegistrationRow = z.object({
  id: z.number().int().positive(),
  ...registrationColumns,
  created_at: timestamptz,
});
export type TournamentRegistrationRow = z.infer<typeof TournamentRegistrationRow>;

export const TournamentRegistrationInsert = z.object({
  tournament_id: tournamentId,
  player_id: playerId,
});
export type TournamentRegistrationInsert = z.infer<typeof TournamentRegistrationInsert>;

export const TournamentRegistrationUpdate = z.object({
  checked_in: z.boolean(),
});
export type TournamentRegistrationUpdate = z.infer<typeof TournamentRegistrationUpdate>;

// ─── Tournament Groups ────────────────────────────────────────

export const groupLabel = z.enum(["A", "B", "C", "D"]);

const tournamentGroupColumns = {
  tournament_id: tournamentId,
  label: groupLabel,
};

export const TournamentGroupRow = z.object({
  id: groupId,
  ...tournamentGroupColumns,
});
export type TournamentGroupRow = z.infer<typeof TournamentGroupRow>;

export const TournamentGroupInsert = z.object({
  ...tournamentGroupColumns,
});
export type TournamentGroupInsert = z.infer<typeof TournamentGroupInsert>;

// ─── Tournament Group Players ─────────────────────────────────

const tournamentGroupPlayerColumns = {
  group_id: groupId,
  player_id: playerId,
};

export const TournamentGroupPlayerRow = z.object({
  id: z.number().int().positive(),
  ...tournamentGroupPlayerColumns,
});
export type TournamentGroupPlayerRow = z.infer<typeof TournamentGroupPlayerRow>;

export const TournamentGroupPlayerInsert = z.object({
  ...tournamentGroupPlayerColumns,
});
export type TournamentGroupPlayerInsert = z.infer<typeof TournamentGroupPlayerInsert>;

// ─── Match lifecycle ──────────────────────────────────────────

export const matchStatus = z.enum(["pending", "completed", "no_show"]);
export const matchType = z.enum(["league", "tournament_group", "tournament_playoff"]);
export const roundName = z.enum(["Quarter-Finals", "Semi-Finals", "3rd Place", "Final"]);

// ─── Matches (unified, one row per match) ─────────────────────

const matchColumns = {
  season_id: seasonId,
  player1_id: playerId,
  player2_id: playerId,
  status: matchStatus.default("pending"),
  legs_player1: positiveSmallInt.nullable().default(null),
  legs_player2: positiveSmallInt.nullable().default(null),
  legs_target: z.number().int().min(2).max(6),
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
};

export const MatchRow = z.object({
  id: matchId,
  ...matchColumns,
  created_at: timestamptz,
}).refine(
  (m) => m.player1_id !== m.player2_id,
  { message: "player1_id and player2_id must be different" },
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
export type MatchRow = z.infer<typeof MatchRow>;

export const MatchInsert = z.object({
  ...matchColumns,
}).refine(
  (m) => m.player1_id !== m.player2_id,
  { message: "player1_id and player2_id must be different" },
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
export type MatchInsert = z.infer<typeof MatchInsert>;

// ─── Match result update (API: PATCH /api/matches/[id]) ───────

export const MatchResultUpdate = z.object({
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
export type MatchResultUpdate = z.infer<typeof MatchResultUpdate>;

// ─── Match no-show (API: PATCH /api/matches/[id]/no-show) ────

export const MatchNoShowUpdate = z.object({
  no_show_player_id: playerId,
});
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

export const TournamentFinalStandingRow = z.object({
  id: z.number().int().positive(),
  ...finalStandingColumns,
});
export type TournamentFinalStandingRow = z.infer<typeof TournamentFinalStandingRow>;

export const TournamentFinalStandingInsert = z.object({
  ...finalStandingColumns,
});
export type TournamentFinalStandingInsert = z.infer<typeof TournamentFinalStandingInsert>;

// ─── Game Throw (existing) ───────────────────────────────────

export const GameThrowRow = z.object({
  id: z.number().int().positive(),
  name: nonEmptyName,
  throw: z.number().int().min(0),
  created_at: timestamptz,
});
export type GameThrowRow = z.infer<typeof GameThrowRow>;

export const GameThrowInsert = z.object({
  name: nonEmptyName,
  throw: z.number().int().min(0),
});
export type GameThrowInsert = z.infer<typeof GameThrowInsert>;

// ─── API: Tournament generate ─────────────────────────────────

export const TournamentGenerateBody = z.object({
  generation_type: generationType,
});
export type TournamentGenerateBody = z.infer<typeof TournamentGenerateBody>;

// ─── API: Registration request bodies ─────────────────────────

export const RegistrationAddBody = z.object({
  player_id: playerId,
});
export type RegistrationAddBody = z.infer<typeof RegistrationAddBody>;

export const RegistrationCheckinBody = z.object({
  checked_in: z.boolean(),
});
export type RegistrationCheckinBody = z.infer<typeof RegistrationCheckinBody>;

// ─── API: Match list query params (coerced) ───────────────────

export const MatchListQuery = z.object({
  season_id: z.coerce.number().int().positive().optional(),
  player_id: z.coerce.number().int().positive().optional(),
  match_type: matchType.optional(),
  result: z.enum(["W", "L"]).optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type MatchListQuery = z.infer<typeof MatchListQuery>;

// ─── API: Tournament list query params ────────────────────────

export const TournamentListQuery = z.object({
  season_id: z.coerce.number().int().positive().optional(),
});
export type TournamentListQuery = z.infer<typeof TournamentListQuery>;

// ─── Recent match for standings expanded view ─────────────────

export const StandingRecentMatch = z.object({
  opponent: nonEmptyName,
  score: z.string().min(1),
  result: z.enum(["W", "L"]),
  date: dateString,
  one80: positiveSmallInt.default(0),
});
export type StandingRecentMatch = z.infer<typeof StandingRecentMatch>;

// ─── API: Season standings response ───────────────────────────

export const StandingPlayer = z.object({
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
export type StandingPlayer = z.infer<typeof StandingPlayer>;

export const StandingsResponse = z.object({
  season: z.object({
    id: seasonId,
    name: nonEmptyName,
    isActive: z.boolean(),
  }),
  players: z.array(StandingPlayer),
});
export type StandingsResponse = z.infer<typeof StandingsResponse>;

// ─── API: Player match perspective ────────────────────────────

export const PlayerMatchPerspective = z.object({
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
export type PlayerMatchPerspective = z.infer<typeof PlayerMatchPerspective>;

// ─── API: Tournament summary ──────────────────────────────────

export const TournamentSummary = z.object({
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
export type TournamentSummary = z.infer<typeof TournamentSummary>;

// ─── API: Group standing row ──────────────────────────────────

export const GroupStandingRow = z.object({
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
export type GroupStandingRow = z.infer<typeof GroupStandingRow>;

// ─── API: Tournament match row ────────────────────────────────

export const ApiMatchRow = z.object({
  id: matchId,
  matchType: matchType,
  status: matchStatus,
  player1: PlayerSummary,
  player2: PlayerSummary,
  legsPlayer1: positiveSmallInt.nullable(),
  legsPlayer2: positiveSmallInt.nullable(),
  legsTarget: z.number().int().min(2).max(6),
  maxThrows: z.number().int().min(1),
  player1_180: positiveSmallInt,
  player2_180: positiveSmallInt,
  noShowPlayerId: playerId.nullable(),
  matchDate: dateString,
  tournamentWeek: z.number().int().min(1).max(16).nullable().optional(),
  tournamentType: tournamentType.nullable().optional(),
  groupLabel: groupLabel.nullable().optional(),
  roundName: roundName.nullable().optional(),
  sortOrder: z.number().int().min(0).nullable().optional(),
});
export type ApiMatchRow = z.infer<typeof ApiMatchRow>;

// ─── API: Tournament group (detail) ───────────────────────────

export const ApiTournamentGroup = z.object({
  label: groupLabel,
  players: z.array(PlayerSummary),
  standings: z.array(GroupStandingRow),
  matches: z.array(ApiMatchRow),
});
export type ApiTournamentGroup = z.infer<typeof ApiTournamentGroup>;

// ─── API: Playoff round ──────────────────────────────────────

export const ApiPlayoffRound = z.object({
  name: roundName,
  matches: z.array(ApiMatchRow),
});
export type ApiPlayoffRound = z.infer<typeof ApiPlayoffRound>;

// ─── API: Final standing entry ───────────────────────────────

export const ApiFinalStandingEntry = z.object({
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
export type ApiFinalStandingEntry = z.infer<typeof ApiFinalStandingEntry>;

// ─── API: Tournament detail response ──────────────────────────

export const TournamentDetailResponse = z.object({
  tournament: TournamentSummary,
  groups: z.array(ApiTournamentGroup),
  playoffs: z.array(ApiPlayoffRound),
  finalStandings: z.array(ApiFinalStandingEntry),
});
export type TournamentDetailResponse = z.infer<typeof TournamentDetailResponse>;

// ─── API: Matches response (list) ─────────────────────────────

export const ApiMatchesResponse = z.object({
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(5000),
  matches: z.array(ApiMatchRow),
});
export type ApiMatchesResponse = z.infer<typeof ApiMatchesResponse>;

// ─── API: Registrations ──────────────────────────────────────

export const ApiRegistrationEntry = z.object({
  player: PlayerSummary,
  checkedIn: z.boolean(),
  createdAt: timestamptz,
});
export type ApiRegistrationEntry = z.infer<typeof ApiRegistrationEntry>;

export const ApiRegistrationsResponse = z.object({
  registrations: z.array(ApiRegistrationEntry),
});
export type ApiRegistrationsResponse = z.infer<typeof ApiRegistrationsResponse>;
