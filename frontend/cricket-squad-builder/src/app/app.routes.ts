import { Routes } from '@angular/router';
import { Home } from './home/home';
import { PlayerAnalytics } from './player-analytics/player-analytics';
import { Match } from './match/match';
import { CoachCritique } from './coach-critique/coach-critique';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'player/:id', component: PlayerAnalytics },
  { path: 'match', component: Match },
  { path: 'coach', component: CoachCritique },
  { path: '**', redirectTo: '' },
];
