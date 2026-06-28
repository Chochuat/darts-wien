# API Endpoints — Darts Wien

> All endpoints are Next.js App Router Route Handlers under `/api/`.
> All mock data has been removed — the app uses real API endpoints throughout.
> All read endpoints: public access (anon), RLS `FOR SELECT USING (true)`.
> All write endpoints: `auth.role() = 'authenticated'` (organizers only).

---

## Table of Contents

| Area | Endpoints |
|---|---|
| Standings | `GET /api/seasons/[id]/standings` |
| Players | `GET /api/players` · `GET /api/players/[id]` · `GET /api/players/[id]/matches` |
| Matches | `GET /api/matches` · `PATCH /api/matches/[id]` · `PATCH /api/matches/[id]/no-show` |
| Tournaments | `GET /api/tournaments` · `GET /api/tournaments/[id]` · `POST /api/tournaments` · `PATCH /api/tournaments/[id]` · `POST /api/tournaments/[id]/generate` · `POST /api/tournaments/[id]/complete` |
| Registrations | `GET /api/tournaments/[id]/registrations` · `POST /api/tournaments/[id]/registrations` · `DELETE /api/tournaments/[id]/registrations/[playerId]` · `PATCH /api/tournaments/[id]/registrations/[playerId]` |

---

## Shared Types

```typescript
interface PlayerSummary {
  id: number;
  name: string;
  slug: string;
}

interface SeasonSummary {
  id: number;
  name: string;
  isActive: boolean;
}
```

---

## Standings

### `GET /api/seasons/[id]/standings`

League season standings — computed from `matches WHERE match_type = 'league'`.

**Query params:** _(none)_

**Response `200`:**

```typescript
interface StandingsResponse {
  season: SeasonSummary;
  players: StandingPlayer[];
}

interface StandingPlayer {
  pos: number;
  playerId: number;
  name: string;
  slug: string;
  played: number;
  wins: number;
  losses: number;
  setsFor: number;
  setsAgainst: number;
  points: number;      // wins × 2
  one80s: number;      // sum of 180s across league matches
  form: ("W" | "L")[]; // last 5 results
}
```

**SQL logic:** Aggregate `matches WHERE match_type = 'league' AND season_id = X`, compute W/L from `legs_player1 > legs_player2`, sum `player1_180`/`player2_180` per player, sort by points desc → sets diff desc → wins desc.

---

## Players

### `GET /api/players`

All players in the active season.

**Response `200`:**

```typescript
interface PlayersResponse {
  players: PlayerSummary[];
}
```

**SQL:** `SELECT id, name, slug FROM players ORDER BY name`.

### `GET /api/players/[slug]`

Single player with season stats and match history.

**Response `200`:**

```typescript
interface PlayerResponse {
  player: {
    id: number;
    name: string;
    slug: string;
    pos: number;          // current season rank
    played: number;
    wins: number;
    losses: number;
    setsFor: number;
    setsAgainst: number;
    points: number;       // wins × 2
    one80s: number;
    form: ("W" | "L")[];
  };
  matches: PlayerMatchPerspective[];
}

interface PlayerMatchPerspective {
  id: number;
  opponentName: string;
  opponentSlug: string;
  score: string;          // e.g. "3-2" from this player's view
  result: "W" | "L";
  date: string;
  one80: number;          // 180s this player hit in this match
  matchType: "league" | "tournament_group" | "tournament_playoff";
  tournamentWeek?: number;
  tournamentType?: "regular" | "grand_final";
  roundName?: string;
  groupLabel?: string;
}
```

**SQL:** Find `player WHERE slug = X`. Aggregate `matches WHERE (player1_id = player.id OR player2_id = player.id)`, compute perspective per row, order by `match_date DESC`.

### `GET /api/players/[id]/matches`

Same as above but `[id]` instead of `[slug]`. Returns same `PlayerMatchPerspective[]`. Convenience for when the caller has the numeric ID.

---

## Matches

### `GET /api/matches`

Unified match search (league + tournament). Returns one row per physical match — the client computes W/L from leg scores.

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `seasonId` | number | active season | |
| `playerId` | number | — | filter by player (as p1 OR p2) |
| `matchType` | string | — | `league` | `tournament_group` | `tournament_playoff` |
| `result` | string | — | `W` or `L` (relative to `playerId`; required if `playerId` set) |
| `q` | string | — | full-text search: player names, score, date |
| `page` | number | 1 | 1-indexed |
| `limit` | number | 20 | max 100 |

