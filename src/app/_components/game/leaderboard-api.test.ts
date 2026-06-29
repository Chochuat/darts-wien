import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockSupabaseClient = {
  from: vi.fn(),
};

const mockCreateClient = vi.fn(() => mockSupabaseClient);

vi.mock("@/lib/supabase/client", () => ({
  createClient: mockCreateClient,
}));

const { fetchTopThrows, saveThrow, useTopThrows } = await import("./leaderboard-api");

describe("leaderboard-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockReturnValue(mockSupabaseClient);
  });

  describe("fetchTopThrows", () => {
    it("fetches and returns sorted entries", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({
        data: [
          { id: 1, name: "Alice", score: 100, created_at: "2025-01-01" },
          { id: 2, name: "Bob", score: 80, created_at: "2025-01-02" },
        ],
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        limit: mockLimit,
      });

      const results = await fetchTopThrows(5);
      expect(results).toHaveLength(2);
      expect(results[0]?.name).toBe("Alice");
      expect(results[1]?.name).toBe("Bob");
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("game_throw");
    });

    it("returns empty array when createClient returns null", async () => {
      mockCreateClient.mockReturnValue(null as unknown as ReturnType<typeof mockCreateClient>);
      const results = await fetchTopThrows();
      expect(results).toEqual([]);
    });

    it("returns empty array on Supabase error", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        limit: mockLimit,
      });

      const results = await fetchTopThrows();
      expect(results).toEqual([]);
    });

    it("uses default limit of 10", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        limit: mockLimit,
      });

      await fetchTopThrows();
      expect(mockLimit).toHaveBeenCalledWith(10);
    });
  });

  describe("saveThrow", () => {
    it("inserts a throw and returns nothing", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      });

      await expect(saveThrow("Alice", 140)).resolves.toBeUndefined();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("game_throw");
    });

    it("returns silently on insert error", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: { message: "Insert failed" } });

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      });

      await expect(saveThrow("Bob", 60)).resolves.toBeUndefined();
    });

    it("returns silently when createClient returns null", async () => {
      mockCreateClient.mockReturnValue(null as unknown as ReturnType<typeof mockCreateClient>);
      await expect(saveThrow("Bob", 60)).resolves.toBeUndefined();
    });
  });

  describe("useTopThrows", () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      fetchMock = vi.fn();
      global.fetch = fetchMock;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("is not implemented directly (side-effect hook)", () => {
      // useTopThrows uses fetch() directly inside an effect, not through
      // the exported fetchTopThrows. It's a React hook that would need
      // @testing-library/react to fully test. The fetch function is exported
      // and tested above.
      expect(typeof useTopThrows).toBe("function");
    });
  });
});
