import { describe, it, expect, vi } from "vitest";

const mockSupabaseClient = { mockServer: true };

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}));

const { getSupabase } = await import("./api-utils");

describe("getSupabase", () => {
  it("returns a Supabase server client", async () => {
    const client = await getSupabase();
    expect(client).toEqual({ mockServer: true });
  });
});
