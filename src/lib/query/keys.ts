export 
/**
 * queryKeys component.
 */
const queryKeys = {
  season: {
    all: ["seasons"] as const,
    standings: (seasonId: number) => ["seasons", seasonId, "standings"] as const,
  },
  player: {
    all: ["players"] as const,
    bySlug: (slug: string) => ["players", slug] as const,
    byId: (id: number) => ["players", id] as const,
    matches: (slug: string) => ["players", slug, "matches"] as const,
  },
  match: {
    all: ["matches"] as const,
    list: (params: Record<string, string | number | undefined>) =>
      ["matches", "list", params] as const,
    detail: (id: number) => ["matches", id] as const,
  },
  tournament: {
    all: ["tournaments"] as const,
    list: (seasonId?: number) => ["tournaments", "list", seasonId] as const,
    detail: (id: number) => ["tournaments", id] as const,
    registrations: (tournamentId: number) =>
      ["tournaments", tournamentId, "registrations"] as const,
  },
};
