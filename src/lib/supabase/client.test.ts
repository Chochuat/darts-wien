import { describe, it, expect, vi } from "vitest";

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => ({ mockBrowser: true })),
}));

const { createClient } = await import("./client");

describe("supabase browser client", () => {
  it("creates a browser client", () => {
    const client = createClient();
    expect(client).toEqual({ mockBrowser: true });
  });
});
