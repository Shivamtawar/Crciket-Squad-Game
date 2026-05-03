import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../api.service';
import { Player, PlayerService } from '../player.service';

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './match.html',
  styleUrl: './match.css',
})
export class Match implements OnInit {
  userSquad: Player[] = [];
  cpuSquad: Player[] = [];
  userTotal = 0;
  cpuTotal = 0;
  resultHeadline = '';
  resultDetail = '';
  error: string | null = null;
  winProbability: number | null = null;
  winKeyFactor = '';
  winDifficulty = '';
  loadingWinProbability = false;

  constructor(
    private playerService: PlayerService,
    private api: ApiService,
  ) {}

  ngOnInit() {
    this.playerService.loadPlayers().subscribe(() => {
      this.userSquad = [...this.playerService.getSelectedSquad()];

      if (this.userSquad.length !== 11) {
        this.error = 'Pick 11 players to start a match.';
        return;
      }

      this.simulateMatch();
      this.loadWinProbability();
    });
  }

  simulateMatch() {
    const allPlayers = this.playerService.getPlayers();
    this.cpuSquad = this.pickCpuSquad(allPlayers, this.userSquad);

    this.userTotal = this.sumScore(this.userSquad);
    this.cpuTotal = this.sumScore(this.cpuSquad);

    const userAdjusted = this.userTotal + this.randomSwing();
    const cpuAdjusted = this.cpuTotal + this.randomSwing();
    const margin = Math.abs(userAdjusted - cpuAdjusted);

    if (userAdjusted >= cpuAdjusted) {
      this.resultHeadline = 'You win the match';
      this.resultDetail = `Victory margin: ${margin} impact points`;
    } else {
      this.resultHeadline = 'Computer wins the match';
      this.resultDetail = `Defeat margin: ${margin} impact points`;
    }
  }

  loadWinProbability() {
    this.loadingWinProbability = true;
    const teamIds = this.userSquad.map((player) => player.id);

    this.api.getWinProbability(teamIds).subscribe({
      next: (response) => {
        this.winProbability = response.winProbability;
        this.winKeyFactor = response.keyFactor;
        this.winDifficulty = response.bossDifficultyMatch;
        this.loadingWinProbability = false;
      },
      error: () => {
        this.winProbability = 52;
        this.winKeyFactor = 'Balanced batting and bowling mix.';
        this.winDifficulty = 'medium';
        this.loadingWinProbability = false;
      }
    });
  }

  onPlayerImageError(event: Event, player: Player) {
    const target = event.target as HTMLImageElement | null;

    if (target && target.src !== player.fallbackImageUrl) {
      target.src = player.fallbackImageUrl;
    }
  }

  private sumScore(players: Player[]) {
    return players.reduce((total, player) => total + player.score, 0);
  }

  private randomSwing() {
    return Math.floor(Math.random() * 21) - 10;
  }

  private pickCpuSquad(allPlayers: Player[], userSquad: Player[]) {
    const excludedIds = new Set(userSquad.map((player) => player.id));
    const candidates = allPlayers.filter((player) => !excludedIds.has(player.id));
    const pool = candidates.length >= 11 ? candidates : allPlayers;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    return shuffled.slice(0, 11);
  }
}
