import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface ApiPlayer {
  id: number;
  cardName: string;
  description: string;
  score: number;
  rarity: string;
  imageUrl: string;
  cardCost: number;
  role: 'BAT' | 'BWL' | 'AR' | 'WK';
  baseStats?: {
    power?: number;
    defense?: number;
  };
  formFactor?: number;
  specialty?: string;
}

export interface PlayersResponse {
  success: boolean;
  players: ApiPlayer[];
  count: number;
}

export interface PlayerAnalysisResponse {
  analysis: string;
  statsTrend: Array<{ year: string; performanceScore: number }>;
  strengths: string[];
  weaknesses: string[];
}

export interface TeamAnalysisResponse {
  teamRating: number;
  verdict: string;
  strengths: string[];
  vulnerabilities: string[];
  swaps: Array<{ from: string; to: string; reason: string }>;
  improvements: string[];
}

export interface WinProbabilityResponse {
  winProbability: number;
  keyFactor: string;
  bossDifficultyMatch: string;
}

export interface AutoSuggestResponse {
  suggestedTeam: number[];
  reasoning?: string;
}

export interface MatchResponse {
  success: boolean;
  result: {
    winner: 'USER' | 'BOSS' | 'TIE';
    margin: string;
    userScore: { runs: number; wickets: number; rating: number };
    bossScore: { runs: number; wickets: number; rating: number };
    bossTeam: { name: string; difficulty: string };
    userTeamStats: { avgPower: number; avgDefense: number; avgForm: number };
  };
  simulationLog: Array<unknown>;
}

const PLAYER_ANALYSES: Record<number, PlayerAnalysisResponse> = {
  default: {
    analysis: "An exceptional talent with remarkable consistency across formats. Known for clutch performances under pressure and the ability to turn the game single-handedly.",
    statsTrend: [
      { year: '2020', performanceScore: 65 },
      { year: '2021', performanceScore: 72 },
      { year: '2022', performanceScore: 80 },
      { year: '2023', performanceScore: 85 },
      { year: '2024', performanceScore: 92 },
    ],
    strengths: ['Consistent performer', 'Excellent under pressure'],
    weaknesses: ['Vulnerable to short-pitched bowling'],
  },
} as any;

const PLAYER_ANALYSIS_POOL: PlayerAnalysisResponse[] = [
  {
    analysis: "A match-winner who thrives under pressure. Technical brilliance combined with mental toughness makes them a must-have in any XI.",
    statsTrend: [
      { year: '2020', performanceScore: 70 },
      { year: '2021', performanceScore: 78 },
      { year: '2022', performanceScore: 82 },
      { year: '2023', performanceScore: 88 },
      { year: '2024', performanceScore: 94 },
    ],
    strengths: ['Elite technique', 'Powerplay dominance', 'Death-over finishing'],
    weaknesses: ['Occasional slowdown mid-innings', 'Susceptible to leg-spin'],
  },
  {
    analysis: "A proven match-winner with the ability to single-handedly change the course of a game. World-class consistency.",
    statsTrend: [
      { year: '2020', performanceScore: 60 },
      { year: '2021', performanceScore: 68 },
      { year: '2022', performanceScore: 75 },
      { year: '2023', performanceScore: 83 },
      { year: '2024', performanceScore: 90 },
    ],
    strengths: ['Explosive power hitting', '360-degree game', 'Boundary conversion'],
    weaknesses: ['Short-ball vulnerability', 'Off-side gap under pressure'],
  },
  {
    analysis: "Exceptional skill set with remarkable adaptability. This player reads the game exceptionally well and adjusts strategy on the fly.",
    statsTrend: [
      { year: '2020', performanceScore: 55 },
      { year: '2021', performanceScore: 65 },
      { year: '2022', performanceScore: 73 },
      { year: '2023', performanceScore: 79 },
      { year: '2024', performanceScore: 87 },
    ],
    strengths: ['Game awareness', 'Clutch performer', 'Team player'],
    weaknesses: ['Form volatility', 'Inconsistent against express pace'],
  },
];

