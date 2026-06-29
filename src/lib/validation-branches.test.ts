import { describe, it, expect } from "vitest";
import {
  MatchRow,
  MatchInsert,
  MatchResultUpdate,
  MatchNoShowUpdate,
} from "./validation";

const makeLeagueMatch = () => ({
  id: 1,
  season_id: 1,
  player1_id: 1,
  player2_id: 2,
  match_type: "league" as const,
  match_date: "2025-01-01",
  status: "pending" as const,
  legs_player1: null,
  legs_player2: null,
  tournament_id: null,
  tournament_group_id: null,
  tournament_round_name: null,
  sort_order: null,
  max_throws: 45,
  legs_target: 3,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  no_show_player_id: null,
  player1_180: 0,
  player2_180: 0,
});

const makeTourneyGroupMatch = () => ({
  ...makeLeagueMatch(),
  match_type: "tournament_group" as const,
  tournament_id: 1,
  tournament_group_id: 1,
});

const makePlayoffMatch = () => ({
  ...makeLeagueMatch(),
  match_type: "tournament_playoff" as const,
  tournament_id: 1,
  tournament_round_name: "Quarter-Finals" as const,
  sort_order: 1,
});

describe("MatchRow refine: FK/sort_order matches match_type", () => {
  it("accepts league match with null FKs", () => {
    expect(() => MatchRow.parse(makeLeagueMatch())).not.toThrow();
  });

  it("rejects league match with tournament_id set", () => {
    const m = { ...makeLeagueMatch(), tournament_id: 5 };
    expect(() => MatchRow.parse(m)).toThrow();
  });

  it("accepts tournament_group match with correct FKs", () => {
    expect(() => MatchRow.parse(makeTourneyGroupMatch())).not.toThrow();
  });

  it("rejects tournament_group match missing tournament_group_id", () => {
    const m = { ...makeTourneyGroupMatch(), tournament_group_id: null };
    expect(() => MatchRow.parse(m)).toThrow();
  });

  it("accepts tournament_playoff match with correct FKs", () => {
    expect(() => MatchRow.parse(makePlayoffMatch())).not.toThrow();
  });

  it("rejects tournament_playoff match with tournament_group_id set", () => {
    const m = { ...makePlayoffMatch(), tournament_group_id: 5 };
    expect(() => MatchRow.parse(m)).toThrow();
  });
});

describe("MatchRow refine: legs match status", () => {
  it("accepts pending match with null legs", () => {
    const m = { ...makeLeagueMatch(), status: "pending" as const };
    expect(() => MatchRow.parse(m)).not.toThrow();
  });

  it("rejects pending match with non-null legs", () => {
    const m = {
      ...makeLeagueMatch(),
      status: "pending" as const,
      legs_player1: 2,
      legs_player2: 1,
    };
    expect(() => MatchRow.parse(m)).toThrow();
  });

  it("accepts completed match with non-null legs", () => {
    const m = {
      ...makeLeagueMatch(),
      status: "completed" as const,
      legs_player1: 2,
      legs_player2: 1,
    };
    expect(() => MatchRow.parse(m)).not.toThrow();
  });

  it("rejects completed match with null legs", () => {
    const m = {
      ...makeLeagueMatch(),
      status: "completed" as const,
      legs_player1: null,
      legs_player2: null,
    };
    expect(() => MatchRow.parse(m)).toThrow();
  });

  it("accepts no_show match with non-null legs and no_show_player_id", () => {
    const m = {
      ...makeLeagueMatch(),
      status: "no_show" as const,
      legs_player1: 2,
      legs_player2: 1,
      no_show_player_id: 2,
    };
    expect(() => MatchRow.parse(m)).not.toThrow();
  });

  it("rejects no_show match without no_show_player_id", () => {
    const m = {
      ...makeLeagueMatch(),
      status: "no_show" as const,
      legs_player1: 2,
      legs_player2: 1,
      no_show_player_id: null,
    };
    expect(() => MatchRow.parse(m)).toThrow();
  });
});

