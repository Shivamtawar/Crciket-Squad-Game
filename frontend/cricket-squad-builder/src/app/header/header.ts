import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { PlayerService } from '../player.service';

const TOTAL_BUDGET = 100;

@Component({
  selector: 'app-header',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly totalBudget = TOTAL_BUDGET;

  constructor(
    private playerService: PlayerService,
    private router: Router,
  ) {}

  get selectedSquad$() {
    return this.playerService.selectedSquad$;
  }

  get creditsUsed$() {
    return this.playerService.selectedSquad$.pipe(
      map(squad => squad.reduce((sum, p) => sum + p.cardCost, 0))
    );
  }

  get creditsLeft$() {
    return this.creditsUsed$.pipe(
      map(used => +(TOTAL_BUDGET - used).toFixed(1))
    );
  }

  get creditsPct$() {
    return this.creditsLeft$.pipe(
      map(left => (left / TOTAL_BUDGET) * 100)
    );
  }

  startMatch(squadSize: number, creditsLeft: number) {
    if (squadSize !== 11 || creditsLeft < 0) return;
    this.router.navigate(['/match']);
  }
}