const TEAM_VERDICTS = [
  "An elite, well-balanced squad with lethal top-order firepower and disciplined death bowling. This XI can compete against any opposition.",
  "A power-packed lineup with world-class all-rounders providing excellent balance. The spin department looks particularly threatening.",
  "Strong batting depth gives this squad excellent insurance, but the pace attack needs to be sharper in the powerplay.",
  "A tactically sound XI with match-winners at key positions. The middle order could be the difference-maker in tight situations.",
];

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor() {}

  hasAuthToken() {
    return true;
  }

  getAuthToken() {
    return 'dummy-token';
  }

  getPlayers(): Observable<PlayersResponse> {
    return of({ success: true, players: [], count: 0 }).pipe(delay(100));
  }

  getPlayerAnalysis(playerId: number): Observable<PlayerAnalysisResponse> {
    const pool = PLAYER_ANALYSIS_POOL;
    const analysis = pool[playerId % pool.length];
    return of(analysis).pipe(delay(800));
  }

  getTeamAnalysis(teamIds: number[]): Observable<TeamAnalysisResponse> {
    const verdict = TEAM_VERDICTS[teamIds.length % TEAM_VERDICTS.length];
    const result: TeamAnalysisResponse = {
      teamRating: 82,
      verdict,
      strengths: ['Elite Top Order', 'Spin Variety', 'Experienced Core'],
      vulnerabilities: ['Lack of Express Pacer', 'Thin Batting Tail'],
      swaps: [
        { from: 'Mohammed Shami', to: 'Jasprit Bumrah', reason: 'Adds world-class death bowling capability.' },
        { from: 'Deepak Hooda', to: 'Hardik Pandya', reason: 'Hardik provides better all-round impact.' },
      ],
      improvements: ['Strengthen death bowling', 'Add a genuine all-rounder'],
    };
    return of(result).pipe(delay(1200));
  }

  getWinProbability(teamIds: number[]): Observable<WinProbabilityResponse> {
    const base = teamIds.length > 0 ? (teamIds.reduce((a, b) => a + b, 0) % 30) + 55 : 62;
    const result: WinProbabilityResponse = {
      winProbability: Math.min(92, Math.max(48, base)),
      keyFactor: 'Strong middle-order depth combined with quality death bowling.',
      bossDifficultyMatch: 'medium',
    };
    return of(result).pipe(delay(1000));
  }

  getAutoSuggestTeam(currentCredits: number, teamRoles: Record<string, string>): Observable<AutoSuggestResponse> {
    // Return IDs 1–40 shuffled, pick first 11
    const ids = Array.from({ length: 40 }, (_, i) => i + 1);
    const shuffled = ids.sort(() => Math.random() - 0.5).slice(0, 11);
    return of({ suggestedTeam: shuffled, reasoning: 'Optimized for balance and budget.' }).pipe(delay(1500));
  }

  runMatch(sessionId: string): Observable<MatchResponse> {
    const userWins = Math.random() > 0.45;
    const margin = Math.floor(Math.random() * 30) + 5;
    const result: MatchResponse = {
      success: true,
      result: {
        winner: userWins ? 'USER' : 'BOSS',
        margin: `${margin} runs`,
        userScore: { runs: 165 + Math.floor(Math.random() * 30), wickets: Math.floor(Math.random() * 5) + 4, rating: 78 },
        bossScore: { runs: 150 + Math.floor(Math.random() * 30), wickets: Math.floor(Math.random() * 5) + 5, rating: 72 },
        bossTeam: { name: 'CPU XI', difficulty: 'medium' },
        userTeamStats: { avgPower: 80, avgDefense: 75, avgForm: 82 },
      },
      simulationLog: [],
    };
    return of(result).pipe(delay(1000));
  }

  getCoachInsights(sessionId: string) {
    return of({
      commentary: "Your team shows great promise! The batting order is solid, but you might want to reconsider your bowling attack for better variation.",
      strengths: ['Strong batting lineup', 'Good spin options'],
      improvements: ['Add a genuine pace bowler', 'Strengthen lower middle order'],
    }).pipe(delay(1000));
  }
}
