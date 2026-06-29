import { describe, it, expect, vi } from "vitest";
import type { NextResponse } from "next/server";

const mockGetUser = vi.fn();
const mockMaybeSingle = vi.fn();
const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}));

const { getSessionProfile, requireAdmin, requireAdminOrScorekeeper, isAuthError } =
  await import("./api-utils");

function setSession(user: { id: string } | null) {
  mockGetUser.mockResolvedValue({ data: { user } });
}

function setProfile(profile: Record<string, unknown> | null) {
  mockMaybeSingle.mockResolvedValue({ data: profile });
}

describe("getSessionProfile", () => {
  it("returns null when no session", async () => {
    setSession(null);
    const result = await getSessionProfile();
    expect(result).toBeNull();
  });

  it("returns null when no profile row", async () => {
    setSession({ id: "u1" });
    setProfile(null);
    const result = await getSessionProfile();
    expect(result).toBeNull();
  });

  it("returns the profile when session + row exist", async () => {
    setSession({ id: "u1" });
    setProfile({
      user_id: "u1",
      role: "admin",
      player_id: 5,
      display_name: "Alice",
    });
    const result = await getSessionProfile();
    expect(result).toEqual({
      userId: "u1",
      role: "admin",
      playerId: 5,
      displayName: "Alice",
    });
  });

  it("normalises null player_id and display_name", async () => {
    setSession({ id: "u2" });
    setProfile({ user_id: "u2", role: "scorekeeper", player_id: null, display_name: null });
    const result = await getSessionProfile();
    expect(result).toEqual({
      userId: "u2",
      role: "scorekeeper",
      playerId: null,
      displayName: null,
    });
  });
});

describe("requireAdmin", () => {
  it("returns 401 when no session", async () => {
    setSession(null);
    const result = await requireAdmin();
    expect(isAuthError(result)).toBe(true);
    expect((result as NextResponse).status).toBe(401);
  });

  it("returns 403 when role is scorekeeper", async () => {
    setSession({ id: "u1" });
    setProfile({ user_id: "u1", role: "scorekeeper", player_id: null, display_name: null });
    const result = await requireAdmin();
    expect(isAuthError(result)).toBe(true);
    expect((result as NextResponse).status).toBe(403);
  });

  it("returns the profile when role is admin", async () => {
    setSession({ id: "u1" });
    setProfile({ user_id: "u1", role: "admin", player_id: 2, display_name: "Bob" });
    const result = await requireAdmin();
    expect(isAuthError(result)).toBe(false);
    expect((result as { role: string }).role).toBe("admin");
  });
});

describe("requireAdminOrScorekeeper", () => {
  it("returns 401 when no session", async () => {
    setSession(null);
    const result = await requireAdminOrScorekeeper();
    expect(isAuthError(result)).toBe(true);
    expect((result as NextResponse).status).toBe(401);
  });

  it("returns 403 when role is pending", async () => {
    setSession({ id: "u1" });
    setProfile({ user_id: "u1", role: "pending", player_id: null, display_name: null });
    const result = await requireAdminOrScorekeeper();
    expect(isAuthError(result)).toBe(true);
    expect((result as NextResponse).status).toBe(403);
  });

  it("returns the profile when role is scorekeeper", async () => {
    setSession({ id: "u1" });
    setProfile({ user_id: "u1", role: "scorekeeper", player_id: null, display_name: null });
    const result = await requireAdminOrScorekeeper();
    expect(isAuthError(result)).toBe(false);
  });

  it("returns the profile when role is admin", async () => {
    setSession({ id: "u1" });
    setProfile({ user_id: "u1", role: "admin", player_id: null, display_name: null });
    const result = await requireAdminOrScorekeeper();
    expect(isAuthError(result)).toBe(false);
  });
});
