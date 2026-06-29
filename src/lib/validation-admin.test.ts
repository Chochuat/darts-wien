import { describe, it, expect } from "vitest";
import {
  ProfileRow,
  ProfileUpdateBody,
  LoginBody,
  SignupBody,
  ForgotPasswordBody,
  ResetPasswordBody,
  TournamentFormatRow,
  TournamentFormatBody,
  ClubSettingsRow,
  ClubSettingsBody,
  StandingsSnapshotRow,
  TournamentGenerateBody,
  SeedPlayoffsBody,
  AdminSessionResponse,
} from "./validation";

describe("ProfileRow", () => {
  it("accepts a valid profile row", () => {
    const data = {
      user_id: "12345678-1234-1234-89ab-123456789012",
      role: "admin",
      player_id: 5,
      display_name: "Alice",
      created_at: "2025-01-01T00:00:00Z",
    };
    expect(ProfileRow.parse(data)).toEqual({ ...data, player_id: 5 });
  });

  it("accepts a profile with null player_id", () => {
    const data = {
      user_id: "12345678-1234-1234-89ab-123456789012",
      role: "scorekeeper",
      player_id: null,
      display_name: null,
      created_at: "2025-01-01T00:00:00Z",
    };
    expect(ProfileRow.parse(data)).toEqual(data);
  });

  it("rejects an invalid role", () => {
    expect(() =>
      ProfileRow.parse({
        user_id: "12345678-1234-1234-89ab-123456789012",
        role: "superadmin",
        player_id: null,
        display_name: null,
        created_at: "2025-01-01T00:00:00Z",
      }),
    ).toThrow();
  });
});

describe("ProfileUpdateBody", () => {
  it("accepts a partial role update", () => {
    expect(ProfileUpdateBody.parse({ role: "admin" })).toEqual({ role: "admin" });
  });

  it("accepts linking a player", () => {
    expect(ProfileUpdateBody.parse({ playerId: 3 })).toEqual({ playerId: 3 });
  });

  it("accepts unlinking a player (null)", () => {
    expect(ProfileUpdateBody.parse({ playerId: null })).toEqual({ playerId: null });
  });

  it("rejects an invalid role", () => {
    expect(() => ProfileUpdateBody.parse({ role: "superadmin" })).toThrow();
  });
});

describe("LoginBody", () => {
  it("accepts a valid email + password", () => {
    expect(LoginBody.parse({ email: "a@b.com", password: "secret" })).toEqual({
      email: "a@b.com",
      password: "secret",
    });
  });

  it("rejects an invalid email", () => {
    expect(() => LoginBody.parse({ email: "not-an-email", password: "x" })).toThrow();
  });

  it("rejects missing password", () => {
    expect(() => LoginBody.parse({ email: "a@b.com" })).toThrow();
  });
});

describe("SignupBody", () => {
  it("accepts a valid signup", () => {
    expect(
      SignupBody.parse({ email: "a@b.com", password: "longpass", displayName: "Bob" }),
    ).toEqual({ email: "a@b.com", password: "longpass", displayName: "Bob" });
  });

  it("rejects a short password (<8)", () => {
    expect(() =>
      SignupBody.parse({ email: "a@b.com", password: "short" }),
    ).toThrow();
  });

  it("accepts signup without displayName", () => {
    const parsed = SignupBody.parse({ email: "a@b.com", password: "longpass" });
    expect(parsed.displayName).toBeUndefined();
  });
});

describe("ForgotPasswordBody", () => {
  it("accepts a valid email", () => {
    expect(ForgotPasswordBody.parse({ email: "a@b.com" })).toEqual({ email: "a@b.com" });
  });

  it("rejects an invalid email", () => {
    expect(() => ForgotPasswordBody.parse({ email: "nope" })).toThrow();
  });
});

describe("ResetPasswordBody", () => {
  it("accepts a valid password", () => {
    expect(ResetPasswordBody.parse({ password: "newpassword" })).toEqual({
      password: "newpassword",
    });
  });

  it("rejects a short password", () => {
    expect(() => ResetPasswordBody.parse({ password: "123" })).toThrow();
  });
});

describe("TournamentFormatRow", () => {
  it("accepts a valid row", () => {
    const data = {
      tournament_id: 1,
      phase: "group",
      legs_target: 2,
      starting_score: 501,
      max_throws: 45,
    };
    expect(TournamentFormatRow.parse(data)).toEqual(data);
  });

  it("rejects an invalid phase", () => {
    expect(() =>
      TournamentFormatRow.parse({
        tournament_id: 1,
        phase: "banana",
        legs_target: 2,
        starting_score: 501,
        max_throws: 45,
      }),
    ).toThrow();
  });

  it("rejects legs_target out of range", () => {
    expect(() =>
      TournamentFormatRow.parse({
        tournament_id: 1,
        phase: "group",
        legs_target: 0,
        starting_score: 501,
        max_throws: 45,
      }),
    ).toThrow();
  });
});

describe("TournamentFormatBody", () => {
  it("accepts a non-empty entries array", () => {
    const body = {
      entries: [
        { phase: "group", legsTarget: 2, startingScore: 501, maxThrows: 45 },
        { phase: "playoff", legsTarget: 3 },
      ],
    };
    const parsed = TournamentFormatBody.parse(body);
    expect(parsed.entries).toHaveLength(2);
  });

  it("rejects an empty entries array", () => {
    expect(() => TournamentFormatBody.parse({ entries: [] })).toThrow();
  });
});