**Response `200`:**

```typescript
interface MatchesResponse {
  total: number;
  page: number;
  limit: number;
  matches: MatchRow[];
}

interface MatchRow {
  id: number;
  matchType: "league" | "tournament_group" | "tournament_playoff";
  status: "pending" | "completed" | "no_show";
  player1: PlayerSummary;
  player2: PlayerSummary;
  legsPlayer1: number | null;
  legsPlayer2: number | null;
  legsTarget: number;
  maxThrows: number;
  player1_180: number;
  player2_180: number;
  noShowPlayerId: number | null;  // set when status = 'no_show'
  matchDate: string;
  tournamentWeek?: number;
  tournamentType?: "regular" | "grand_final";
  groupLabel?: string;
  roundName?: string;
  sortOrder?: number;
}
```

**Client usage:** To display W/L per player, compute `legsPlayer1 > legsPlayer2`. For the "all matches" perspective list (like current page), the client unrolls each row into two perspective rows client-side, or calls `GET /api/players/[id]/matches` for a specific player.

### `PATCH /api/matches/[id]`

Record a match result.

**Body:**

```typescript
{
  legsPlayer1: number;
  legsPlayer2: number;
  player1_180?: number;  // default 0
  player2_180?: number;  // default 0
}
```

**Validation:** `legsPlayer1 !== legsPlayer2` (no draws). `legsPlayerX` must be >= 0. At least one player must reach `legsTarget`.

**Side effects:** Sets `status = 'completed'`. Auto-completes tournament if all matches in it are now `completed` or `no_show`.

**Response `200`:** Updated `MatchRow`.

### `PATCH /api/matches/[id]/no-show`

Mark match as walkover — the absent player loses, the other player gets a default win.

**Body:**

```typescript
{
  noShowPlayerId: number;  // the player who didn't show up
}
```

**Logic:** Sets `status = 'no_show'`. Sets `no_show_player_id = noShowPlayerId`. Sets legs to `winner=legsTarget, loser=0`. `player1_180`/`player2_180` stay 0 (no darts thrown).

**Response `200`:** Updated `MatchRow`.

---

## Tournaments

### `GET /api/tournaments`

List tournaments for a season.

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `seasonId` | number | active season | |

**Response `200`:**

```typescript
interface TournamentsResponse {
  tournaments: TournamentSummary[];
}

interface TournamentSummary {
  id: number;
  weekNumber: number;
  date: string;
  type: "regular" | "grand_final";
  status: "registration" | "ready" | "in_progress" | "completed";
  winner: PlayerSummary | null;
  generationType: string | null;
  playerCount: number;       // registrations (checked_in)
  groupMatchCount: number;   // completed group matches ÷ 2
  playoffMatchCount: number; // completed playoff matches ÷ 2
  total180s: number;         // sum of all 180s in this tournament
}
```

**SQL:** Query `tournaments` left-join aggregates. `status IN ('registration','ready','in_progress','completed')` — the UI shows locker icon for `registration`/`ready`, winner + stats for `completed`.

### `GET /api/tournaments/[id]`

Full tournament detail — groups with standings, playoff rounds, final standings.

**Response `200`:**

```typescript
interface TournamentDetailResponse {
  tournament: TournamentSummary;
  groups: TournamentGroup[];
  playoffs: PlayoffRound[];
  finalStandings: FinalStandingEntry[];
}

interface TournamentGroup {
  label: string;              // "A" | "B" | "C" | "D"
  players: PlayerSummary[];
  standings: GroupStandingRow[];
  matches: MatchRow[];        // matches in this group
}

interface GroupStandingRow {
  player: PlayerSummary;
  pos: number;
  played: number;
  wins: number;
  losses: number;
  setsFor: number;
  setsAgainst: number;
  points: number;              // wins × 2
  one80s: number;
}

interface PlayoffRound {
  name: "Quarter-Finals" | "Semi-Finals" | "3rd Place" | "Final";
  matches: MatchRow[];         // ordered by sort_order
}

interface FinalStandingEntry {
  pos: number;
  player: PlayerSummary;
  played: number;
  wins: number;
  losses: number;
  setsFor: number;
  setsAgainst: number;
  groupPoints: number;
  playoffPoints: number;
  bonusPoints: number;         // one80s × 5
  totalPoints: number;         // group + playoff + bonus
  one80s: number;
}
```

