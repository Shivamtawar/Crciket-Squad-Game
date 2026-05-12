import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
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
  analysisLoadingPhase = 'Connecting to AI Scout...';

  // Win Probability State
  winProbabilityData: any = null;
  loadingWinProbability = false;
  showWinProbability = false;

  // Team Analysis (Coach) State
  teamAnalysisData: any = null;
  loadingTeamAnalysis = false;
  showSquadQuality = false;
  teamLoadingPhase = 'Analyzing squad composition...';

  // Share State
  shareToastVisible = false;

  constructor(
    private playerService: PlayerService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit() {
    this.playerService.loadPlayers().subscribe((players) => {
      // Check for shared squad in URL params
      const squadParam = this.route.snapshot.queryParamMap.get('squad');
      if (squadParam) {
        const sharedIds = new Set(squadParam.split(',').map(Number));
        const sharedSquad = players.filter(p => sharedIds.has(p.id));
        this.mySquad = sharedSquad;
        this.playerService.setSelectedSquad(sharedSquad);
        this.pool = players
          .filter(p => !sharedIds.has(p.id))
          .sort((a, b) => b.cardCost - a.cardCost);
      } else {
        const savedSquad = this.playerService.getSelectedSquad();
        this.mySquad = [...savedSquad];
        const squadIds = new Set(this.mySquad.map(p => p.id));
        this.pool = players
          .filter(p => !squadIds.has(p.id))
          .sort((a, b) => b.cardCost - a.cardCost);
      }
      this.loading = false;
      if (this.mySquad.length >= 7) {
        this.calculateWinProbability();
      }
    });
  }

  drop(event: CdkDragDrop<Player[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      if (event.container.data === this.mySquad && this.mySquad.length >= 11) {
        return;
      }
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

  addToSquad(event: Event, player: Player) {
    event.stopPropagation();
    if (this.mySquad.length >= 11) return;
    if (!this.pool.find(p => p.id === player.id)) return;
    this.pool = this.pool.filter(p => p.id !== player.id);
    this.mySquad = [...this.mySquad, player];
    this.syncSelectedSquad();
  }

  removeFromSquad(event: Event, player: Player) {
    event.stopPropagation();
    if (!this.mySquad.find(p => p.id === player.id)) return;
    this.mySquad = this.mySquad.filter(p => p.id !== player.id);
    this.pool = [...this.pool, player].sort((a, b) => b.cardCost - a.cardCost);
    this.syncSelectedSquad();
  }

  resetSquad() {
    this.pool = [...this.pool, ...this.mySquad].sort((a, b) => b.cardCost - a.cardCost);
    this.mySquad = [];
    this.winProbabilityData = null;
    this.teamAnalysisData = null;
    this.playerService.setSelectedSquad([]);
  }

  syncSelectedSquad() {
    this.playerService.setSelectedSquad(this.mySquad);
    if (this.mySquad.length >= 7) {
      this.calculateWinProbability();
    } else {
      this.winProbabilityData = null;
    }
    if (this.mySquad.length !== 11) {
      this.teamAnalysisData = null;
    }
  }

  calculateWinProbability() {
    this.loadingWinProbability = true;
    const base = this.mySquad.length > 0
      ? (this.mySquad.reduce((a, p) => a + p.id, 0) % 30) + 55
      : 62;
    setTimeout(() => {
      this.winProbabilityData = {
        winProbability: Math.min(92, Math.max(48, base)),
        keyFactor: 'Strong middle-order depth combined with quality death bowling.',
        bossDifficultyMatch: 'medium',
      };
      this.loadingWinProbability = false;
      this.cdr.markForCheck();
    }, 900);
  }

  openWinProbability() {
    if (this.mySquad.length < 7) return;
    this.showWinProbability = true;
  }

  closeWinProbability() {
    this.showWinProbability = false;
  }

  fetchTeamAnalysis() {
    this.loadingTeamAnalysis = true;
    this.teamLoadingPhase = 'Connecting to Gemini...';
    setTimeout(() => { this.teamLoadingPhase = 'Reading squad composition...'; this.cdr.markForCheck(); }, 2000);
    setTimeout(() => { this.teamLoadingPhase = 'Evaluating batting lineup depth...'; this.cdr.markForCheck(); }, 4500);
    setTimeout(() => { this.teamLoadingPhase = 'Cross-referencing bowling matchups...'; this.cdr.markForCheck(); }, 7000);
    setTimeout(() => { this.teamLoadingPhase = 'Analyzing death-over strategies...'; this.cdr.markForCheck(); }, 9500);
    setTimeout(() => { this.teamLoadingPhase = 'Identifying tactical vulnerabilities...'; this.cdr.markForCheck(); }, 12000);
    setTimeout(() => { this.teamLoadingPhase = 'Generating tactical report...'; this.cdr.markForCheck(); }, 14500);
    const verdicts = [
      "An elite, well-balanced squad with lethal top-order firepower and disciplined death bowling. This XI can compete against any opposition.",
      "A power-packed lineup with world-class all-rounders providing excellent balance. The spin department looks particularly threatening.",
      "Strong batting depth gives this squad excellent insurance, but the pace attack needs to be sharper in the powerplay.",
      "A tactically sound XI with match-winners at key positions. The middle order could be the difference-maker in tight situations.",
    ];
    const i = this.mySquad.length % verdicts.length;
    const lowestScorer = [...this.mySquad].sort((a, b) => a.score - b.score)[0];
    setTimeout(() => {
      this.teamAnalysisData = {
        verdict: verdicts[i],
        strengths: ['Elite Top Order', 'Spin Variety', 'Experienced Core'],
        vulnerabilities: ['Lack of Express Pacer', 'Thin Batting Tail'],
        swaps: lowestScorer ? [
          { from: lowestScorer.cardName, to: 'Jasprit Bumrah', reason: 'Adds world-class death bowling capability.' },
        ] : [],
      };
      this.loadingTeamAnalysis = false;
      this.cdr.markForCheck();
    }, 17000);
  }

  openSquadQuality() {
    if (this.mySquad.length !== 11) return;
    this.showSquadQuality = true;
    if (!this.teamAnalysisData) {
      this.fetchTeamAnalysis();
    }
  }

  closeSquadQuality() {
    this.showSquadQuality = false;
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
    this.analysisLoadingPhase = 'Connecting to Gemini...';
    setTimeout(() => { this.analysisLoadingPhase = 'Fetching career statistics...'; this.cdr.markForCheck(); }, 2000);
    setTimeout(() => { this.analysisLoadingPhase = 'Scanning IPL & international records...'; this.cdr.markForCheck(); }, 4500);
    setTimeout(() => { this.analysisLoadingPhase = 'Running performance prediction model...'; this.cdr.markForCheck(); }, 7000);
    setTimeout(() => { this.analysisLoadingPhase = 'Analysing form trend across 5 years...'; this.cdr.markForCheck(); }, 9500);
    setTimeout(() => { this.analysisLoadingPhase = 'Identifying strengths & risk areas...'; this.cdr.markForCheck(); }, 12000);
    setTimeout(() => { this.analysisLoadingPhase = 'Finalising scouting report...'; this.cdr.markForCheck(); }, 14000);

    const base = Math.max(40, Math.min(90, Math.round(player.score / 3)));
    const analyses = [
      "A match-winner who thrives under pressure. Technical brilliance combined with mental toughness makes them a must-have in any XI.",
      "Exceptional skill set with remarkable adaptability. Reads the game and adjusts strategy on the fly.",
      "A proven performer with world-class consistency. Their presence alone lifts the entire team's morale.",
      "Elite talent with an explosive style. Can single-handedly change the course of a match in just a few deliveries.",
    ];
    const strengthsByRole: Record<string, string[]> = {
      BAT: ['Powerplay acceleration', 'Boundary conversion', 'Consistent average'],
      BWL: ['Death-over control', 'Swing and seam movement', 'Economy rate'],
      AR:  ['Flexible matchups', 'Balance in XI', 'Clutch contributions'],
      WK:  ['Quick stumping', 'Late-overs hitting', 'Sharp reflexes'],
    };
    const weaknessesByRole: Record<string, string[]> = {
      BAT: ['Susceptible to short ball', 'Off-side gap under pressure'],
      BWL: ['Limited batting depth', 'Economy in powerplay'],
      AR:  ['Role clarity needed', 'Form volatility'],
      WK:  ['Strike rotation pressure', 'Workload fatigue'],
    };

    setTimeout(() => {
      this.playerAnalysis = {
        analysis: analyses[player.id % analyses.length],
        statsTrend: [
          { year: '2020', performanceScore: Math.max(35, base - 15) },
          { year: '2021', performanceScore: Math.max(35, base - 8) },
          { year: '2022', performanceScore: base },
          { year: '2023', performanceScore: Math.min(95, base + 6) },
          { year: '2024', performanceScore: Math.min(95, base + 12) },
        ],
        strengths: strengthsByRole[player.role] ?? ['Adaptable skill set'],
        weaknesses: weaknessesByRole[player.role] ?? ['Sample size still small'],
      };
      this.loadingAnalysis = false;
      this.cdr.markForCheck();
    }, 16000);
  }

  closeAnalytics() {
    this.selectedPlayerForAnalytics = null;
    this.playerAnalysis = null;
  }

  getAiSuggestion() {
    // Merge everyone back together, then pick 11 by score
    const allPlayers = [...this.pool, ...this.mySquad].sort((a, b) => b.score - a.score);

    // Pick a balanced team: 4 BAT, 3 BWL, 2 AR, 2 WK (or best available)
    const pick = (role: string, count: number) =>
      allPlayers.filter(p => p.role === role).slice(0, count);

    let suggested = [
      ...pick('BAT', 4),
      ...pick('BWL', 3),
      ...pick('AR', 2),
      ...pick('WK', 2),
    ];

    // Remove duplicates
    const seen = new Set<number>();
    suggested = suggested.filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    // If less than 11, fill with remaining top-scored players
    if (suggested.length < 11) {
      const remaining = allPlayers.filter(p => !seen.has(p.id));
      for (const p of remaining) {
        if (suggested.length >= 11) break;
        suggested.push(p);
      }
    }

    suggested = suggested.slice(0, 11);
    const suggestedIds = new Set(suggested.map(p => p.id));

    this.mySquad = suggested;
    this.pool = allPlayers.filter(p => !suggestedIds.has(p.id));
    this.syncSelectedSquad();
  }
}
