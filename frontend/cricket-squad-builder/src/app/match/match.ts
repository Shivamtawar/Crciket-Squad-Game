import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../api.service';
import { Player, PlayerService } from '../player.service';

interface MatchPhase {
  label: string;
  icon: string;
  done: boolean;
}

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './match.html',
  styleUrl: './match.css',
})
export class Match implements OnInit, OnDestroy {
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

  // Reveal state
  isLoading = true;
  loadingProgress = 0;
  phases: MatchPhase[] = [
    { label: 'Scanning squads…', icon: '🔍', done: false },
    { label: 'Running simulation…', icon: '⚡', done: false },
    { label: 'Calculating momentum…', icon: '📊', done: false },
    { label: 'Calling AI Scout…', icon: '🤖', done: false },
    { label: 'Finalising result…', icon: '🏆', done: false },
  ];

  showResult = false;
  showUserSquad = false;
  showCpuSquad = false;
  showStats = false;
  revealedUserPlayers: boolean[] = [];
  revealedCpuPlayers: boolean[] = [];

  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(
    private playerService: PlayerService,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit() {
    // Immediately load players from the in-memory service (no HTTP call)
    this.userSquad = [...this.playerService.getSelectedSquad()];

    if (this.userSquad.length !== 11) {
      this.error = 'Pick 11 players to start a match.';
      this.isLoading = false;
      return;
    }

    this.simulateMatch();

    // Only run browser-specific animations in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.startCinematicReveal();
    } else {
      // On SSR, skip animation and show everything immediately
      this.isLoading = false;
      this.showResult = true;
      this.showStats = true;
      this.showUserSquad = true;
      this.showCpuSquad = true;
      this.revealedUserPlayers = new Array(11).fill(true);
      this.revealedCpuPlayers = new Array(11).fill(true);
    }
  }

  ngOnDestroy() {
    this.timers.forEach(t => clearTimeout(t));
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
      this.resultHeadline = '🏆 You Win the Match!';
      this.resultDetail = `Victory margin: ${margin} impact points`;
    } else {
      this.resultHeadline = '😔 Computer Wins the Match';
      this.resultDetail = `Defeat margin: ${margin} impact points`;
    }

    this.revealedUserPlayers = new Array(11).fill(false);
    this.revealedCpuPlayers = new Array(11).fill(false);
  }

  startCinematicReveal() {
    // Tick each phase every ~700ms
    this.phases.forEach((phase, i) => {
      const t = setTimeout(() => {
        phase.done = true;
        this.loadingProgress = ((i + 1) / this.phases.length) * 100;
        this.cdr.markForCheck();
      }, 600 + i * 700);
      this.timers.push(t);
    });

    // At 4.5s: hide loader, show result card
    const t1 = setTimeout(() => {
      this.isLoading = false;
      this.showResult = true;
      this.cdr.markForCheck();
    }, 4500);
    this.timers.push(t1);

    // At 5s: show stats
    const t2 = setTimeout(() => {
      this.showStats = true;
      this.cdr.markForCheck();
    }, 5000);
    this.timers.push(t2);

    // At 5.5s: show user squad header
    const t3 = setTimeout(() => {
      this.showUserSquad = true;
      this.cdr.markForCheck();
    }, 5500);
    this.timers.push(t3);

    // Reveal user players one by one (every 150ms)
    for (let i = 0; i < 11; i++) {
      const t = setTimeout(() => {
        this.revealedUserPlayers[i] = true;
        this.cdr.markForCheck();
      }, 5600 + i * 150);
      this.timers.push(t);
    }

    // At 7.5s: show CPU squad header
    const t4 = setTimeout(() => {
      this.showCpuSquad = true;
      this.cdr.markForCheck();
    }, 7500);
    this.timers.push(t4);

    // Reveal CPU players one by one
    for (let i = 0; i < 11; i++) {
      const t = setTimeout(() => {
        this.revealedCpuPlayers[i] = true;
        this.cdr.markForCheck();
      }, 7600 + i * 150);
      this.timers.push(t);
    }

    // AI Win Probability call
    const teamIds = this.userSquad.map(p => p.id);
    this.api.getWinProbability(teamIds).subscribe({
      next: (res) => {
        this.winProbability = res.winProbability;
        this.winKeyFactor = res.keyFactor;
        this.winDifficulty = res.bossDifficultyMatch;
        this.cdr.markForCheck();
      },
      error: () => {
        this.winProbability = 52;
        this.winKeyFactor = 'Balanced batting and bowling mix.';
        this.winDifficulty = 'medium';
        this.cdr.markForCheck();
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
    return players.reduce((total, p) => total + p.score, 0);
  }

  private randomSwing() {
    return Math.floor(Math.random() * 21) - 10;
  }

  private pickCpuSquad(allPlayers: Player[], userSquad: Player[]) {
    const excludedIds = new Set(userSquad.map(p => p.id));
    const candidates = allPlayers.filter(p => !excludedIds.has(p.id));
    const pool = candidates.length >= 11 ? candidates : allPlayers;
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 11);
  }
}