**SQL:** Multi-table query: `tournaments` → `tournament_groups` → `tournament_group_players` → `matches (match_type = 'tournament_group', filtered by tournament_group_id)` → `matches (match_type = 'tournament_playoff', filtered by tournament_id)` → `tournament_final_standings`.

Grand Final (`type = 'grand_final'`): `groups` is empty array. Only `playoffs` and `finalStandings` are populated.

### `POST /api/tournaments`

Create a new tournament.

**Body:**

```typescript
{
  seasonId: number;
  weekNumber: number;
  date: string;          // "YYYY-MM-DD"
  type: "regular" | "grand_final";
  numGroups?: number;    // 2-4, null for grand_final
}
```

**Validation:** `UNIQUE(season_id, week_number)`. WeekNumber 1-16.

**Response `201`:** Created `TournamentSummary`.

### `PATCH /api/tournaments/[id]`

Update tournament metadata (date, numGroups, etc.).

**Body:** Partial of `POST /api/tournaments`. Cannot change `status` directly — use `generate` or `complete`.

### `POST /api/tournaments/[id]/generate`

Run generation algorithm: create groups, assign players, generate round-robin + playoff matches.

**Body:**

```typescript
{
  generationType: string;  // "1A_4A_8A_12A" or "1A_2A_3A_4A" (defined later)
}
```

**Side effects:**
1. Sets `tournaments.status = 'ready'`
2. Sets `tournaments.generation_type`
3. Creates rows in `tournament_groups`, `tournament_group_players`
4. Creates rows in `matches` with `status = 'pending'`, `legs_player1 = legs_player2 = NULL`
5. Only `checked_in = true` registrations are included in the draw

**Response `200`:** Updated `TournamentDetailResponse` with generated groups/playoffs.

### `POST /api/tournaments/[id]/complete`

Auto-complete tournament. Validates all matches are `completed` or `no_show`. Computes `tournament_final_standings`.

**Side effects:**
1. Sets `tournaments.status = 'completed'`
2. Sets `tournaments.winner_player_id`
3. Populates `tournament_final_standings`

**Response `200`:** `TournamentDetailResponse` with final standings.

---

## Registrations

### `GET /api/tournaments/[id]/registrations`

List players registered for a tournament.

**Response `200`:**

```typescript
interface RegistrationsResponse {
  registrations: RegistrationEntry[];
}

interface RegistrationEntry {
  player: PlayerSummary;
  checkedIn: boolean;
  createdAt: string;
}
```

### `POST /api/tournaments/[id]/registrations`

Add a player to the tournament.

**Body:**

```typescript
{
  playerId: number;
}
```

**Validation:** `UNIQUE(tournament_id, player_id)`.

**Response `201`:** `RegistrationEntry` (checkedIn defaults false).

### `DELETE /api/tournaments/[id]/registrations/[playerId]`

Remove a player from the tournament. Only allowed if `status = 'registration'`.

**Response `204`:** No content.

### `PATCH /api/tournaments/[id]/registrations/[playerId]`

Toggle check-in status.

**Body:**

```typescript
{
  checkedIn: boolean;
}
```

**Response `200`:** Updated `RegistrationEntry`.

---

## Game Leaderboard

Already exists as direct Supabase calls in `leaderboard-api.ts`. Documented here for completeness.

### `GET /api/game-throws`

**Query params:** `?limit=10`

**Response `200`:** `LeaderboardEntry[]` (`id, name, score, created_at`).

### `POST /api/game-throws`

**Body:** `{ name: string; throw: number }`

**Response `201`.**

---

## Migration Notes

### Perspective rows are client-side

The DB stores one row per physical match. For the "all matches" page which shows perspective rows (each row showing "Mike Thorn vs Dave Steel 3-0 W"), the client calls `GET /api/matches` to get raw match rows and unrolls them into perspective rows on the client. For each match, two rows are emitted: one from p1's view and one from p2's view.
