import { standingsData } from "@/app/_components/standings/data";
import type { MatchEntry } from "@/app/_components/standings/data";

export interface TournamentGroup {
  name: string;
  players: string[];
  matches: MatchEntry[];
}

export interface TournamentPlayoffRound {
  name: string;
  matches: MatchEntry[];
}

export interface TournamentEntry {
  week: number;
  date: string;
  status: "past" | "future";
  groups: TournamentGroup[];
  playoffs: TournamentPlayoffRound[];
  winner: string | null;
  finalStandings: {
    pos: number;
    name: string;
    team: string;
    played: number;
    wins: number;
    losses: number;
    setsFor: number;
    setsAgainst: number;
    points: number;
  }[];
}

export const GROUP_FORMAT = { game: "301", legs: 2, maxThrows: 45 } as const;
export const PLAYOFF_FORMAT = { game: "501", legs: 3, maxThrows: 45 } as const;

const ALL_PLAYERS = standingsData.map((p) => p.name);

function playerRank(name: string): number {
  return standingsData.findIndex((p) => p.name === name);
}

function playerTeam(name: string): string {
  return standingsData.find((p) => p.name === name)?.team ?? "";
}

function generateMatch(
  p1: string,
  p2: string,
  date: string
): [MatchEntry, MatchEntry] {
  const r1 = playerRank(p1);
  const r2 = playerRank(p2);
  const p1Better = r1 < r2;
  const diff = Math.abs(r1 - r2);

  const setsLoser = diff >= 8 ? 0 : diff >= 5 ? 1 : diff >= 2 ? 1 : 2;

  const score1 = 3;
  const score2 = setsLoser;

  const team1 = playerTeam(p1);
  const team2 = playerTeam(p2);

  const m1: MatchEntry = {
    playerName: p1,
    team: team1,
    opponent: p2,
    score: `${score1}-${score2}`,
    result: p1Better ? "W" : "L",
    date,
  };
  const m2: MatchEntry = {
    playerName: p2,
    team: team2,
    opponent: p1,
    score: `${score2}-${score1}`,
    result: p1Better ? "L" : "W",
    date,
  };
  return [m1, m2];
}

function generateRoundRobin(players: string[], date: string): MatchEntry[] {
  const matches: MatchEntry[] = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const [m1, m2] = generateMatch(players[i], players[j], date);
      matches.push(m1, m2);
    }
  }
  return matches;
}

function shuffledPlayers(week: number, pool: string[]): string[] {
  const shift = week * 3;
  return [...pool.slice(shift % pool.length), ...pool.slice(0, shift % pool.length)];
}

function splitGroups(players: string[], numGroups: number): string[][] {
  const sorted = [...players].sort((a, b) => playerRank(a) - playerRank(b));
  const groups: string[][] = Array.from({ length: numGroups }, () => []);
  for (let i = 0; i < sorted.length; i++) {
    groups[i % numGroups].push(sorted[i]);
  }
  return groups;
}

function computeStandingsForGroup(g: TournamentGroup) {
  return g.players.map((name) => {
    const playerMatches = g.matches.filter((m) => m.playerName === name);
    const wins = playerMatches.filter((m) => m.result === "W").length;
    const setsFor = playerMatches.reduce(
      (sum, m) => sum + parseInt(m.score.split("-")[0]),
      0
    );
    const setsAgainst = playerMatches.reduce(
      (sum, m) => sum + parseInt(m.score.split("-")[1]),
      0
    );
    return {
      name,
      points: wins * 2,
      setsDiff: setsFor - setsAgainst,
      wins,
    };
  }).sort(
    (a, b) =>
      b.points - a.points ||
      b.setsDiff - a.setsDiff ||
      b.wins - a.wins
  );
}

function computeTop8(groups: TournamentGroup[]): string[] {
  // Top 2 from each group automatically advance
  const autoAdvance = groups.flatMap((g) =>
    computeStandingsForGroup(g).slice(0, 2).map((s) => s.name)
  );

  if (autoAdvance.length >= 8) return autoAdvance.slice(0, 8);

  // Fill remaining spots from the best of the rest
  const autoSet = new Set(autoAdvance);
  const remaining = groups.flatMap((g) =>
    computeStandingsForGroup(g)
      .filter((s) => !autoSet.has(s.name))
      .slice(0, 8 - autoAdvance.length)
  );
  remaining.sort(
    (a, b) =>
      b.points - a.points ||
      b.setsDiff - a.setsDiff ||
      b.wins - a.wins
  );
  return [
    ...autoAdvance,
    ...remaining.slice(0, 8 - autoAdvance.length).map((s) => s.name),
  ];
}

