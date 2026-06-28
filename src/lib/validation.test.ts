import { describe, it, expect } from "vitest";
import {
  SeasonRow,
  SeasonInsert,
  PlayerRow,
  PlayerInsert,
  SeasonPlayerRow,
  TournamentRow,
  TournamentInsert,
  TournamentRegistrationRow,
  TournamentGroupRow,
  TournamentGroupPlayerRow,
  MatchInsert,
  TournamentFinalStandingRow,
  GameThrowRow,
  GameThrowInsert,
  StandingsResponse,
  PlayerMatchPerspective,
  TournamentSummary,
  ApiMatchRow,
  MatchResultUpdate,
  MatchNoShowUpdate,
} from "./validation";

describe("Season schemas", () => {
  it("accepts a valid season row", () => {
    const data = {
      id: 1,
      name: "Season 2 – 2025",
      start_date: "2025-09-18",
      end_date: "2026-01-15",
      is_active: true,
      created_at: "2025-09-18T00:00:00+00:00",
    };
    expect(SeasonRow.parse(data)).toEqual(data);
  });

  it("accepts a valid season insert", () => {
    const data = {
      name: "Season 2 – 2025",
      start_date: "2025-09-18",
      end_date: "2026-01-15",
      is_active: true,
    };
    expect(SeasonInsert.parse(data)).toEqual(data);
  });

  it("rejects an insert with missing name", () => {
    expect(() =>
      SeasonInsert.parse({ start_date: "2025-09-18", end_date: "2026-01-15" }),
    ).toThrow();
  });
});

describe("Player schemas", () => {
  it("accepts a valid player row with slug auto-generated", () => {
    const data = {
      id: 1,
      name: "Mike Thorn",
      slug: "mike-thorn",
      created_at: "2025-09-18T00:00:00+00:00",
    };
    expect(PlayerRow.parse(data)).toEqual(data);
  });

  it("accepts a valid player insert (no slug needed)", () => {
    const data = { name: "Mike Thorn" };
    expect(PlayerInsert.parse(data)).toEqual(data);
  });
});

describe("Tournament schemas", () => {
  it("accepts a valid regular tournament row", () => {
    const data = {
      id: 1,
      season_id: 1,
      week_number: 1,
      date: "2025-09-18",
      type: "regular",
      status: "completed",
      generation_type: "1A_4A_8A_12A",
      num_groups: 4,
      winner_player_id: 1,
      created_at: "2025-09-18T00:00:00+00:00",
    };
    expect(TournamentRow.parse(data)).toEqual(data);
  });

  it("accepts a grand final tournament (null num_groups)", () => {
    const data = {
      id: 16,
      season_id: 1,
      week_number: 16,
      date: "2026-01-15",
      type: "grand_final",
      status: "completed",
      generation_type: "GF_1v8",
      num_groups: null,
      winner_player_id: 1,
      created_at: "2026-01-15T00:00:00+00:00",
    };
    expect(TournamentRow.parse(data)).toEqual(data);
  });

  it("rejects a grand_final insert with num_groups set", () => {
    expect(() =>
      TournamentInsert.parse({
        season_id: 1,
        week_number: 16,
        date: "2026-01-15",
        type: "grand_final",
        num_groups: 4,
      }),
    ).toThrow();
  });
});

