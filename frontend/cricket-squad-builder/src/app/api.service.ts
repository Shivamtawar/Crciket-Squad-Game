import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = '/api';
  private tokenStorageKey = 'cricketIdToken';

  constructor(private http: HttpClient) {}

  hasAuthToken() {
    return Boolean(this.getAuthToken());
  }

  getAuthToken() {
    return localStorage.getItem(this.tokenStorageKey);
  }

  getPlayers(): Observable<PlayersResponse> {
    return this.http.get<PlayersResponse>(`${this.baseUrl}/draft/players`, {
      headers: this.getAuthHeadersOrThrow(),
    });
  }

  getPlayerAnalysis(playerId: number): Observable<PlayerAnalysisResponse> {
    return this.http.get<PlayerAnalysisResponse>(
      `${this.baseUrl}/ai/player-analysis/${playerId}`
    );
  }

  getTeamAnalysis(teamIds: number[]): Observable<TeamAnalysisResponse> {
    return this.http.post<TeamAnalysisResponse>(`${this.baseUrl}/ai/team-analysis`, {
      teamIds,
    });
  }

  getWinProbability(teamIds: number[]): Observable<WinProbabilityResponse> {
    return this.http.post<WinProbabilityResponse>(`${this.baseUrl}/ai/win-probability`, {
      teamIds,
    });
  }

  getAutoSuggestTeam(currentCredits: number, teamRoles: Record<string, string>): Observable<AutoSuggestResponse> {
    return this.http.post<AutoSuggestResponse>(`${this.baseUrl}/ai/auto-suggest`, {
      currentCredits,
      teamRoles,
    });
  }

  runMatch(sessionId: string): Observable<MatchResponse> {
    return this.http.post<MatchResponse>(`${this.baseUrl}/match/runMatch`, { sessionId }, {
      headers: this.getAuthHeadersOrThrow(),
    });
  }

  getCoachInsights(sessionId: string) {
    return this.http.post(`${this.baseUrl}/coach/getCoachInsights`, { sessionId }, {
      headers: this.getAuthHeadersOrThrow(),
    });
  }

  private getAuthHeadersOrThrow() {
    const token = this.getAuthToken();

    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
