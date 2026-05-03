import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlayerService } from '../player.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(
    private playerService: PlayerService,
    private router: Router,
  ) {}

  get selectedSquad$() {
    return this.playerService.selectedSquad$;
  }

  startMatch(squadSize: number) {
    if (squadSize !== 11) {
      return;
    }

    this.router.navigate(['/match']);
  }
}