describe("Match schemas - structural integrity", () => {
  it("accepts a valid league match", () => {
    const data = {
      season_id: 1,
      player1_id: 1,
      player2_id: 2,
      status: "completed",
      legs_player1: 3,
      legs_player2: 1,
      legs_target: 3,
      max_throws: 45,
      player1_180: 1,
      player2_180: 0,
      no_show_player_id: null,
      match_type: "league",
      tournament_id: null,
      tournament_group_id: null,
      tournament_round_name: null,
      sort_order: null,
      match_date: "2025-09-18",
    };
    expect(MatchInsert.parse(data)).toEqual(data);
  });

  it("accepts a valid tournament group match", () => {
    const data = {
      season_id: 1,
      player1_id: 1,
      player2_id: 5,
      status: "completed",
      legs_player1: 2,
      legs_player2: 1,
      legs_target: 2,
      max_throws: 45,
      player1_180: 0,
      player2_180: 0,
      no_show_player_id: null,
      match_type: "tournament_group",
      tournament_id: 1,
      tournament_group_id: 1,
      tournament_round_name: null,
      sort_order: null,
      match_date: "2025-09-18",
    };
    expect(MatchInsert.parse(data)).toEqual(data);
  });

  it("accepts a valid tournament playoff match", () => {
    const data = {
      season_id: 1,
      player1_id: 1,
      player2_id: 8,
      status: "completed",
      legs_player1: 3,
      legs_player2: 1,
      legs_target: 3,
      max_throws: 45,
      player1_180: 0,
      player2_180: 0,
      no_show_player_id: null,
      match_type: "tournament_playoff",
      tournament_id: 1,
      tournament_group_id: null,
      tournament_round_name: "Quarter-Finals",
      sort_order: 0,
      match_date: "2025-09-18",
    };
    expect(MatchInsert.parse(data)).toEqual(data);
  });

  it("accepts a pending match with null legs", () => {
    const data = {
      season_id: 1,
      player1_id: 1,
      player2_id: 2,
      status: "pending",
      legs_player1: null,
      legs_player2: null,
      legs_target: 3,
      max_throws: 45,
      player1_180: 0,
      player2_180: 0,
      no_show_player_id: null,
      match_type: "league",
      tournament_id: null,
      tournament_group_id: null,
      tournament_round_name: null,
      sort_order: null,
      match_date: "2025-09-18",
    };
    expect(MatchInsert.parse(data)).toEqual(data);
  });

  it("rejects same player match", () => {
    expect(() =>
      MatchInsert.parse({
        season_id: 1,
        player1_id: 1,
        player2_id: 1,
        status: "pending",
        legs_player1: null,
        legs_player2: null,
        legs_target: 3,
        max_throws: 45,
        player1_180: 0,
        player2_180: 0,
        no_show_player_id: null,
        match_type: "league",
        tournament_id: null,
        tournament_group_id: null,
        tournament_round_name: null,
        sort_order: null,
        match_date: "2025-09-18",
      }),
    ).toThrow();
  });

  it("rejects league match with tournament_id set", () => {
    expect(() =>
      MatchInsert.parse({
        season_id: 1,
        player1_id: 1,
        player2_id: 2,
        status: "completed",
        legs_player1: 3,
        legs_player2: 1,
        legs_target: 3,
        max_throws: 45,
        player1_180: 0,
        player2_180: 0,
        no_show_player_id: null,
        match_type: "league",
        tournament_id: 1,
        tournament_group_id: null,
        tournament_round_name: null,
        sort_order: null,
        match_date: "2025-09-18",
      }),
    ).toThrow();
  });

  it("rejects completed match with null legs", () => {
    expect(() =>
      MatchInsert.parse({
        season_id: 1,
        player1_id: 1,
        player2_id: 2,
        status: "completed",
        legs_player1: null,
        legs_player2: null,
        legs_target: 3,
        max_throws: 45,
        player1_180: 0,
        player2_180: 0,
        no_show_player_id: null,
        match_type: "league",
        tournament_id: null,
        tournament_group_id: null,
        tournament_round_name: null,
        sort_order: null,
        match_date: "2025-09-18",
      }),
    ).toThrow();
  });
});

describe("MatchResultUpdate", () => {
  it("accepts valid result update", () => {
    expect(
      MatchResultUpdate.parse({
        legs_player1: 3,
        legs_player2: 1,
      }),
    ).toEqual({ legs_player1: 3, legs_player2: 1, player1_180: 0, player2_180: 0 });
  });

  it("rejects draw (equal legs)", () => {
    expect(() =>
      MatchResultUpdate.parse({ legs_player1: 2, legs_player2: 2 }),
    ).toThrow();
  });

  it("rejects zero legs for both", () => {
    expect(() =>
      MatchResultUpdate.parse({ legs_player1: 0, legs_player2: 0 }),
    ).toThrow();
  });
});

describe("MatchNoShowUpdate", () => {
  it("accepts valid no-show update", () => {
    expect(
      MatchNoShowUpdate.parse({ no_show_player_id: 1 }),
    ).toEqual({ no_show_player_id: 1 });
  });
});

describe("Standings response schema", () => {
  it("validates a minimum standings response", () => {
    const data = {
      season: { id: 1, name: "Season 2 – 2025", isActive: true },
      players: [
        {
          pos: 1,
          playerId: 1,
          name: "Mike Thorn",
          slug: "mike-thorn",
          played: 19,
          wins: 19,
          losses: 0,
          setsFor: 57,
          setsAgainst: 0,
          points: 38,
          one80s: 2,
          form: ["W", "W", "W", "W", "W"] as ("W" | "L")[],
          recentMatches: [],
        },
      ],
    };
    expect(StandingsResponse.parse(data)).toEqual(data);
  });

  it("rejects negative points", () => {
    expect(() =>
      StandingsResponse.parse({
        season: { id: 1, name: "Season", isActive: true },
        players: [
          {
            pos: 1,
            playerId: 1,
            name: "Player",
            slug: "player",
            played: 1,
            wins: 0,
            losses: 1,
            setsFor: 0,
            setsAgainst: 3,
            points: -1,
            one80s: 0,
            form: ["L"],
          },
        ],
      }),
    ).toThrow();
  });
});

