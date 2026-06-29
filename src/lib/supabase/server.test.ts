import { describe, it, expect, vi } from "vitest";

const mockCreateServerClient = vi.fn(() => ({ mockServer: true }));

vi.mock("@supabase/ssr", () => ({
  createServerClient: mockCreateServerClient,
}));

const { createClient } = await import("./server");

describe("supabase server client", () => {
  it("creates a server client with cookie store and handles setAll/getAll", () => {
    const getAllSpy = vi.fn(() => [{ name: "test", value: "val" }]);
    const setSpy = vi.fn();
    const mockCookieStore = {
      getAll: getAllSpy,
      set: setSpy,
    };

    const client = createClient(mockCookieStore as Parameters<typeof createClient>[0]);
    expect(client).toEqual({ mockServer: true });

    const config = mockCreateServerClient.mock.calls[0]?.[2];
    expect(config).toBeDefined();

    // Test getAll callback
    const cookies = config.cookies.getAll();
    expect(getAllSpy).toHaveBeenCalled();
    expect(cookies).toEqual([{ name: "test", value: "val" }]);

    // Test setAll callback
    config.cookies.setAll([{ name: "key", value: "data", options: { path: "/" } }]);
    expect(setSpy).toHaveBeenCalledWith("key", "data", { path: "/" });
  });

  it("handles setAll error gracefully (Server Component scenario)", () => {
    const setSpy = vi.fn(() => { throw new Error("read-only cookie store"); });
    const mockCookieStore = {
      getAll: vi.fn(() => []),
      set: setSpy,
    };

    const client = createClient(mockCookieStore as Parameters<typeof createClient>[0]);
    expect(client).toEqual({ mockServer: true });

    const config = mockCreateServerClient.mock.calls[1]?.[2];

    expect(() => {
      config.cookies.setAll([{ name: "key", value: "data", options: {} }]);
    }).not.toThrow();
  });
});
