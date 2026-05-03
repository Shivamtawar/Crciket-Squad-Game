import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
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

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.pool = this.playerService.getPlayers();
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
  }

  get filteredPool() {
    return this.selectedFilter === 'ALL' 
      ? this.pool 
      : this.pool.filter(p => p.role === this.selectedFilter);
  }
}
