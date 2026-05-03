import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
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

  constructor(
    private playerService: PlayerService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.pool = this.playerService.getPlayers();
    this.mySquad = [...this.playerService.getSelectedSquad()];
    this.syncSelectedSquad();
    this.loading = false;
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
}