describe("ClubSettingsRow", () => {
  it("accepts a valid row", () => {
    const data = {
      id: 1,
      tiebreaker_order: ["head_to_head", "leg_diff", "legs_won", "legs_lost", "one80s"],
      updated_at: "2025-01-01T00:00:00Z",
    };
    expect(ClubSettingsRow.parse(data)).toEqual(data);
  });
});

describe("ClubSettingsBody", () => {
  it("accepts all five dimensions reordered", () => {
    const order = ["one80s", "legs_won", "leg_diff", "legs_lost", "head_to_head"];
    expect(ClubSettingsBody.parse({ tiebreakerOrder: order }).tiebreakerOrder).toEqual(order);
  });

  it("rejects fewer than five dimensions", () => {
    expect(() =>
      ClubSettingsBody.parse({ tiebreakerOrder: ["head_to_head", "leg_diff"] }),
    ).toThrow();
  });

  it("rejects duplicate dimensions", () => {
    expect(() =>
      ClubSettingsBody.parse({
        tiebreakerOrder: ["head_to_head", "head_to_head", "legs_won", "legs_lost", "one80s"],
      }),
    ).toThrow();
  });

  it("rejects an invalid dimension", () => {
    expect(() =>
      ClubSettingsBody.parse({
        tiebreakerOrder: ["foo", "leg_diff", "legs_won", "legs_lost", "one80s"],
      }),
    ).toThrow();
  });
});

describe("StandingsSnapshotRow", () => {
  it("accepts a valid row", () => {
    const data = {
      tournament_id: 1,
      player_id: 5,
      rank: 3,
      points: 10,
      leg_diff: 4,
      legs_won: 8,
      legs_lost: 4,
      one80s: 2,
    };
    expect(StandingsSnapshotRow.parse(data)).toEqual(data);
  });

  it("rejects rank < 1", () => {
    expect(() =>
      StandingsSnapshotRow.parse({ tournament_id: 1, player_id: 5, rank: 0 }),
    ).toThrow();
  });
});

describe("TournamentGenerateBody (admin)", () => {
  it("accepts snake with numGroups", () => {
    expect(
      TournamentGenerateBody.parse({ generationType: "snake", numGroups: 3 }),
    ).toEqual({ generationType: "snake", numGroups: 3 });
  });

  it("rejects numGroups out of range", () => {
    expect(() =>
      TournamentGenerateBody.parse({ generationType: "snake", numGroups: 5 }),
    ).toThrow();
  });

  it("accepts manual with manualAssignments and manualExtraMatches", () => {
    expect(() =>
      TournamentGenerateBody.parse({
        generationType: "manual",
        numGroups: 2,
        manualAssignments: [
          { playerId: 1, groupLabel: "A" },
          { playerId: 2, groupLabel: "B" },
        ],
        manualExtraMatches: [{ player1Id: 1, player2Id: 3, groupLabel: "A" }],
      }),
    ).not.toThrow();
  });

  it("rejects manualExtraMatch with same player ids", () => {
    expect(() =>
      TournamentGenerateBody.parse({
        generationType: "manual",
        numGroups: 2,
        manualAssignments: [{ playerId: 1, groupLabel: "A" }],
        manualExtraMatches: [{ player1Id: 1, player2Id: 1, groupLabel: "A" }],
      }),
    ).toThrow();
  });
});

describe("SeedPlayoffsBody", () => {
  const makeAdvancements = () =>
    Array.from({ length: 8 }, (_, i) => ({ playerId: i + 1, seedPosition: i + 1 }));

  it("accepts 8 unique advancements", () => {
    expect(() => SeedPlayoffsBody.parse({ advancements: makeAdvancements() })).not.toThrow();
  });

  it("rejects fewer than 8 advancements", () => {
    expect(() =>
      SeedPlayoffsBody.parse({ advancements: makeAdvancements().slice(0, 7) }),
    ).toThrow();
  });

  it("rejects duplicate seed positions", () => {
    const adv = makeAdvancements();
    adv[7] = { playerId: 8, seedPosition: 1 };
    expect(() => SeedPlayoffsBody.parse({ advancements: adv })).toThrow();
  });

  it("rejects duplicate player ids", () => {
    const adv = makeAdvancements();
    adv[7] = { playerId: 1, seedPosition: 8 };
    expect(() => SeedPlayoffsBody.parse({ advancements: adv })).toThrow();
  });

  it("rejects seed position out of range", () => {
    const adv = makeAdvancements();
    adv[0] = { playerId: 1, seedPosition: 9 };
    expect(() => SeedPlayoffsBody.parse({ advancements: adv })).toThrow();
  });
});

describe("AdminSessionResponse", () => {
  it("accepts a valid admin session", () => {
    const data = {
      userId: "12345678-1234-1234-89ab-123456789012",
      role: "admin",
      playerId: 3,
      displayName: "Alice",
    };
    expect(AdminSessionResponse.parse(data)).toEqual(data);
  });

  it("accepts a scorekeeper session with null playerId", () => {
    const data = {
      userId: "12345678-1234-1234-89ab-123456789012",
      role: "scorekeeper",
      playerId: null,
      displayName: null,
    };
    expect(AdminSessionResponse.parse(data)).toEqual(data);
  });
});
