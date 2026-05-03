import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../api.service';
import { Player, PlayerService } from '../player.service';

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

  constructor(
    private route: ActivatedRoute,
    private playerService: PlayerService,
    private api: ApiService,
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (Number.isNaN(id)) {
      this.error = 'Invalid player id.';
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
      this.strengths = this.getStrengths(player.role);
      this.weaknesses = this.getWeaknesses(player.role);
      this.formTrend = this.getFormTrend(player.score);

      this.api.getPlayerAnalysis(id).subscribe({
        next: (analysis) => {
          this.analysisText = analysis.analysis;
          this.strengths = analysis.strengths?.length ? analysis.strengths : this.strengths;
          this.weaknesses = analysis.weaknesses?.length ? analysis.weaknesses : this.weaknesses;
          this.formTrend = analysis.statsTrend?.length
            ? analysis.statsTrend.map((entry) => entry.performanceScore)
            : this.formTrend;
          this.loading = false;
        },
        error: () => {
          this.analysisText = 'AI analysis is unavailable right now. Showing baseline scouting notes.';
          this.loading = false;
        }
      });
    });
  }

  onPlayerImageError(event: Event, player: Player) {
    const target = event.target as HTMLImageElement | null;

    if (target && target.src !== player.fallbackImageUrl) {
      target.src = player.fallbackImageUrl;
    }
  }

  private getStrengths(role: Player['role']) {
    switch (role) {
      case 'BAT':
        return ['Powerplay acceleration', 'Boundary conversion'];
      case 'BWL':
        return ['Death-over control', 'Swing and seam'];
      case 'AR':
        return ['Flexible matchups', 'Balance in XI'];
      case 'WK':
        return ['Quick stumping', 'Late-overs hitting'];
      default:
        return ['Adaptable skill set'];
    }
  }

  private getWeaknesses(role: Player['role']) {
    switch (role) {
      case 'BAT':
        return ['Susceptible to short ball', 'Lower off-side control'];
      case 'BWL':
        return ['Limited batting depth', 'High economy in powerplay'];
      case 'AR':
        return ['Role clarity needed', 'Form volatility'];
      case 'WK':
        return ['Strike rotation pressure', 'Workload fatigue'];
      default:
        return ['Sample size still small'];
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