describe("Player match perspective", () => {
  it("validates a tournament match perspective", () => {
    const data = {
      id: 100,
      opponentName: "Dave Steel",
      opponentSlug: "dave-steel",
      score: "3-1",
      result: "W" as const,
      date: "2025-09-18",
      one80: 1,
      matchType: "league" as const,
      tournamentWeek: 1,
      tournamentType: "regular" as const,
    };
    expect(PlayerMatchPerspective.parse(data)).toEqual(data);
  });
});

describe("TournamentSummary", () => {
  it("validates a completed tournament summary", () => {
    const data = {
      id: 1,
      weekNumber: 1,
      date: "2025-09-18",
      type: "regular" as const,
      status: "completed" as const,
      winner: { id: 1, name: "Mike Thorn", slug: "mike-thorn" },
      generationType: "1A_4A_8A_12A",
      playerCount: 20,
      groupMatchCount: 40,
      playoffMatchCount: 8,
      total180s: 3,
    };
    expect(TournamentSummary.parse(data)).toEqual(data);
  });

  it("validates with null winner", () => {
    const data = {
      id: 1,
      weekNumber: 1,
      date: "2025-09-18",
      type: "regular" as const,
      status: "registration" as const,
      winner: null,
      generationType: null,
      playerCount: 0,
      groupMatchCount: 0,
      playoffMatchCount: 0,
      total180s: 0,
    };
    expect(TournamentSummary.parse(data)).toEqual(data);
  });
});

describe("ApiMatchRow", () => {
  it("validates a tournament playoff match row", () => {
    const data = {
      id: 100,
      matchType: "tournament_playoff" as const,
      status: "completed" as const,
      player1: { id: 1, name: "Mike Thorn", slug: "mike-thorn" },
      player2: { id: 8, name: "Pete Hammer", slug: "pete-hammer" },
      legsPlayer1: 3,
      legsPlayer2: 1,
      legsTarget: 3,
      maxThrows: 45,
      player1_180: 0,
      player2_180: 0,
      noShowPlayerId: null,
      matchDate: "2025-09-18",
      roundName: "Quarter-Finals" as const,
      sortOrder: 0,
    };
    expect(ApiMatchRow.parse(data)).toEqual(data);
  });
});

describe("GameThrow", () => {
  it("accepts valid game throw insert", () => {
    expect(GameThrowInsert.parse({ name: "Mike", throw: 42 })).toEqual({
      name: "Mike",
      throw: 42,
    });
  });

  it("accepts valid game throw row", () => {
    const data = {
      id: 1,
      name: "Mike",
      throw: 42,
      created_at: "2025-09-18T00:00:00+00:00",
    };
    expect(GameThrowRow.parse(data)).toEqual(data);
  });

  it("rejects negative throw", () => {
    expect(() => GameThrowInsert.parse({ name: "Mike", throw: -1 })).toThrow();
  });
});

describe("DB row schemas", () => {
  it("validates SeasonPlayerRow", () => {
    expect(SeasonPlayerRow.parse({ id: 1, season_id: 1, player_id: 1 })).toEqual({
      id: 1,
      season_id: 1,
      player_id: 1,
    });
  });

  it("validates TournamentRegistrationRow", () => {
    const data = {
      id: 1,
      tournament_id: 1,
      player_id: 1,
      checked_in: true,
      created_at: "2025-09-18T00:00:00+00:00",
    };
    expect(TournamentRegistrationRow.parse(data)).toEqual(data);
  });

  it("validates TournamentGroupRow", () => {
    expect(TournamentGroupRow.parse({ id: 1, tournament_id: 1, label: "A" })).toEqual({
      id: 1,
      tournament_id: 1,
      label: "A",
    });
  });

  it("validates TournamentGroupPlayerRow", () => {
    expect(
      TournamentGroupPlayerRow.parse({ id: 1, group_id: 1, player_id: 1 }),
    ).toEqual({ id: 1, group_id: 1, player_id: 1 });
  });

  it("validates TournamentFinalStandingRow", () => {
    const data = {
      id: 1,
      tournament_id: 1,
      player_id: 1,
      position: 1,
      played: 3,
      wins: 3,
      losses: 0,
      sets_for: 12,
      sets_against: 6,
      one80s: 1,
      group_points: 8,
      playoff_points: 10,
      bonus_points: 5,
      total_points: 23,
    };
    expect(TournamentFinalStandingRow.parse(data)).toEqual(data);
  });
});