describe("MatchInsert refine: FK/sort_order matches match_type", () => {
  const insertBase = {
    season_id: 1,
    player1_id: 1,
    player2_id: 2,
    match_type: "league" as const,
    match_date: "2025-01-01",
    status: "pending" as const,
    legs_player1: null,
    legs_player2: null,
    tournament_id: null,
    tournament_group_id: null,
    tournament_round_name: null,
    sort_order: null,
    max_throws: 45,
    legs_target: 3,
    no_show_player_id: null,
    player1_180: 0,
    player2_180: 0,
  };

  it("rejects same player id", () => {
    const m = { ...insertBase, player1_id: 1, player2_id: 1 };
    expect(() => MatchInsert.parse(m)).toThrow();
  });

  it("accepts valid league insert", () => {
    expect(() => MatchInsert.parse(insertBase)).not.toThrow();
  });

  it("rejects league insert with tournament_id", () => {
    const m = { ...insertBase, tournament_id: 1 };
    expect(() => MatchInsert.parse(m)).toThrow();
  });

  it("accepts tournament_group insert", () => {
    const m = {
      ...insertBase,
      match_type: "tournament_group" as const,
      tournament_id: 1,
      tournament_group_id: 1,
    };
    expect(() => MatchInsert.parse(m)).not.toThrow();
  });

  it("accepts tournament_playoff insert", () => {
    const m = {
      ...insertBase,
      match_type: "tournament_playoff" as const,
      tournament_id: 1,
      tournament_round_name: "Quarter-Finals" as const,
      sort_order: 1,
    };
    expect(() => MatchInsert.parse(m)).not.toThrow();
  });
});

describe("MatchInsert refine: legs match status", () => {
  const insertBase = {
    season_id: 1,
    player1_id: 1,
    player2_id: 2,
    match_type: "league" as const,
    match_date: "2025-01-01",
    status: "pending" as const,
    legs_player1: null,
    legs_player2: null,
    tournament_id: null,
    tournament_group_id: null,
    tournament_round_name: null,
    sort_order: null,
    max_throws: 45,
    legs_target: 3,
    no_show_player_id: null,
    player1_180: 0,
    player2_180: 0,
  };

  it("accepts pending insert with null legs", () => {
    expect(() => MatchInsert.parse(insertBase)).not.toThrow();
  });

  it("accepts completed insert with non-null legs", () => {
    const m = {
      ...insertBase,
      status: "completed" as const,
      legs_player1: 2,
      legs_player2: 1,
    };
    expect(() => MatchInsert.parse(m)).not.toThrow();
  });

  it("accepts no_show insert with all fields set", () => {
    const m = {
      ...insertBase,
      status: "no_show" as const,
      legs_player1: 2,
      legs_player2: 1,
      no_show_player_id: 2,
    };
    expect(() => MatchInsert.parse(m)).not.toThrow();
  });
});

describe("MatchResultUpdate", () => {
  it("accepts valid result update", () => {
    const validResult = {
      legs_player1: 3,
      legs_player2: 1,
      player1_180: 0,
      player2_180: 0,
    };
    expect(() => MatchResultUpdate.parse(validResult)).not.toThrow();
  });

  it("rejects negative legs", () => {
    expect(() =>
      MatchResultUpdate.parse({
        legs_player1: -1,
        legs_player2: 1,
      }),
    ).toThrow();
  });

  it("rejects missing legs_player2", () => {
    expect(() =>
      MatchResultUpdate.parse({ legs_player1: 3 }),
    ).toThrow();
  });

  it("rejects equal legs (draw)", () => {
    expect(() =>
      MatchResultUpdate.parse({
        legs_player1: 2,
        legs_player2: 2,
      }),
    ).toThrow();
  });

  it("accepts result with defaults for 180s", () => {
    const parsed = MatchResultUpdate.parse({
      legs_player1: 3,
      legs_player2: 1,
    });
    expect(parsed.player1_180).toBe(0);
    expect(parsed.player2_180).toBe(0);
  });
});

describe("MatchNoShowUpdate", () => {
  it("accepts valid no-show update", () => {
    const data = { no_show_player_id: 2 };
    expect(() => MatchNoShowUpdate.parse(data)).not.toThrow();
  });

  it("rejects missing no_show_player_id", () => {
    expect(() =>
      MatchNoShowUpdate.parse({}),
    ).toThrow();
  });
});
