import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Player, PlayerService } from '../player.service';

const ANALYSES = [
  "A match-winner who thrives under pressure. Technical brilliance combined with mental toughness makes them a must-have in any XI.",
  "Exceptional skill set with remarkable adaptability. Reads the game and adjusts strategy on the fly — a true professional.",
  "A proven performer with world-class consistency. Their presence alone lifts the entire team's morale and batting depth.",
  "Elite talent with an explosive style that can single-handedly change the course of a match in just a few deliveries.",
  "One of the finest in the current generation. Their record speaks for itself — clutch moments are where they shine brightest.",
];

const STRENGTHS: Record<string, string[]> = {
  BAT: ['Powerplay acceleration', 'Boundary conversion', 'Consistent average across formats'],
  BWL: ['Death-over control', 'Swing and seam movement', 'Tight economy rate'],
  AR:  ['Flexible matchups', 'Balance in XI', 'Clutch contributions with bat and ball'],
  WK:  ['Quick stumping', 'Late-overs hitting', 'Sharp reflexes behind the stumps'],
};

const WEAKNESSES: Record<string, string[]> = {
  BAT: ['Susceptible to short-pitched bowling', 'Off-side gap under pressure'],
  BWL: ['Limited batting depth', 'Economy can leak in powerplay'],
  AR:  ['Role clarity needed in close games', 'Form volatility across conditions'],
  WK:  ['Strike rotation pressure in middle overs', 'Workload fatigue in long series'],
};

@Component({
  selector: 'app-player-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './player-analytics.html',
  styleUrl: './player-analytics.css',
})
export class PlayerAnalytics implements OnInit {
  player: Player | null = null;
  error: string | null = null;
  loading = true;
  analysisText = '';

  strengths: string[] = [];
  weaknesses: string[] = [];
  formTrend: number[] = [];

  loadingPhase = 'Connecting to AI Scout...';

  constructor(
    private route: ActivatedRoute,
    private playerService: PlayerService,
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (Number.isNaN(id)) {
      this.error = 'Invalid player id.';
      this.loading = false;
      return;
    }

    this.playerService.loadPlayers().subscribe((players) => {
      const player = players.find((item) => item.id === id);

      if (!player) {
        this.error = 'Player not found.';
        this.loading = false;
        return;
      }

      this.player = player;
      this.strengths = STRENGTHS[player.role] ?? ['Adaptable skill set'];
      this.weaknesses = WEAKNESSES[player.role] ?? ['Sample size still small'];
      this.formTrend = this.getFormTrend(player.score);

      // Phase 1: loading message
      this.loadingPhase = 'Connecting to AI Scout...';
      setTimeout(() => { this.loadingPhase = 'Fetching career statistics...'; }, 600);
      setTimeout(() => { this.loadingPhase = 'Running performance model...'; }, 1200);

      // Phase 2: reveal data after delay
      setTimeout(() => {
        const base = Math.max(40, Math.min(90, Math.round(player.score / 3)));
        this.analysisText = ANALYSES[player.id % ANALYSES.length];
        this.formTrend = [
          Math.max(35, base - 15),
          Math.max(35, base - 8),
          base,
          Math.min(95, base + 6),
          Math.max(35, base - 2),
          Math.min(95, base + 12),
        ];
        this.loading = false;
      }, 1800);
    });
  }

  onPlayerImageError(event: Event, player: Player) {
    const target = event.target as HTMLImageElement | null;
    if (target && target.src !== player.fallbackImageUrl) {
      target.src = player.fallbackImageUrl;
    }
  }

  private getFormTrend(score: number) {
    const base = Math.max(40, Math.min(95, Math.round(score / 3)));
    return [
      Math.max(35, base - 12),
      Math.max(35, base - 5),
      base,
      Math.min(95, base + 6),
      Math.max(35, base - 2),
      Math.min(95, base + 10),
    ];
  }
}
