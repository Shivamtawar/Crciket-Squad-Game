import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Player, PlayerService } from '../player.service';

const TOTAL_BUDGET = 100;

interface CoachAnalysis {
  commentary: string;
  strengths: string[];
  vulnerabilities: string[];
  swaps: Array<{ out: string; in: string; reason: string }>;
}

interface ChatMessage {
  from: 'user' | 'coach';
  text: string;
}

const CHAT_RESPONSES: Record<string, string> = {
  default: "Great question! Based on the current squad composition, I'd focus on ensuring balance between batting depth and bowling variety. Every strong XI needs at least 5 proper batters and 4 bowlers.",
  pitch: "The pitch conditions heavily favor swing bowlers early on. I'd recommend having at least 2 seamers in your attack to exploit the conditions in the first 6 overs.",
  bumrah: "Jasprit Bumrah is arguably the best death bowler in the world right now. His ability to bowl yorkers and slower balls at will makes him unplayable in the final overs.",
  kohli: "Virat Kohli's consistency across formats is unmatched. With over 70 international centuries, having him at No.3 gives your batting order immense stability and firepower.",
  spin: "Spin bowlers thrive in subcontinental conditions. Having 2 quality spinners gives you great control in the middle overs and the ability to turn the game around.",
  pace: "Express pace is a game-changer. A genuine 140kph+ bowler creates uncertainty in the batsman's mind and can break partnerships when other bowlers struggle.",
  balance: "An ideal XI should have 5-6 batters, 1 wicket-keeper, 1-2 all-rounders, and 3-4 bowlers. This gives you flexibility in all match situations.",
};

function getCoachResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const key of Object.keys(CHAT_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) {
      return CHAT_RESPONSES[key];
    }
  }
  return CHAT_RESPONSES['default'];
}

function buildAnalysis(squad: Player[]): CoachAnalysis {
  const bats = squad.filter(p => p.role === 'BAT');
  const bwls = squad.filter(p => p.role === 'BWL');
  const ars  = squad.filter(p => p.role === 'AR');
  const wks  = squad.filter(p => p.role === 'WK');

  const topPlayer = squad.length ? [...squad].sort((a, b) => b.score - a.score)[0] : null;
  const totalScore = squad.reduce((s, p) => s + p.score, 0);
  const avgScore = squad.length ? Math.round(totalScore / squad.length) : 0;

  // Commentary
  let commentary = '';
  if (squad.length === 0) {
    commentary = "No players selected yet. Head to the Draft Room and start building your XI!";
  } else if (squad.length < 11) {
    commentary = `You've selected ${squad.length} players so far. Keep building — you need ${11 - squad.length} more to complete your XI. Currently your squad average score is ${avgScore}, which is ${avgScore > 220 ? 'impressive' : 'decent'}.`;
  } else {
    const starName = topPlayer?.cardName ?? 'your star player';
    const batStr = bats.length >= 4 ? 'a solid batting core' : 'a thin batting lineup';
    const bwlStr = bwls.length + ars.length >= 4 ? 'a well-rounded bowling attack' : 'a bowling attack that needs depth';
    commentary = `Your XI looks ${avgScore > 230 ? 'very strong' : 'competitive'} on paper with an average score of ${avgScore}. You have ${batStr} and ${bwlStr}. ${starName} will be the key match-winner — build your strategy around them. ${wks.length === 0 ? 'Warning: No designated wicket-keeper detected!' : ''}`;
  }

  // Strengths
  const strengths: string[] = [];
  if (bats.length >= 4) strengths.push(`Deep batting lineup (${bats.length} batters)`);
  if (bwls.length >= 3) strengths.push(`Strong bowling attack (${bwls.length} bowlers)`);
  if (ars.length >= 2) strengths.push(`Excellent all-round flexibility (${ars.length} all-rounders)`);
  if (avgScore > 225) strengths.push(`High-quality squad (avg score: ${avgScore})`);
  if (squad.length >= 11) strengths.push('Complete XI — ready for battle');
  if (strengths.length === 0) strengths.push('Squad is taking shape — keep drafting!');

  // Vulnerabilities
  const vulns: string[] = [];
  if (bats.length < 4) vulns.push(`Thin batting order — only ${bats.length} dedicated batters`);
  if (bwls.length < 3) vulns.push(`Bowling is light — only ${bwls.length} pure bowlers`);
  if (wks.length === 0) vulns.push('No wicket-keeper in the squad');
  if (ars.length === 0) vulns.push('No all-rounders — limited flexibility');
  if (avgScore < 210 && squad.length > 0) vulns.push('Below-par squad rating — consider upgrades');
  if (vulns.length === 0) vulns.push('No critical gaps detected — great balance!');

  // Swaps
  const swaps: Array<{ out: string; in: string; reason: string }> = [];
  const lowestScorer = squad.length ? [...squad].sort((a, b) => a.score - b.score)[0] : null;
  if (lowestScorer && squad.length === 11) {
    const swapMap: Record<string, { in: string; reason: string }> = {
      'BAT': { in: 'Hardik Pandya', reason: 'Adds all-round value and death bowling.' },
      'BWL': { in: 'Axar Patel', reason: 'Spin variety and useful lower-order runs.' },
      'AR':  { in: 'Jasprit Bumrah', reason: 'World-class death bowler — game-changer.' },
      'WK':  { in: 'Rishabh Pant', reason: 'Explosive keeper-batter who changes games.' },
    };
    const suggestion = swapMap[lowestScorer.role] ?? { in: 'Virat Kohli', reason: 'Adds elite batting pedigree.' };
    swaps.push({ out: lowestScorer.cardName, in: suggestion.in, reason: suggestion.reason });
  }

  return { commentary, strengths, vulnerabilities: vulns, swaps };
}

@Component({
  selector: 'app-coach-critique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coach-critique.html',
  styleUrl: './coach-critique.css',
})
export class CoachCritique implements OnInit {
  selectedSquad: Player[] = [];
  analysis: CoachAnalysis = { commentary: '', strengths: [], vulnerabilities: [], swaps: [] };
  loadingAnalysis = true;

  chatInput = '';
  chatMessages: ChatMessage[] = [];
  coachTyping = false;

  readonly totalBudget = TOTAL_BUDGET;

  constructor(
    private playerService: PlayerService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.playerService.loadPlayers().subscribe((players) => {
      const selected = this.playerService.getSelectedSquad();
      this.selectedSquad = selected.length ? selected : players.slice(0, 11);

      // Simulate coach thinking
      setTimeout(() => {
        this.analysis = buildAnalysis(this.selectedSquad);
        this.loadingAnalysis = false;
      }, 1200);
    });
  }

  get totalScore(): number {
    return this.selectedSquad.reduce((s, p) => s + p.score, 0);
  }

  get remainingBudget(): number {
    const used = this.selectedSquad.reduce((s, p) => s + p.cardCost, 0);
    return +(this.totalBudget - used).toFixed(1);
  }

  get budgetPct(): number {
    return Math.max(0, (this.remainingBudget / this.totalBudget) * 100);
  }

  sendMessage() {
    const text = this.chatInput.trim();
    if (!text) return;

    this.chatMessages.push({ from: 'user', text });
    this.chatInput = '';
    this.coachTyping = true;

    setTimeout(() => {
      this.chatMessages.push({ from: 'coach', text: getCoachResponse(text) });
      this.coachTyping = false;
    }, 1000 + Math.random() * 800);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.sendMessage();
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
