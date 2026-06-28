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
  status: "registration" | "ready" | "in_progress" | "completed";
  groups: TournamentGroup[];
  playoffs: TournamentPlayoffRound[];
  winner: string | null;
  finalStandings: {
    pos: number;
    name: string;
    played: number;
    wins: number;
    losses: number;
    one80s: number;
    setsFor: number;
    setsAgainst: number;
    points: number;
  }[];
}

export const GROUP_FORMAT = { game: "501", legs: 2, maxThrows: 45 } as const;
export const PLAYOFF_FORMAT = { game: "501", legs: 3, maxThrows: 45 } as const;
export const GRAND_FINAL_FORMAT = {
  quarterfinal: { game: "501", legs: 4, maxThrows: 45 },
  semifinal: { game: "501", legs: 5, maxThrows: 45 },
  thirdPlace: { game: "501", legs: 5, maxThrows: 45 },
  final: { game: "501", legs: 6, maxThrows: 45 },
} as const;

export const BONUS_180 = 5 as const;

const ALL_PLAYERS = standingsData.map((p) => p.name);

function playerRank(name: string): number {
  return standingsData.findIndex((p) => p.name === name);
}

function generateMatch(
  p1: string,
  p2: string,
  date: string,
  legsTarget = 3
): [MatchEntry, MatchEntry] {
  const r1 = playerRank(p1);
  const r2 = playerRank(p2);
  const p1Better = r1 < r2;
  const diff = Math.abs(r1 - r2);

  const minLegs = Math.max(0, Math.floor(legsTarget * 0.6));
  const setsLoser = diff >= 8 ? 0 : diff >= 5 ? minLegs : diff >= 2 ? minLegs : minLegs;

  const score1 = legsTarget;
  const score2 = Math.min(setsLoser, legsTarget - 1);


  // Deterministic 180: top-4 players sometimes hit one against close opponents
  const minRank = Math.min(r1, r2);
  const one80Player = diff <= 3 && minRank <= 3 ? (p1Better ? p1 : p2) : undefined;
  const one80Match = one80Player && diff <= 2 ? one80Player : undefined;

  const m1: MatchEntry = {
    playerName: p1,
    opponent: p2,
    score: `${score1}-${score2}`,
    result: p1Better ? "W" : "L",
    date,
    one80: (p1 === one80Match ? 1 : 0),
  };
  const m2: MatchEntry = {
    playerName: p2,
    opponent: p1,
    score: `${score2}-${score1}`,
    result: p1Better ? "L" : "W",
    date,
    one80: (p2 === one80Match ? 1 : 0),
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

function h2hWinner(a: string, b: string, matches: MatchEntry[]): string | null {
  const direct = matches.find(
    (m) => m.playerName === a && m.opponent === b
  );
  if (direct) return direct.result === "W" ? a : b;
  return null;
}

function computeStandingsForGroup(g: TournamentGroup) {
  const entries = g.players.map((name) => {
    const playerMatches = g.matches.filter((m) => m.playerName === name);
    const wins = playerMatches.filter((m) => m.result === "W").length;
    const losses = playerMatches.filter((m) => m.result === "L").length;
    const one80s = playerMatches.filter((m) => m.one80).length;
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
      points: wins * 2 + one80s * BONUS_180,
      setsDiff: setsFor - setsAgainst,
      setsFor,
      setsAgainst,
      wins,
      losses,
      one80s,
    };
  });

  const sorted = [...entries].sort((a, b) => {
    const pt = b.points - a.points;
    if (pt !== 0) return pt;

    // Head-to-head
    const h2h = h2hWinner(a.name, b.name, g.matches);
    if (h2h === a.name) return -1;
    if (h2h === b.name) return 1;

    const ld = b.setsDiff - a.setsDiff;
    if (ld !== 0) return ld;

    const lw = b.setsFor - a.setsFor;
    if (lw !== 0) return lw;

    const ll = a.setsAgainst - b.setsAgainst;
    if (ll !== 0) return ll;

    return b.one80s - a.one80s;
  });

  return sorted;
}

function computeTop8(groups: TournamentGroup[]): string[] {
  // 2 groups: top 4 from each advance
  if (groups.length === 2) {
    return groups.flatMap((g) =>
      computeStandingsForGroup(g).slice(0, 4).map((s) => s.name)
    );
  }

  // 3+ groups: top 2 from each, then fill best 3rd places
  const autoAdvance = groups.flatMap((g) =>
    computeStandingsForGroup(g).slice(0, 2).map((s) => s.name)
  );

  if (autoAdvance.length >= 8) return autoAdvance.slice(0, 8);

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
  date: string,
  groups?: TournamentGroup[],
  legsTarget = 3
): TournamentPlayoffRound[] {
  const seeded = [...advancing].sort(
    (a, b) => playerRank(a) - playerRank(b)
  );

  const rounds: TournamentPlayoffRound[] = [];

  let qfPairs: [string, string][];

  // 2-group bracket: use group standings
  if (groups && groups.length === 2) {
    const groupAStandings = computeStandingsForGroup(groups[0]);
    const groupBStandings = computeStandingsForGroup(groups[1]);
    qfPairs = [
      [groupAStandings[0].name, groupBStandings[3].name],
      [groupAStandings[1].name, groupBStandings[2].name],
      [groupBStandings[0].name, groupAStandings[3].name],
      [groupBStandings[1].name, groupAStandings[2].name],
    ];
  } else {
    // Standard seeding for 3+ groups: 1v8, 4v5, 2v7, 3v6
    qfPairs = [
      [seeded[0], seeded[7]],
      [seeded[3], seeded[4]],
      [seeded[1], seeded[6]],
      [seeded[2], seeded[5]],
    ];
  }

  const qfMatches: MatchEntry[] = [];
  const qfWinners: string[] = [];
  for (const [p1, p2] of qfPairs) {
    const [m1, m2] = generateMatch(p1, p2, date, legsTarget);
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
    const [m1, m2] = generateMatch(p1, p2, date, legsTarget + 1);
    sfMatches.push(m1, m2);
    sfWinners.push(m1.result === "W" ? p1 : p2);
    sfLosers.push(m1.result === "W" ? p2 : p1);
  }
  rounds.push({ name: "Semi-Finals", matches: sfMatches });

  const [tp1, tp2] = generateMatch(sfLosers[0], sfLosers[1], date, legsTarget + 1);
  rounds.push({ name: "3rd Place", matches: [tp1, tp2] });

  const [f1, f2] = generateMatch(sfWinners[0], sfWinners[1], date, legsTarget + 2);
  rounds.push({ name: "Final", matches: [f1, f2] });

  return rounds;
}

function computeFinalStandings(
  playoffs: TournamentPlayoffRound[],
  winner: string | null,
  groups: TournamentGroup[]
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

  function playoffPointsFor(name: string): number {
    if (name === winner) return 10;
    if (name === runnerUp) return 7;
    if (name === thirdPlaceWinner) return 5;
    if (name === thirdPlaceLoser) return 3;

    // QF loser — check if they won or lost their QF
    const qfPlayerMatches = qfMatches.filter((m) => m.playerName === name);
    const qfWon = qfPlayerMatches.some((m) => m.result === "W");
    return qfWon ? 3 : 1;
  }

  return allPlayoffPlayers.map((name, i) => {
    // Group stage points
    const allGroupMatches = groups.flatMap((g) => g.matches);
    const groupPlayerMatches = allGroupMatches.filter((m) => m.playerName === name);
    const groupWins = groupPlayerMatches.filter((m) => m.result === "W").length;
    const groupPoints = groupWins * 2;

    // Playoff points
    const allPlayoffMatches = playoffs.flatMap((r) => r.matches);
    const playerPMatches = allPlayoffMatches.filter((m) => m.playerName === name);
    const playoffPts = playoffPointsFor(name);

    // Total 180s across groups + playoffs
    const allPlayerMatches = [...groupPlayerMatches, ...playerPMatches];
    const one80s = allPlayerMatches.filter((m) => m.one80).length;

    const wins = playerPMatches.filter((m) => m.result === "W").length;
    const losses = playerPMatches.filter((m) => m.result === "L").length;
    const setsFor = playerPMatches.reduce(
      (sum, m) => sum + parseInt(m.score.split("-")[0]),
      0
    );
    const setsAgainst = playerPMatches.reduce(
      (sum, m) => sum + parseInt(m.score.split("-")[1]),
      0
    );

    return {
      pos: i + 1,
      name,
      played: playerPMatches.length,
      wins,
      losses,
      one80s,
      setsFor,
      setsAgainst,
      points: groupPoints + playoffPts + one80s * BONUS_180,
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
  const playoffs = generatePlayoffs(advancing, date, groups, 3);

  const finalMatch = playoffs.find((r) => r.name === "Final")?.matches[0];
  const winner =
    finalMatch?.result === "W" ? finalMatch.playerName : finalMatch?.opponent ?? null;

  const finalStandings = computeFinalStandings(playoffs, winner, groups);

  return {
    week,
    date,
    status: "completed" as const,
    groups,
    playoffs,
    winner,
    finalStandings,
  };
}

function createGrandFinal(week: number, date: string): TournamentEntry {
  const top8Standings = standingsData.slice(0, 8);
  const players = top8Standings.map((p) => p.name);
  const seeded = [...players].sort((a, b) => playerRank(a) - playerRank(b));

  const qfPairs: [string, string][] = [
    [seeded[0], seeded[7]],
    [seeded[3], seeded[4]],
    [seeded[1], seeded[6]],
    [seeded[2], seeded[5]],
  ];

  const allQfMatches: MatchEntry[] = [];
  const qfWinners: string[] = [];
  for (const [p1, p2] of qfPairs) {
    const [m1, m2] = generateMatch(p1, p2, date, 4);
    allQfMatches.push(m1, m2);
    qfWinners.push(m1.result === "W" ? p1 : p2);
  }

  const sfPairs: [string, string][] = [
    [qfWinners[0], qfWinners[1]],
    [qfWinners[2], qfWinners[3]],
  ];

  const allSfMatches: MatchEntry[] = [];
  const sfWinners: string[] = [];
  const sfLosers: string[] = [];
  for (const [p1, p2] of sfPairs) {
    const [m1, m2] = generateMatch(p1, p2, date, 5);
    allSfMatches.push(m1, m2);
    sfWinners.push(m1.result === "W" ? p1 : p2);
    sfLosers.push(m1.result === "W" ? p2 : p1);
  }

  const [tp1, tp2] = generateMatch(sfLosers[0], sfLosers[1], date, 5);
  const [f1, f2] = generateMatch(sfWinners[0], sfWinners[1], date, 6);

  const playoffs: TournamentPlayoffRound[] = [
    { name: "Quarter-Finals", matches: allQfMatches },
    { name: "Semi-Finals", matches: allSfMatches },
    { name: "3rd Place", matches: [tp1, tp2] },
    { name: "Final", matches: [f1, f2] },
  ];

  const finalMatchResult = f1.result === "W" ? f1.playerName : f1.opponent;
  const winner = finalMatchResult;

  const finalStandings = [
    { name: winner, pts: 10 },
    { name: winner === f1.playerName ? f1.opponent : f1.playerName, pts: 7 },
    { name: tp1.result === "W" ? tp1.playerName : tp1.opponent, pts: 5 },
    { name: tp1.result === "W" ? tp1.opponent : tp1.playerName, pts: 3 },
  ];

  const allPlayoffNames = [...finalStandings.map((s) => s.name)];
  const qfLosers = players.filter((p) => !allPlayoffNames.includes(p));

  for (const name of [...finalStandings.map((s) => s.name), ...qfLosers]) {
    const allPlayoffMatches = playoffs.flatMap((r) => r.matches);
    const one80s = allPlayoffMatches.filter((m) => m.playerName === name && m.one80).length;
    const existing = finalStandings.find((s) => s.name === name);
    if (existing && one80s > 0) {
      existing.pts += one80s * BONUS_180;
    }
  }

  const qfLoserStandings = qfLosers.map((name) => {
    const allMatches = playoffs.flatMap((r) => r.matches);
    const playerMatches = allMatches.filter((m) => m.playerName === name);
    const wins = playerMatches.filter((m) => m.result === "W").length;
    const losses = playerMatches.filter((m) => m.result === "L").length;
    const one80s = playerMatches.filter((m) => (m.playerName === name) && m.one80).length;
    const setsFor = playerMatches.reduce((s, m) => s + parseInt(m.score.split("-")[0]), 0);
    const setsAgainst = playerMatches.reduce((s, m) => s + parseInt(m.score.split("-")[1]), 0);
    const qfWon = wins > 0;
    return { name, wins, losses, one80s, setsFor, setsAgainst, pts: (qfWon ? 3 : 1) + one80s * BONUS_180 };
  });

  qfLoserStandings.sort((a, b) => b.pts - a.pts || (b.setsFor - b.setsAgainst) - (a.setsFor - a.setsAgainst));

  const fsFinal = [...finalStandings, ...qfLoserStandings].map((s, i) => {
    const allPlayoffMatches = playoffs.flatMap((r) => r.matches);
    const playerPMatches = allPlayoffMatches.filter((m) => m.playerName === s.name);
    const wins = playerPMatches.filter((m) => m.result === "W").length;
    const losses = playerPMatches.filter((m) => m.result === "L").length;
    const one80s = playerPMatches.filter((m) => m.one80).length;
    const setsFor = playerPMatches.reduce((sum, m) => sum + parseInt(m.score.split("-")[0]), 0);
    const setsAgainst = playerPMatches.reduce((sum, m) => sum + parseInt(m.score.split("-")[1]), 0);
    return {
      pos: i + 1,
      name: s.name,
      played: playerPMatches.length,
      wins,
      losses,
      one80s,
      setsFor,
      setsAgainst,
      points: s.pts,
    };
  });

  return {
    week,
    date,
    status: "completed" as const,
    groups: [],
    playoffs,
    winner,
    finalStandings: fsFinal,
  };
}

const BOTTOM_4 = ["Tim Krüger", "Nils Hoffmann", "Leo Fischer", "Paul Graf"];
const BOTTOM_2 = ["Tim Krüger", "Nils Hoffmann"];
const MID_4 = ["Jonas Wolf", "David Maurer", "Paul Graf", "Leo Fischer"];
const MID_6 = ["Nils Hoffmann", "Tim Krüger", "Jonas Wolf", "David Maurer", "Paul Graf", "Leo Fischer"];

const POOLS = [
  ALL_PLAYERS,
  ALL_PLAYERS,
  ALL_PLAYERS.filter((p) => !BOTTOM_4.includes(p)),
  ALL_PLAYERS,
  ALL_PLAYERS.filter((p) => !BOTTOM_2.includes(p)),
  ALL_PLAYERS,
  ALL_PLAYERS.filter((p) => !MID_6.includes(p)),
  ALL_PLAYERS.filter((p) => !MID_4.includes(p)),
  ALL_PLAYERS,
  ALL_PLAYERS.filter((p) => !BOTTOM_2.includes(p)),
  ALL_PLAYERS.filter((p) => !BOTTOM_4.includes(p)),
  ALL_PLAYERS,
  ALL_PLAYERS.filter((p) => !BOTTOM_2.includes(p)),
  ALL_PLAYERS,
  ALL_PLAYERS,
];

const THURSDAY_DATES = [
  "18.09.2025", "25.09.2025", "02.10.2025", "09.10.2025",
  "16.10.2025", "23.10.2025", "30.10.2025", "06.11.2025",
  "13.11.2025", "20.11.2025", "27.11.2025", "04.12.2025",
  "11.12.2025", "18.12.2025", "08.01.2026",
];

const NUM_GROUPS = [4, 4, 4, 4, 4, 4, 3, 3, 4, 4, 4, 4, 3, 4, 4];

export const tournaments: TournamentEntry[] = [
  ...POOLS.map((pool, i) => {
    const week = i + 1;
    return createTournament(week, THURSDAY_DATES[i], pool, NUM_GROUPS[i]);
  }),
  // Grand Final — week 16
  createGrandFinal(16, "15.01.2026"),
];

export const allTournamentMatches: MatchEntry[] = tournaments
  .filter((t) => t.status === "completed")
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
      const one80s = playerMatches.filter((m) => m.one80).length;
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
        played: playerMatches.length,
        wins,
        losses,
        one80s,
        setsFor,
        setsAgainst,
        points: wins * 2 + one80s * BONUS_180,
      };
    })
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.setsFor - b.setsAgainst - (a.setsFor - a.setsAgainst) ||
        b.wins - a.wins
    );
}