function generatePlayoffs(
  advancing: string[],
  date: string
): TournamentPlayoffRound[] {
  const seeded = [...advancing].sort(
    (a, b) => playerRank(a) - playerRank(b)
  );

  const rounds: TournamentPlayoffRound[] = [];

  const qfPairs = [
    [seeded[0], seeded[7]],
    [seeded[3], seeded[4]],
    [seeded[1], seeded[6]],
    [seeded[2], seeded[5]],
  ];

  const qfMatches: MatchEntry[] = [];
  const qfWinners: string[] = [];
  for (const [p1, p2] of qfPairs) {
    const [m1, m2] = generateMatch(p1, p2, date);
    qfMatches.push(m1, m2);
    qfWinners.push(m1.result === "W" ? p1 : p2);
  }
  rounds.push({ name: "Quarter-Finals", matches: qfMatches });

  const sfPairs = [
    [qfWinners[0], qfWinners[1]],
    [qfWinners[2], qfWinners[3]],
  ];

  const sfMatches: MatchEntry[] = [];
  const sfWinners: string[] = [];
  const sfLosers: string[] = [];
  for (const [p1, p2] of sfPairs) {
    const [m1, m2] = generateMatch(p1, p2, date);
    sfMatches.push(m1, m2);
    sfWinners.push(m1.result === "W" ? p1 : p2);
    sfLosers.push(m1.result === "W" ? p2 : p1);
  }
  rounds.push({ name: "Semi-Finals", matches: sfMatches });

  const [tp1, tp2] = generateMatch(sfLosers[0], sfLosers[1], date);
  rounds.push({ name: "3rd Place", matches: [tp1, tp2] });

  const [f1, f2] = generateMatch(sfWinners[0], sfWinners[1], date);
  rounds.push({ name: "Final", matches: [f1, f2] });

  return rounds;
}

function computeFinalStandings(
  playoffs: TournamentPlayoffRound[],
  winner: string | null
) {
  const finalMatch = playoffs.find((r) => r.name === "Final")?.matches[0];
  const runnerUp =
    finalMatch?.result === "W" ? finalMatch.opponent : finalMatch?.playerName;

  const thirdPlaceMatch = playoffs.find((r) => r.name === "3rd Place")?.matches[0];
  const thirdPlaceWinner = thirdPlaceMatch?.result === "W"
    ? thirdPlaceMatch.playerName
    : thirdPlaceMatch?.opponent;
  const thirdPlaceLoser = thirdPlaceMatch?.result === "W"
    ? thirdPlaceMatch.opponent
    : thirdPlaceMatch?.playerName;

  const qfMatches = playoffs.find((r) => r.name === "Quarter-Finals")?.matches ?? [];

  const ordering = [winner, runnerUp, thirdPlaceWinner, thirdPlaceLoser];

  const qfLosers: string[] = [];
  for (let i = 0; i < qfMatches.length; i += 2) {
    const m1 = qfMatches[i];
    const m2 = qfMatches[i + 1];
    if (!m1 || !m2) continue;
    const loser = m1.result === "W" ? m1.opponent : m1.playerName;
    if (!ordering.includes(loser)) qfLosers.push(loser);
  }
  qfLosers.sort((a, b) => {
    const aMatches = qfMatches.filter(
      (m) => m.playerName === a || m.opponent === a
    );
    const bMatches = qfMatches.filter(
      (m) => m.playerName === b || m.opponent === b
    );
    const aSetsDiff =
      aMatches
        .filter((m) => m.playerName === a)
        .reduce((s, m) => s + parseInt(m.score.split("-")[0]), 0) -
      aMatches
        .filter((m) => m.opponent === a)
        .reduce((s, m) => s + parseInt(m.score.split("-")[1]), 0);
    const bSetsDiff =
      bMatches
        .filter((m) => m.playerName === b)
        .reduce((s, m) => s + parseInt(m.score.split("-")[0]), 0) -
      bMatches
        .filter((m) => m.opponent === b)
        .reduce((s, m) => s + parseInt(m.score.split("-")[1]), 0);
    return bSetsDiff - aSetsDiff;
  });

  const allPlayoffPlayers = [
    ...ordering,
    ...qfLosers,
  ].filter((p): p is string => p != null);

  return allPlayoffPlayers.map((name, i) => {
    const allMatches = playoffs.flatMap((r) => r.matches);
    const playerMatches = allMatches.filter((m) => m.playerName === name);
    const wins = playerMatches.filter((m) => m.result === "W").length;
    const losses = playerMatches.filter((m) => m.result === "L").length;
    const setsFor = playerMatches.reduce(
      (sum, m) => sum + parseInt(m.score.split("-")[0]),
      0
    );
    const setsAgainst = playerMatches.reduce(
      (sum, m) => sum + parseInt(m.score.split("-")[1]),
      0
    );
    return {
      pos: i + 1,
      name,
      team: playerTeam(name),
      played: playerMatches.length,
      wins,
      losses,
      setsFor,
      setsAgainst,
      points: wins * 2,
    };
  });
}

