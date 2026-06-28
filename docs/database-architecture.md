# Database Architecture — Darts Wien

> Type-domain design for Supabase (PostgreSQL 15+).

---

## 1. Match Type Domain — Answering Your Question

The codebase has exactly **3 distinct match families** — not 5 or 6:

| `match_type` | What is it? | Does it have a playoff? | Does it have a final? | 3rd place? |
|---|---|---|---|---|
| `'league'` | Season-long league schedule (standingsData) | **No.** Season champion = most aggregate points. No bracket. | **No.** | **No.** |
| `'tournament_group'` | Weekly tournament group stage (round-robin) | No — this IS the group phase that feeds the playoff | N/A | N/A |
| `'tournament_playoff'` | Any knockout match (QF/SF/3rd/Final) in any tournament | **Yes** — same column, disambiguated by `tournament_round_name` | `'Final'` | `'3rd Place'` |

**All 3 are covered. There is no "league playoff" concept in the rules or data.** The season standings determine the champion; the Grand Final (tournament #16 with `type = 'grand_final'`) is a separate playoff-only tournament. Tournaments follow a lifecycle: `registration` → `ready` (generated) → `in_progress` → `completed` (auto-closed when all matches filled).

Within `tournament_playoff`, the round name + tournament type gives full context:

| Actual scenario | `match_type` | `tournament_round_name` | `tournaments.type` |
|---|---|---|---|
| Regular tournament QF | `tournament_playoff` | `'Quarter-Finals'` | `'regular'` |
| Regular tournament SF | `tournament_playoff` | `'Semi-Finals'` | `'regular'` |
| Regular tournament 3rd | `tournament_playoff` | `'3rd Place'` | `'regular'` |
| Regular tournament Final | `tournament_playoff` | `'Final'` | `'regular'` |
| Grand Final QF | `tournament_playoff` | `'Quarter-Finals'` | `'grand_final'` |
| Grand Final SF | `tournament_playoff` | `'Semi-Finals'` | `'grand_final'` |
| Grand Final 3rd | `tournament_playoff` | `'3rd Place'` | `'grand_final'` |
| Grand Final Final | `tournament_playoff` | `'Final'` | `'grand_final'` |

---

## 2. Full Schema — With Type Domains

### `seasons`

| Column | PostgreSQL type | Value domain / CHECK | Notes |
|---|---|---|---|
| `id` | `bigint` | `PK GENERATED ALWAYS AS IDENTITY` | |
| `name` | `text` | `NOT NULL` | `'Season 2 – 2025'` |
| `start_date` | `date` | `NOT NULL` | |
| `end_date` | `date` | `NOT NULL` | |
| `is_active` | `boolean` | `NOT NULL DEFAULT false` | exactly one active |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT now()` | |

### `players`

| Column | Type | Domain | Notes |
|---|---|---|---|
| `id` | `bigint` | `PK GENERATED ALWAYS AS IDENTITY` | |
| `name` | `text` | `NOT NULL UNIQUE` | `'Mike Thorn'` |
| `slug` | `text` | `NOT NULL UNIQUE` `GENERATED ALWAYS AS (lower(replace(name, ' ', '-'))) STORED` | auto: `'mike-thorn'` |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT now()` | |

### `season_players`

| Column | Type | Domain | Notes |
|---|---|---|---|
| `id` | `bigint` | `PK GENERATED ALWAYS AS IDENTITY` | |
| `season_id` | `bigint` | `NOT NULL → seasons(id) ON DELETE CASCADE` | |
| `player_id` | `bigint` | `NOT NULL → players(id) ON DELETE CASCADE` | |
| | | `UNIQUE(season_id, player_id)` | one row per player per season |

### `tournaments`

| Column | Type | Domain / CHECK | Notes |
|---|---|---|---|
| `id` | `bigint` | `PK GENERATED ALWAYS AS IDENTITY` | |
| `season_id` | `bigint` | `NOT NULL → seasons(id) ON DELETE CASCADE` | |
| `week_number` | `smallint` | `NOT NULL CHECK (week_number BETWEEN 1 AND 16)` | 1-15 regular, 16 grand final |
| `date` | `date` | `NOT NULL` | always a Thursday |
| `type` | `text` | `NOT NULL CHECK (type IN ('regular','grand_final'))` | `DEFAULT 'regular'` |
| `status` | `text` | `NOT NULL CHECK (status IN ('registration','ready','in_progress','completed'))` | `DEFAULT 'registration'` |
| `generation_type` | `text` | nullable | set when groups/matches generated; values TBD |
| `num_groups` | `smallint` | `CHECK (num_groups BETWEEN 2 AND 4)` | null for grand_final; 2/3/4 based on attendance |
| `winner_player_id` | `bigint` | `→ players(id) ON DELETE SET NULL` | null until tournament completes |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT now()` | |
| | | `UNIQUE(season_id, week_number)` | |

### `tournament_registrations`

| Column | Type | Domain | Notes |
|---|---|---|---|
| `id` | `bigint` | `PK GENERATED ALWAYS AS IDENTITY` | |
| `tournament_id` | `bigint` | `NOT NULL → tournaments(id) ON DELETE CASCADE` | |
| `player_id` | `bigint` | `NOT NULL → players(id) ON DELETE CASCADE` | |
| `checked_in` | `boolean` | `NOT NULL DEFAULT false` | arrived by 19:00 |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT now()` | |
| | | `UNIQUE(tournament_id, player_id)` | |

### `tournament_groups`

| Column | Type | Domain | Notes |
|---|---|---|---|
| `id` | `bigint` | `PK GENERATED ALWAYS AS IDENTITY` | |
| `tournament_id` | `bigint` | `NOT NULL → tournaments(id) ON DELETE CASCADE` | |
| `label` | `text` | `NOT NULL CHECK (label IN ('A','B','C','D'))` | |
| | | `UNIQUE(tournament_id, label)` | |

### `tournament_group_players`

| Column | Type | Domain | Notes |
|---|---|---|---|
| `id` | `bigint` | `PK GENERATED ALWAYS AS IDENTITY` | |
| `group_id` | `bigint` | `NOT NULL → tournament_groups(id) ON DELETE CASCADE` | |
| `player_id` | `bigint` | `NOT NULL → players(id) ON DELETE CASCADE` | |
| | | `UNIQUE(group_id, player_id)` | |

### `matches` — unified, one row per match

**Critical rule:** one row per actual match (two players), NOT two perspective rows like the mock data. App computes `W`/`L` from leg scores. Matches have a lifecycle: `pending` (generated, ready to play) → `completed` (result filled) or `no_show` (walkover).

| Column | PostgreSQL type | Value domain / CHECK | FK reference | Notes |
|---|---|---|---|---|
| `id` | `bigint` | `PK GENERATED ALWAYS AS IDENTITY` | | |
| `season_id` | `bigint` | `NOT NULL` | `→ seasons(id) ON DELETE CASCADE` | |
| `player1_id` | `bigint` | `NOT NULL` | `→ players(id) ON DELETE RESTRICT` | |
| `player2_id` | `bigint` | `NOT NULL, CHECK (player1_id <> player2_id)` | `→ players(id) ON DELETE RESTRICT` | |
| **`status`** | `text` | **`NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','no_show'))`** | | pending→generated, ready to play |
| `legs_player1` | `smallint` | nullable, `CHECK (legs_player1 >= 0)` | | null until match is played |
| `legs_player2` | `smallint` | nullable, `CHECK (legs_player2 >= 0)` | | |
| `legs_target` | `smallint` | `NOT NULL, CHECK (legs_target BETWEEN 2 AND 6)` | | group=2, playoff=3, GF QF=4, GF SF/3rd=5, GF Final=6 |
| `max_throws` | `smallint` | `NOT NULL DEFAULT 45` | | always 45 per rules |
| `player1_180` | `smallint` | `NOT NULL DEFAULT 0, CHECK (player1_180 >= 0)` | | count of 180s |
| `player2_180` | `smallint` | `NOT NULL DEFAULT 0, CHECK (player2_180 >= 0)` | | |
| `no_show_player_id` | `bigint` | nullable | `→ players(id) ON DELETE SET NULL` | **null** unless `status = 'no_show'`; the player who didn't show |
| **`match_type`** | `text` | **`NOT NULL CHECK (match_type IN ('league','tournament_group','tournament_playoff'))`** | | see match matrix above |
| `tournament_id` | `bigint` | nullable | `→ tournaments(id) ON DELETE CASCADE` | **null** when `match_type = 'league'` |
| `tournament_group_id` | `bigint` | nullable | `→ tournament_groups(id) ON DELETE SET NULL` | **null** when `match_type IN ('league','tournament_playoff')` |
| **`tournament_round_name`** | `text` | nullable | — | **null** when `match_type IN ('league','tournament_group')`; one of `'Quarter-Finals'`,`'Semi-Finals'`,`'3rd Place'`,`'Final'` when `match_type = 'tournament_playoff'` |
| `sort_order` | `smallint` | nullable, `CHECK (sort_order >= 0)` | | null for league/group; position within round for bracket |
| `match_date` | `date` | `NOT NULL` | | |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT now()` | | |

**Composite CHECK constraints (structural integrity):**
```sql
-- FK + sort_order consistency per match_type
CHECK (
  (match_type = 'league' AND tournament_id IS NULL AND tournament_group_id IS NULL AND tournament_round_name IS NULL AND sort_order IS NULL)
  OR
  (match_type = 'tournament_group' AND tournament_id IS NOT NULL AND tournament_group_id IS NOT NULL AND tournament_round_name IS NULL AND sort_order IS NULL)
  OR
  (match_type = 'tournament_playoff' AND tournament_id IS NOT NULL AND tournament_group_id IS NULL AND tournament_round_name IS NOT NULL AND sort_order IS NOT NULL)
)

-- legs + no_show consistency per status
CHECK (
  (status = 'pending' AND legs_player1 IS NULL AND legs_player2 IS NULL AND no_show_player_id IS NULL)
  OR
  (status = 'completed' AND legs_player1 IS NOT NULL AND legs_player2 IS NOT NULL AND no_show_player_id IS NULL)
  OR
  (status = 'no_show' AND legs_player1 IS NOT NULL AND legs_player2 IS NOT NULL AND no_show_player_id IS NOT NULL)
)
```

**Indexes:**
| Name | Columns | Purpose |
|---|---|---|
| `idx_matches_season_player` | `(season_id, player1_id)` | player match history |
| `idx_matches_season_player2` | `(season_id, player2_id)` | player match history (other side) |
| `idx_matches_season_date` | `(season_id, match_date DESC)` | recent matches |
| `idx_matches_tournament` | `(tournament_id)` | all matches in a tournament |
| `idx_matches_tournament_group` | `(tournament_group_id)` | group standings |

### `tournament_final_standings`

| Column | Type | Domain | Notes |
|---|---|---|---|
| `id` | `bigint` | `PK GENERATED ALWAYS AS IDENTITY` | |
| `tournament_id` | `bigint` | `NOT NULL → tournaments(id) ON DELETE CASCADE` | |
| `player_id` | `bigint` | `NOT NULL → players(id) ON DELETE CASCADE` | |
| `position` | `smallint` | `NOT NULL CHECK (position >= 1)` | 1st, 2nd, 3rd, ... |
| `played` | `smallint` | `NOT NULL DEFAULT 0` | |
| `wins` | `smallint` | `NOT NULL DEFAULT 0` | |
| `losses` | `smallint` | `NOT NULL DEFAULT 0` | |
| `sets_for` | `smallint` | `NOT NULL DEFAULT 0` | |
| `sets_against` | `smallint` | `NOT NULL DEFAULT 0` | |
| `one80s` | `smallint` | `NOT NULL DEFAULT 0` | |
| `group_points` | `smallint` | `NOT NULL DEFAULT 0` | group wins × 2 (no 180s) |
| `playoff_points` | `smallint` | `NOT NULL DEFAULT 0` | stage-based: QF win=3/loss=1, SF win=4/loss=2, Final win=10/ru=7, 3rd win=5/loss=3 |
| `bonus_points` | `smallint` | `NOT NULL DEFAULT 0` | one80s × 5 |
| `total_points` | `smallint` | `NOT NULL DEFAULT 0` | group_points + playoff_points + bonus_points |
| | | `UNIQUE(tournament_id, player_id)` | |

---

## 3. Entity-Relationship Diagram (typed)

```
seasons
────────────────────────────────────────────────────
 id              bigint  PK
 name            text    NOT NULL  "Season 2 – 2025"
 start_date      date    NOT NULL
 end_date        date    NOT NULL
 is_active       boolean NOT NULL DEFAULT false
 created_at      timestamptz NOT NULL DEFAULT now()
────────────────────────────────────────────────────
      1│
       │
       │ has many
       ▼
────────────────────────────────────────────────────────────────
 tournaments
────────────────────────────────────────────────────────────────
 id                    bigint    PK
 season_id             bigint    FK → seasons(id)    NOT NULL
 week_number           smallint  NOT NULL  CHECK 1..16
 date                  date      NOT NULL
  type                  text      NOT NULL  'regular' │ 'grand_final'
  status                text      NOT NULL  'registration' │ 'ready' │ 'in_progress' │ 'completed'
  generation_type       text      nullable              set on generate
  num_groups            smallint  CHECK 2..4           nullable (null for grand_final)
 winner_player_id      bigint    FK → players(id)     nullable
 created_at            timestamptz NOT NULL DEFAULT now()
 UNIQUE(season_id, week_number)
────────────────────────────────────────────────────────────────
      1│                             1│
       │                              │
       │ has many                     │ has many (registrations)
       ▼                              ▼
┌─────────────────────────────── ┌─────────────────────────────────────
│ tournament_groups              │ tournament_registrations
│─────────────────────────────── │─────────────────────────────────────
│ id              bigint  PK    │ id              bigint    PK
│ tournament_id   bigint  FK    │ tournament_id   bigint    FK
│ label           text    'A'..'D'│ player_id       bigint    FK → players
│ UNIQUE(tournament_id,label)   │ checked_in      boolean   DEFAULT false
└─────────────────────────────── │ UNIQUE(tournament_id, player_id)
      1│                         └─────────────────────────────────────
       │ has many
       ▼
┌─────────────────────────────────────
│ tournament_group_players
│─────────────────────────────────────
│ id              bigint  PK
│ group_id        bigint  FK → tournament_groups
│ player_id       bigint  FK → players
│ UNIQUE(group_id, player_id)
└─────────────────────────────────────

players ──── season_players
                                          ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
                                          ─  match_type enum   ─
                                          ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
                                          ─ 'league'           ─
                                          ─ 'tournament_group' ─
                                          ─ 'tournament_playoff'─
                                          ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

  matches  (unified)
  ────────────────────────────────────────────────────────────────────────────
   id                    bigint      PK
   season_id             bigint      FK → seasons(id)
   player1_id            bigint      FK → players(id)
   player2_id            bigint      FK → players(id)       CHECK p1<>p2
   status                text        NOT NULL  'pending' │ 'completed' │ 'no_show'
   legs_player1          smallint    nullable               null until played
   legs_player2          smallint    nullable               null until played
   legs_target           smallint    NOT NULL  2..6
   max_throws            smallint    NOT NULL DEFAULT 45
   player1_180           smallint    NOT NULL DEFAULT 0
   player2_180           smallint    NOT NULL DEFAULT 0
   no_show_player_id     bigint      FK → players(id)       nullable
   sort_order            smallint    nullable               bracket position
   match_type            text        NOT NULL  [see enum]
   tournament_id         bigint      FK → tournaments(id)   nullable
   tournament_group_id   bigint      FK → tournament_groups  nullable
   tournament_round_name text        nullable               'Quarter-Finals'│'Semi-Finals'│'3rd Place'│'Final'
   match_date            date        NOT NULL
   created_at            timestamptz DEFAULT now()
  ────────────────────────────────────────────────────────────────────────────
   2 structural CHECK constraints:
     type-match:  league → all FKs + sort_order + no_show NULL
                  tournament_group → tournament_id + group_id SET, round + sort_order + no_show NULL
                  tournament_playoff → tournament_id + round_name + sort_order SET, group_id + no_show NULL
     status:      pending → both legs NULL + no_show NULL
                  completed → both legs SET + no_show NULL
                  no_show → both legs SET + no_show_player_id SET

 tournament_final_standings
 ────────────────────────────────────────────────────────────────────────────
  id                bigint    PK
  tournament_id     bigint    FK → tournaments(id)
  player_id         bigint    FK → players(id)
  position          smallint  1, 2, 3, ...
  played            smallint
  wins │ losses     smallint
  sets_for │ sets_against     smallint
  one80s            smallint
  group_points      smallint  group wins×2 (no 180s)
  playoff_points    smallint  stage-based
  bonus_points      smallint  180s×5
  total_points      smallint  group + playoff + bonus
  UNIQUE(tournament_id, player_id)
 ────────────────────────────────────────────────────────────────────────────

game_throw  (EXISTING, untouched)
────────────────────────────────────────────────────────────────────────────
 id          bigint    PK
 name        text      NOT NULL
 throw       integer   NOT NULL CHECK >=0
 created_at  timestamptz NOT NULL DEFAULT now()
───────────────────────────────────  independent from all other tables ──────
```

---

## 4. Row-Level Security

All tables inherit the same pattern from `game_throw`:

```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read" ON <table> FOR SELECT USING (true);
CREATE POLICY "Organizers can write" ON <table> FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Organizers can update" ON <table> FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Organizers can delete" ON <table> FOR DELETE USING (auth.role() = 'authenticated');
```

---

## 5. Migration Order

```
supabase/migrations/
├── 0001_game_throw.sql            (EXISTING — pub game leaderboard)
├── 0002_seasons.sql               NEW
├── 0003_players.sql               NEW
├── 0004_season_players.sql        NEW
├── 0005_tournaments.sql           NEW
├── 0006_tournament_registrations.sql  NEW
├── 0007_tournament_groups.sql     NEW
├── 0008_tournament_group_players.sql  NEW
├── 0009_matches.sql               NEW  (with composite CHECK)
└── 0010_tournament_final_standings.sql NEW
```

---

## 6. Counts When Seeded from Current Mock Data

| Table | Rows |
|---|---|
| `seasons` | 1 |
| `players` | 20 |
| `season_players` | 20 |
| `tournaments` | 16 |
| `tournament_registrations` | ~300 (varies by tournament pool) |
| `tournament_groups` | ~57 (4 groups × 13 regular + 3 groups × 2 = 58, minus grand final) |
| `tournament_group_players` | ~300 |
| **`matches`** | **~1,532 total** (`~200 league + ~1,220 tournament_group + ~112 tournament_playoff`) |
| `tournament_final_standings` | 128 (8 players × 16 tournaments) |
