import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Player, PlayerService } from '../player.service';

@Component({
  selector: 'app-squad-builder',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './squad-builder.html',
  styleUrl: './squad-builder.css',
})
export class SquadBuilder implements OnInit {
  pool: Player[] = [];
  mySquad: Player[] = [];
  selectedFilter = 'ALL';
  loading = true;
  error: string | null = null;

  // Analytics Modal State
  selectedPlayerForAnalytics: Player | null = null;
  playerAnalysis: any = null;
  loadingAnalysis = false;

  // Win Probability State
  winProbabilityData: any = null;
  loadingWinProbability = false;
  showWinProbability = false;
  private winProbabilityTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private playerService: PlayerService,
    private router: Router,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.playerService.loadPlayers().subscribe((players) => {
      this.pool = players.sort((a, b) => b.cardCost - a.cardCost);
      this.mySquad = [...this.playerService.getSelectedSquad()];
      this.syncSelectedSquad();
      this.loading = false;
    });
  }

  drop(event: CdkDragDrop<Player[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }

    this.syncSelectedSquad();
  }

  onPlayerImageError(event: Event, player: Player) {
    const target = event.target as HTMLImageElement | null;

    if (target && target.src !== player.fallbackImageUrl) {
      target.src = player.fallbackImageUrl;
    }
  }

  openPlayer(player: Player) {
    this.router.navigate(['/player', player.id]);
  }

  private syncSelectedSquad() {
    this.playerService.setSelectedSquad(this.mySquad);
    if (this.mySquad.length < 7) {
      this.winProbabilityData = null;
    }
  }

  calculateWinProbability() {
    this.loadingWinProbability = true;

    if (this.winProbabilityTimer) {
      clearTimeout(this.winProbabilityTimer);
    }

    this.winProbabilityTimer = setTimeout(() => {
      if (!this.showWinProbability) {
        this.loadingWinProbability = false;
        return;
      }

      this.winProbabilityData = {
        winProbability: 52,
        keyFactor: 'Balanced batting and bowling mix.',
        bossDifficultyMatch: 'medium',
      };
      this.loadingWinProbability = false;
      this.winProbabilityTimer = null;
    }, 5000);
  }

  openWinProbability() {
    if (this.mySquad.length < 7) {
      return;
    }

    this.showWinProbability = true;
    this.calculateWinProbability();
  }

  closeWinProbability() {
    this.showWinProbability = false;

    if (this.winProbabilityTimer) {
      clearTimeout(this.winProbabilityTimer);
      this.winProbabilityTimer = null;
    }

    this.loadingWinProbability = false;
  }

  openPlayerFromButton(event: Event, player: Player) {
    event.stopPropagation();
    this.openPlayer(player);
  }

  get filteredPool() {
    return this.selectedFilter === 'ALL'
      ? this.pool
      : this.pool.filter(p => p.role === this.selectedFilter);
  }

  openAnalytics(player: Player) {
    this.selectedPlayerForAnalytics = player;
    this.loadingAnalysis = true;
    this.playerAnalysis = null;

    this.api.getPlayerAnalysis(player.id).subscribe({
      next: (analysis) => {
        this.playerAnalysis = analysis;
        this.loadingAnalysis = false;
      },
      error: (err) => {
        console.error('Failed to load player analytics:', err);
        // Fallback to empty mock data if AI fails or key is missing
        this.playerAnalysis = {
          analysis: "AI Scout is currently offline, but this player shows consistent growth in domestic leagues.",
          statsTrend: [
            { year: 2020, performanceScore: 65 },
            { year: 2021, performanceScore: 72 },
            { year: 2022, performanceScore: 85 },
            { year: 2023, performanceScore: 80 },
            { year: 2024, performanceScore: 92 }
          ],
          strengths: ["Consistency", "Power Play Strike Rate"],
          weaknesses: ["Spin in Middle Overs"]
        };
        this.loadingAnalysis = false;
      }
    });
  }

  closeAnalytics() {
    this.selectedPlayerForAnalytics = null;
    this.playerAnalysis = null;
  }

  getAiSuggestion() {
    this.loading = true;
    this.api.getAutoSuggestTeam(100, {}).subscribe({
      next: (res) => {
        if (res.suggestedTeam) {
          // Map IDs back to Player objects
          const suggested = res.suggestedTeam
            .map((id: number) => this.pool.find(p => p.id === id))
            .filter((p: Player | undefined): p is Player => p !== undefined);

          this.mySquad = suggested;
          // Remove them from pool
          this.pool = this.pool.filter(p => !res.suggestedTeam.includes(p.id));
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('AI Suggestion failed:', err);
        alert('AI Scout is busy. Try picking your own squad!');
        this.loading = false;
      }
    });
  }
}
