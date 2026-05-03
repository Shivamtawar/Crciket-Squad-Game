import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Player, PlayerService } from '../player.service';

@Component({
  selector: 'app-coach-critique',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coach-critique.html',
  styleUrl: './coach-critique.css',
})
export class CoachCritique implements OnInit {
  selectedSquad: Player[] = [];
  remainingBudget: number = 5.0;

  constructor(
    private playerService: PlayerService,
    private router: Router,
  ) {}

  ngOnInit() {
    // For demo purposes, we're pulling the first 11 players
    this.selectedSquad = this.playerService.getPlayers().slice(0, 11);
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
}