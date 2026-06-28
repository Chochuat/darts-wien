export interface MatchResult {
  opponent: string;
  score: string;
  result: "W" | "L";
  date: string;
  one80?: number;
}

export interface MatchEntry extends MatchResult {
  playerName: string;
}

export interface StandingsPlayer {
  pos: number;
  name: string;
  played: number;
  wins: number;
  losses: number;
  setsFor: number;
  setsAgainst: number;
  points: number;
  one80s: number;
  form: ("W" | "L")[];
  matches: MatchResult[];
}

export const standingsData: StandingsPlayer[] = [
  {
    pos: 1, name: "Mike Thorn", played: 20, wins: 17, losses: 3, setsFor: 52, setsAgainst: 14, points: 34, one80s: 2, form: ["W", "W", "W", "L", "W"],
    matches: [
      { opponent: "Dave Steel", score: "3-0", result: "W", date: "20.06.", one80: 1 },
      { opponent: "Luke Swift", score: "3-0", result: "W", date: "13.06.", one80: 1 },
      { opponent: "Tom Knight", score: "3-0", result: "W", date: "06.06." },
      { opponent: "Erik Frost", score: "2-3", result: "L", date: "30.05." },
      { opponent: "Chris Arrow", score: "3-1", result: "W", date: "23.05." },
      { opponent: "Ben Schwarz", score: "3-0", result: "W", date: "16.06." },
      { opponent: "Jonas Wolf", score: "3-0", result: "W", date: "09.06." },
      { opponent: "David Maurer", score: "3-0", result: "W", date: "02.06." },
      { opponent: "Paul Graf", score: "3-0", result: "W", date: "26.05." },
      { opponent: "Leo Fischer", score: "3-0", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 2, name: "Dave Steel", played: 20, wins: 16, losses: 4, setsFor: 49, setsAgainst: 18,     points: 32, one80s: 2, form: ["W", "W", "L", "W", "W"],
    matches: [
      { opponent: "Pete Hammer", score: "3-1", result: "W", date: "20.06.", one80: 1 },
      { opponent: "John Bull", score: "3-0", result: "W", date: "13.06.", one80: 1 },
      { opponent: "Mike Thorn", score: "1-3", result: "L", date: "06.06." },
      { opponent: "Tom Knight", score: "3-0", result: "W", date: "30.05." },
      { opponent: "Luke Swift", score: "3-0", result: "W", date: "23.05." },
      { opponent: "Simon Adler", score: "3-0", result: "W", date: "16.06." },
      { opponent: "Nils Hoffmann", score: "3-0", result: "W", date: "09.06." },
      { opponent: "Ben Schwarz", score: "3-0", result: "W", date: "02.06." },
      { opponent: "David Maurer", score: "3-0", result: "W", date: "26.05." },
      { opponent: "Jonas Wolf", score: "3-0", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 3, name: "Chris Arrow", played: 20, wins: 15, losses: 5, setsFor: 46, setsAgainst: 22,     points: 30, one80s: 1, form: ["W", "L", "W", "W", "L"],
    matches: [
      { opponent: "Tom Knight", score: "3-0", result: "W", date: "20.06.", one80: 1 },
      { opponent: "Erik Frost", score: "2-3", result: "L", date: "13.06." },
      { opponent: "Pete Hammer", score: "3-1", result: "W", date: "06.06." },
      { opponent: "John Bull", score: "3-0", result: "W", date: "30.05." },
      { opponent: "Mike Thorn", score: "1-3", result: "L", date: "23.05." },
      { opponent: "Lukas Weber", score: "3-1", result: "W", date: "16.06." },
      { opponent: "Simon Adler", score: "3-0", result: "W", date: "09.06." },
      { opponent: "Nils Hoffmann", score: "3-0", result: "W", date: "02.06." },
      { opponent: "Leo Fischer", score: "3-0", result: "W", date: "26.05." },
      { opponent: "Tim Krüger", score: "3-0", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 4, name: "Marco Berger", played: 20, wins: 14, losses: 6, setsFor: 43, setsAgainst: 25,     points: 28, one80s: 1, form: ["W", "W", "L", "W", "W"],
    matches: [
      { opponent: "Felix Gross", score: "3-2", result: "W", date: "20.06.", one80: 1 },
      { opponent: "Lukas Weber", score: "1-3", result: "L", date: "13.06." },
      { opponent: "John Bull", score: "3-0", result: "W", date: "06.06." },
      { opponent: "Pete Hammer", score: "3-1", result: "W", date: "30.05." },
      { opponent: "Max Richter", score: "3-0", result: "W", date: "23.05." },
      { opponent: "David Maurer", score: "3-0", result: "W", date: "16.06." },
      { opponent: "Jonas Wolf", score: "3-0", result: "W", date: "09.06." },
      { opponent: "Paul Graf", score: "3-0", result: "W", date: "02.06." },
      { opponent: "Tim Krüger", score: "3-0", result: "W", date: "26.05." },
      { opponent: "Nils Hoffmann", score: "3-1", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 5, name: "Felix Gross", played: 20, wins: 13, losses: 7, setsFor: 40, setsAgainst: 28,     points: 26, one80s: 0, form: ["L", "W", "W", "L", "W"],
    matches: [
      { opponent: "Marco Berger", score: "2-3", result: "L", date: "20.06." },
      { opponent: "John Bull", score: "3-1", result: "W", date: "13.06." },
      { opponent: "Max Richter", score: "3-0", result: "W", date: "06.06." },
      { opponent: "Tom Knight", score: "1-3", result: "L", date: "30.05." },
      { opponent: "Lukas Weber", score: "3-2", result: "W", date: "23.05." },
      { opponent: "Ben Schwarz", score: "3-0", result: "W", date: "16.06." },
      { opponent: "David Maurer", score: "3-1", result: "W", date: "09.06." },
      { opponent: "Leo Fischer", score: "3-0", result: "W", date: "02.06." },
      { opponent: "Tim Krüger", score: "3-0", result: "W", date: "26.05." },
      { opponent: "Nils Hoffmann", score: "3-0", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 6, name: "John Bull", played: 20, wins: 12, losses: 8, setsFor: 37, setsAgainst: 31,     points: 24, one80s: 0, form: ["L", "W", "L", "W", "L"],
    matches: [
      { opponent: "Luke Swift", score: "2-3", result: "L", date: "20.06." },
      { opponent: "Dave Steel", score: "0-3", result: "L", date: "13.06." },
      { opponent: "Erik Frost", score: "3-1", result: "W", date: "06.06." },
      { opponent: "Chris Arrow", score: "0-3", result: "L", date: "30.05." },
      { opponent: "Pete Hammer", score: "3-2", result: "W", date: "23.05." },
      { opponent: "Simon Adler", score: "3-1", result: "W", date: "16.06." },
      { opponent: "Ben Schwarz", score: "3-0", result: "W", date: "09.06." },
      { opponent: "Jonas Wolf", score: "3-0", result: "W", date: "02.06." },
      { opponent: "Nils Hoffmann", score: "3-0", result: "W", date: "26.05." },
      { opponent: "Tim Krüger", score: "3-0", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 7, name: "Max Richter", played: 20, wins: 11, losses: 9, setsFor: 35, setsAgainst: 34,     points: 22, one80s: 0, form: ["W", "L", "L", "W", "W"],
    matches: [
      { opponent: "Lukas Weber", score: "3-1", result: "W", date: "20.06." },
      { opponent: "Pete Hammer", score: "1-3", result: "L", date: "13.06." },
      { opponent: "Felix Gross", score: "0-3", result: "L", date: "06.06." },
      { opponent: "Simon Adler", score: "3-2", result: "W", date: "30.05." },
      { opponent: "Tom Knight", score: "3-1", result: "W", date: "23.05." },
      { opponent: "Nils Hoffmann", score: "3-0", result: "W", date: "16.06." },
      { opponent: "Leo Fischer", score: "3-0", result: "W", date: "09.06." },
      { opponent: "Tim Krüger", score: "3-0", result: "W", date: "02.06." },
      { opponent: "Ben Schwarz", score: "3-2", result: "W", date: "26.05." },
      { opponent: "David Maurer", score: "3-1", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 8, name: "Pete Hammer", played: 20, wins: 10, losses: 10, setsFor: 32, setsAgainst: 37,     points: 20, one80s: 0, form: ["L", "L", "W", "L", "W"],
    matches: [
      { opponent: "Dave Steel", score: "1-3", result: "L", date: "20.06." },
      { opponent: "Tom Knight", score: "2-3", result: "L", date: "13.06." },
      { opponent: "Chris Arrow", score: "1-3", result: "L", date: "06.06." },
      { opponent: "Luke Swift", score: "3-0", result: "W", date: "30.05." },
      { opponent: "John Bull", score: "2-3", result: "L", date: "23.05." },
      { opponent: "Jonas Wolf", score: "3-0", result: "W", date: "16.06." },
      { opponent: "Nils Hoffmann", score: "3-1", result: "W", date: "09.06." },
      { opponent: "Leo Fischer", score: "3-0", result: "W", date: "02.06." },
      { opponent: "Simon Adler", score: "3-2", result: "W", date: "26.05." },
      { opponent: "Tim Krüger", score: "3-0", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 9, name: "Lukas Weber", played: 20, wins: 9, losses: 11, setsFor: 30, setsAgainst: 38,     points: 18, one80s: 1, form: ["L", "W", "W", "L", "L"],
    matches: [
      { opponent: "Max Righter", score: "1-3", result: "L", date: "20.06." },
      { opponent: "Marco Berger", score: "3-1", result: "W", date: "13.06.", one80: 1 },
      { opponent: "Simon Adler", score: "3-2", result: "W", date: "06.06." },
      { opponent: "Felix Gross", score: "2-3", result: "L", date: "30.05." },
      { opponent: "Erik Frost", score: "0-3", result: "L", date: "23.05." },
      { opponent: "David Maurer", score: "3-1", result: "W", date: "16.06." },
      { opponent: "Jonas Wolf", score: "3-1", result: "W", date: "09.06." },
      { opponent: "Tim Krüger", score: "3-0", result: "W", date: "02.06." },
      { opponent: "Nils Hoffmann", score: "3-1", result: "W", date: "26.05." },
      { opponent: "Leo Fischer", score: "3-0", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 10, name: "Simon Adler", played: 20, wins: 8, losses: 12, setsFor: 28, setsAgainst: 41,     points: 16, one80s: 0, form: ["W", "L", "L", "L", "W"],
    matches: [
      { opponent: "Erik Frost", score: "3-1", result: "W", date: "20.06." },
      { opponent: "Luke Swift", score: "1-3", result: "L", date: "13.06." },
      { opponent: "Tom Knight", score: "0-3", result: "L", date: "06.06." },
      { opponent: "Max Richter", score: "2-3", result: "L", date: "30.05." },
      { opponent: "Lukas Weber", score: "3-0", result: "W", date: "23.05." },
      { opponent: "Jonas Wolf", score: "3-1", result: "W", date: "16.06." },
      { opponent: "Leo Fischer", score: "3-0", result: "W", date: "09.06." },
      { opponent: "Tim Krüger", score: "3-0", result: "W", date: "02.06." },
      { opponent: "Paul Graf", score: "3-0", result: "W", date: "26.05." },
      { opponent: "David Maurer", score: "3-2", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 11, name: "Luke Swift", played: 20, wins: 7, losses: 13, setsFor: 25, setsAgainst: 44,     points: 14, one80s: 0, form: ["L", "W", "L", "L", "L"],
    matches: [
      { opponent: "John Bull", score: "3-2", result: "W", date: "20.06." },
      { opponent: "Mike Thorn", score: "0-3", result: "L", date: "13.06." },
      { opponent: "Tom Knight", score: "1-3", result: "L", date: "06.06." },
      { opponent: "Pete Hammer", score: "0-3", result: "L", date: "30.05." },
      { opponent: "Dave Steel", score: "0-3", result: "L", date: "23.05." },
      { opponent: "Ben Schwarz", score: "3-1", result: "W", date: "16.06." },
      { opponent: "Jonas Wolf", score: "3-2", result: "W", date: "09.06." },
      { opponent: "David Maurer", score: "3-2", result: "W", date: "02.06." },
      { opponent: "Nils Hoffmann", score: "3-1", result: "W", date: "26.05." },
      { opponent: "Tim Krüger", score: "3-0", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 12, name: "Tom Knight", played: 20, wins: 6, losses: 14, setsFor: 22, setsAgainst: 47,     points: 12, one80s: 0, form: ["L", "L", "L", "W", "L"],
    matches: [
      { opponent: "Chris Arrow", score: "0-3", result: "L", date: "20.06." },
      { opponent: "Pete Hammer", score: "3-2", result: "W", date: "13.06." },
      { opponent: "Mike Thorn", score: "0-3", result: "L", date: "06.06." },
      { opponent: "Dave Steel", score: "0-3", result: "L", date: "30.05." },
      { opponent: "Erik Frost", score: "1-3", result: "L", date: "23.05." },
      { opponent: "Jonas Wolf", score: "3-1", result: "W", date: "16.06." },
      { opponent: "David Maurer", score: "3-0", result: "W", date: "09.06." },
      { opponent: "Leo Fischer", score: "3-1", result: "W", date: "02.06." },
      { opponent: "Tim Krüger", score: "3-0", result: "W", date: "26.05." },
      { opponent: "Paul Graf", score: "3-2", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 13, name: "Erik Frost", played: 20, wins: 5, losses: 15, setsFor: 19, setsAgainst: 50,     points: 10, one80s: 0, form: ["L", "L", "L", "L", "L"],
    matches: [
      { opponent: "Simon Adler", score: "1-3", result: "L", date: "20.06." },
      { opponent: "Chris Arrow", score: "3-2", result: "W", date: "13.06." },
      { opponent: "John Bull", score: "1-3", result: "L", date: "06.06." },
      { opponent: "Mike Thorn", score: "0-3", result: "L", date: "30.05." },
      { opponent: "Tom Knight", score: "3-1", result: "W", date: "23.05." },
      { opponent: "Nils Hoffmann", score: "3-1", result: "W", date: "16.06." },
      { opponent: "Tim Krüger", score: "3-0", result: "W", date: "09.06." },
      { opponent: "Jonas Wolf", score: "3-2", result: "W", date: "02.06." },
      { opponent: "Paul Graf", score: "3-1", result: "W", date: "26.05." },
      { opponent: "David Maurer", score: "3-2", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 14, name: "Ben Schwarz", played: 20, wins: 5, losses: 15, setsFor: 18, setsAgainst: 51, points: 10, one80s: 0, form: ["L", "L", "W", "L", "L"],
    matches: [
      { opponent: "Lukas Weber", score: "0-3", result: "L", date: "20.06." },
      { opponent: "Max Richter", score: "1-3", result: "L", date: "13.06." },
      { opponent: "Marco Berger", score: "3-2", result: "W", date: "06.06." },
      { opponent: "Simon Adler", score: "0-3", result: "L", date: "30.05." },
      { opponent: "Felix Gross", score: "1-3", result: "L", date: "23.05." },
      { opponent: "Leo Fischer", score: "3-1", result: "W", date: "16.06." },
      { opponent: "Tim Krüger", score: "3-0", result: "W", date: "09.06." },
      { opponent: "Nils Hoffmann", score: "3-2", result: "W", date: "02.06." },
      { opponent: "Jonas Wolf", score: "3-2", result: "W", date: "26.05." },
      { opponent: "Paul Graf", score: "3-1", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 15, name: "Jonas Wolf", played: 20, wins: 4, losses: 16, setsFor: 15, setsAgainst: 54,     points: 8, one80s: 0, form: ["L", "W", "L", "L", "L"],
    matches: [
      { opponent: "Tom Knight", score: "0-3", result: "L", date: "20.06." },
      { opponent: "Simon Adler", score: "3-2", result: "W", date: "13.06." },
      { opponent: "Lukas Weber", score: "1-3", result: "L", date: "06.06." },
      { opponent: "Erik Frost", score: "0-3", result: "L", date: "30.05." },
      { opponent: "Max Richter", score: "0-3", result: "L", date: "23.05." },
      { opponent: "Tim Krüger", score: "3-0", result: "W", date: "16.06." },
      { opponent: "Leo Fischer", score: "3-1", result: "W", date: "09.06." },
      { opponent: "Paul Graf", score: "3-2", result: "W", date: "02.06." },
      { opponent: "David Maurer", score: "3-2", result: "W", date: "26.05." },
      { opponent: "Nils Hoffmann", score: "3-2", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 16, name: "David Maurer", played: 20, wins: 4, losses: 16, setsFor: 14, setsAgainst: 55, points: 8, one80s: 0, form: ["L", "L", "L", "W", "L"],
    matches: [
      { opponent: "Max Richter", score: "0-3", result: "L", date: "20.06." },
      { opponent: "Felix Gross", score: "1-3", result: "L", date: "13.06." },
      { opponent: "Luke Swift", score: "0-3", result: "L", date: "06.06." },
      { opponent: "Ben Schwarz", score: "3-1", result: "W", date: "30.05." },
      { opponent: "Marco Berger", score: "0-3", result: "L", date: "23.05." },
      { opponent: "Tim Krüger", score: "3-1", result: "W", date: "16.06." },
      { opponent: "Paul Graf", score: "3-1", result: "W", date: "09.06." },
      { opponent: "Leo Fischer", score: "3-1", result: "W", date: "02.06." },
      { opponent: "Jonas Wolf", score: "3-1", result: "W", date: "26.05." },
      { opponent: "Nils Hoffmann", score: "3-2", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 17, name: "Paul Graf", played: 20, wins: 3, losses: 17, setsFor: 11, setsAgainst: 58,     points: 6, one80s: 0, form: ["L", "L", "L", "L", "W"],
    matches: [
      { opponent: "Marco Berger", score: "0-3", result: "L", date: "20.06." },
      { opponent: "Ben Schwarz", score: "1-3", result: "L", date: "13.06." },
      { opponent: "Jonas Wolf", score: "2-3", result: "L", date: "06.06." },
      { opponent: "David Maurer", score: "0-3", result: "L", date: "30.05." },
      { opponent: "Simon Adler", score: "3-0", result: "W", date: "23.05." },
      { opponent: "Leo Fischer", score: "3-2", result: "W", date: "16.06." },
      { opponent: "Nils Hoffmann", score: "3-1", result: "W", date: "09.06." },
      { opponent: "Tim Krüger", score: "3-0", result: "W", date: "02.06." },
      { opponent: "David Maurer", score: "3-2", result: "W", date: "26.05." },
      { opponent: "Jonas Wolf", score: "3-2", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 18, name: "Leo Fischer", played: 20, wins: 2, losses: 18, setsFor: 8, setsAgainst: 61,     points: 4, one80s: 0, form: ["L", "L", "L", "L", "L"],
    matches: [
      { opponent: "Jonas Wolf", score: "1-3", result: "L", date: "20.06." },
      { opponent: "David Maurer", score: "2-3", result: "L", date: "13.06." },
      { opponent: "Paul Graf", score: "0-3", result: "L", date: "06.06." },
      { opponent: "Ben Schwarz", score: "1-3", result: "L", date: "30.05." },
      { opponent: "Luke Swift", score: "0-3", result: "L", date: "23.05." },
      { opponent: "Tim Krüger", score: "3-1", result: "W", date: "16.06." },
      { opponent: "Nils Hoffmann", score: "3-1", result: "W", date: "09.06." },
      { opponent: "Paul Graf", score: "3-1", result: "W", date: "02.06." },
      { opponent: "Jonas Wolf", score: "3-1", result: "W", date: "26.05." },
      { opponent: "David Maurer", score: "3-1", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 19, name: "Nils Hoffmann", played: 20, wins: 2, losses: 18, setsFor: 7, setsAgainst: 62, points: 4, one80s: 0, form: ["W", "L", "L", "L", "L"],
    matches: [
      { opponent: "David Maurer", score: "3-2", result: "W", date: "20.06." },
      { opponent: "Paul Graf", score: "0-3", result: "L", date: "13.06." },
      { opponent: "Ben Schwarz", score: "1-3", result: "L", date: "06.06." },
      { opponent: "Leo Fischer", score: "0-3", result: "L", date: "30.05." },
      { opponent: "Jonas Wolf", score: "1-3", result: "L", date: "23.05." },
      { opponent: "Tim Krüger", score: "3-1", result: "W", date: "16.06." },
      { opponent: "Leo Fischer", score: "3-1", result: "W", date: "09.06." },
      { opponent: "Paul Graf", score: "3-1", result: "W", date: "02.06." },
      { opponent: "Jonas Wolf", score: "3-1", result: "W", date: "26.05." },
      { opponent: "David Maurer", score: "3-1", result: "W", date: "19.05." },
    ],
  },
  {
    pos: 20, name: "Tim Krüger", played: 20, wins: 1, losses: 19, setsFor: 4, setsAgainst: 65,     points: 2, one80s: 0, form: ["L", "L", "L", "L", "L"],
    matches: [
      { opponent: "Paul Graf", score: "0-3", result: "L", date: "20.06." },
      { opponent: "Leo Fischer", score: "1-3", result: "L", date: "13.06." },
      { opponent: "Nils Hoffmann", score: "0-3", result: "L", date: "06.06." },
      { opponent: "Jonas Wolf", score: "0-3", result: "L", date: "30.05." },
      { opponent: "Ben Schwarz", score: "0-3", result: "L", date: "23.05." },
      { opponent: "Leo Fischer", score: "3-0", result: "W", date: "16.06." },
      { opponent: "Paul Graf", score: "3-1", result: "W", date: "09.06." },
      { opponent: "Jonas Wolf", score: "3-0", result: "W", date: "02.06." },
      { opponent: "David Maurer", score: "3-0", result: "W", date: "26.05." },
      { opponent: "Nils Hoffmann", score: "3-0", result: "W", date: "19.05." },
    ],
  },
];

export const slugify = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "-");

export const findBySlug = (slug: string) =>
  standingsData.find((p) => slugify(p.name) === slug) ?? null;

export const allMatches: MatchEntry[] = standingsData.flatMap((p) =>
  p.matches.map((m) => ({
    playerName: p.name,
    opponent: m.opponent,
    score: m.score,
    result: m.result,
    date: m.date,
    one80: m.one80,
  }))
);


export const uniqueDates = [...new Set(allMatches.map((m) => m.date))].sort(
  (a, b) => {
    const [da, ma] = a.split(".").map(Number);
    const [db, mb] = b.split(".").map(Number);
    return db - da || mb - ma;
  }
);
