import { Routes } from '@angular/router';
import { Home } from './home/home';
import { PlayerAnalytics } from './player-analytics/player-analytics';
import { Match } from './match/match';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'player/:id', component: PlayerAnalytics },
  { path: 'match', component: Match },
  { path: '**', redirectTo: '' },
];