function createTournament(
  week: number,
  date: string,
  pool: string[],
  numGroups: number
): TournamentEntry {
  const shuffled = shuffledPlayers(week, pool);
  const groupPlayers = splitGroups(shuffled, numGroups);

  const groups: TournamentGroup[] = groupPlayers.map((players, i) => ({
    name: String.fromCharCode(65 + i),
    players,
    matches: generateRoundRobin(players, date),
  }));

  const advancing = computeTop8(groups);
  const playoffs = generatePlayoffs(advancing, date);

  const finalMatch = playoffs.find((r) => r.name === "Final")?.matches[0];
  const winner =
    finalMatch?.result === "W" ? finalMatch.playerName : finalMatch?.opponent ?? null;

  const finalStandings = computeFinalStandings(playoffs, winner);

  return {
    week,
    date,
    status: "past" as const,
    groups,
    playoffs,
    winner,
    finalStandings,
  };
}

const T1_POOL = ALL_PLAYERS;
const T2_POOL = ALL_PLAYERS;
const T3_POOL = ALL_PLAYERS.filter(
  (p) => !["Tim Krüger", "Nils Hoffmann", "Leo Fischer", "Paul Graf"].includes(p)
);
const T4_POOL = ALL_PLAYERS;
const T5_POOL = ALL_PLAYERS.filter(
  (p) => !["Tim Krüger", "Nils Hoffmann"].includes(p)
);
const T6_POOL = ALL_PLAYERS;

export const tournaments: TournamentEntry[] = [
  createTournament(1, "20.09.2025", T1_POOL, 4),
  createTournament(2, "27.09.2025", T2_POOL, 4),
  createTournament(3, "04.10.2025", T3_POOL, 4),
  createTournament(4, "11.10.2025", T4_POOL, 4),
  createTournament(5, "18.10.2025", T5_POOL, 4),
  createTournament(6, "25.10.2025", T6_POOL, 4),
  {
    week: 7,
    date: "01.11.2025",
    status: "future",
    groups: [],
    playoffs: [],
    winner: null,
    finalStandings: [],
  },
  {
    week: 8,
    date: "08.11.2025",
    status: "future",
    groups: [],
    playoffs: [],
    winner: null,
    finalStandings: [],
  },
];

export const allTournamentMatches: MatchEntry[] = tournaments
  .filter((t) => t.status === "past")
  .flatMap((t) => [
    ...t.groups.flatMap((g) => g.matches),
    ...t.playoffs.flatMap((r) => r.matches),
  ]);

export function findTournamentByWeek(week: number): TournamentEntry | null {
  return tournaments.find((t) => t.week === week) ?? null;
}

export function computeGroupStandings(
  players: string[],
  groupMatches: MatchEntry[]
) {
  return players
    .map((name) => {
      const playerMatches = groupMatches.filter(
        (m) => m.playerName === name
      );
      const wins = playerMatches.filter((m) => m.result === "W").length;
      const losses = playerMatches.filter((m) => m.result === "L").length;
      const setsFor = playerMatches.reduce(
        (sum, m) => sum + parseInt(m.score.split("-")[0]),
        0
      );
      const setsAgainst = playerMatches.reduce(
        (sum, m) => sum + parseInt(m.score.split("-")[1]),
        0
      );
      return {
        name,
        team: playerTeam(name),
        played: playerMatches.length,
        wins,
        losses,
        setsFor,
        setsAgainst,
        points: wins * 2,
      };
    })
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.setsFor - b.setsAgainst - (a.setsFor - a.setsAgainst) ||
        b.wins - a.wins
    );
}
