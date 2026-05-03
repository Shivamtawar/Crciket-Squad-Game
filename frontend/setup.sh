#!/bin/bash

# 1. Initialize Angular Project
npx -p @angular/cli ng new cricket-squad-builder --style=css --routing=false --skip-git
cd cricket-squad-builder

# 2. Install Dependencies
npm install -D tailwindcss postcss autoprefixer
npm install @angular/cdk
npx tailwindcss init

# 3. Configure Tailwind
cat <<EOF > tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        'game-dark': '#0f172a',
        'game-sidebar': '#ffffff',
        'game-accent': '#6366f1',
        'neon-purple': '#a855f7'
      }
    },
  },
  plugins: [],
}
EOF

# 4. Add Tailwind to styles.css
cat <<EOF > src/styles.css
@tailwind base;
@tailwind components;
@tailwind utilities;

body { @apply bg-gray-50 text-slate-900 font-sans; }
.cdk-drag-preview {
  @apply bg-white shadow-2xl rounded-lg p-4 opacity-80 border-2 border-indigo-500;
}
.cdk-drag-placeholder { opacity: 0; }
EOF

# 5. Generate Core Files
ng generate service player
ng generate component sidebar
ng generate component header
ng generate component squad-builder

# 6. Create Player Data Service
cat <<EOF > src/app/player.service.ts
import { Injectable } from '@angular/core';

export interface Player {
  id: number;
  description: string;
  cardName: string;
  score: number;
  rarity: string;
  imageUrl: string;
  cardCost: number;
  role: 'BAT' | 'BWL' | 'AR' | 'WK';
}

@Injectable({ providedIn: 'root' })
export class PlayerService {
  getPlayers(): Player[] {
    return [
      { id: 1, description: "PC", cardName: "Pat Cummins", score: 249, rarity: "epic", role: 'BWL', cardCost: 10, imageUrl: "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753661814/cricket-cards/fptcmbpjlbwpvte4hpna.png" },
      { id: 2, description: "VK", cardName: "Virat Kohli", score: 250, rarity: "epic", role: 'BAT', cardCost: 10, imageUrl: "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753659285/cricket-cards/zblgxtmyq3glfgza54g8.png" },
      { id: 3, description: "MS", cardName: "MS Dhoni", score: 244, rarity: "epic", role: 'WK', cardCost: 9.5, imageUrl: "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753659575/cricket-cards/fzmz3dmg0nf9ycqgwuec.png" },
      { id: 4, description: "RJ", cardName: "Ravindra Jadeja", score: 240, rarity: "epic", role: 'AR', cardCost: 9.5, imageUrl: "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753659433/cricket-cards/cbxw2nbh2blmfioxe4hh.png" },
      { id: 5, description: "JB", cardName: "Jasprit Bumrah", score: 250, rarity: "epic", role: 'BWL', cardCost: 10, imageUrl: "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753659356/cricket-cards/fhhieriwpa0wvsgcolum.png" }
    ];
  }
}
EOF

# 7. Update App Component (Layout Container)
cat <<EOF > src/app/app.component.html
<div class="flex h-screen overflow-hidden bg-gray-50">
  <app-sidebar class="w-64 border-r bg-white hidden md:block"></app-sidebar>
  <div class="flex-1 flex flex-col overflow-hidden">
    <app-header></app-header>
    <main class="flex-1 overflow-y-auto p-6">
      <app-squad-builder></app-squad-builder>
    </main>
  </div>
</div>
EOF

# 8. Update Sidebar
cat <<EOF > src/app/sidebar/sidebar.component.html
<div class="p-6 h-full flex flex-col justify-between">
  <div>
    <div class="flex flex-col items-center mb-10">
      <div class="w-24 h-24 rounded-full border-4 border-indigo-100 p-1 mb-4">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" class="rounded-full bg-slate-200">
      </div>
      <h3 class="font-bold text-lg">Pro Strategist</h3>
      <p class="text-green-600 text-sm font-medium">Rank: #420</p>
    </div>
    
    <nav class="space-y-2">
      <a class="flex items-center p-3 bg-indigo-50 text-indigo-700 rounded-lg font-bold border-l-4 border-indigo-700">
        <span class="mr-3">📋</span> Draft Room
      </a>
      <a class="flex items-center p-3 text-slate-500 hover:bg-gray-50 rounded-lg">
        <span class="mr-3">📈</span> Analytics
      </a>
      <a class="flex items-center p-3 text-slate-500 hover:bg-gray-50 rounded-lg">
        <span class="mr-3">🧠</span> Coach Critique
      </a>
    </nav>
  </div>
  
  <button class="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800">
    Save Lineup
  </button>
</div>
EOF

# 9. Update Header
cat <<EOF > src/app/header/header.component.html
<header class="h-16 bg-white border-b px-8 flex items-center justify-between">
  <h1 class="text-xl font-black text-slate-800 tracking-tight italic">SQUAD BUILDER XI</h1>
  
  <div class="flex items-center space-x-8">
    <div class="flex flex-col items-end">
      <div class="flex items-center space-x-2">
        <span class="text-xl font-bold">85</span><span class="text-slate-400">/100</span>
      </div>
      <span class="text-[10px] font-bold text-green-600 uppercase tracking-widest">Credits Left</span>
    </div>
    <div class="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div class="bg-green-500 h-full w-[85%]"></div>
    </div>
    <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border">
      👤
    </div>
  </div>
</header>
EOF

# 10. Update Squad Builder (The Core Logic)
cat <<EOF > src/app/squad-builder/squad-builder.component.ts
import { Component, OnInit } from '@angular/core';
import { Player, PlayerService } from '../player.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-squad-builder',
  templateUrl: './squad-builder.component.html'
})
export class SquadBuilderComponent implements OnInit {
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
EOF

cat <<EOF > src/app/squad-builder/squad-builder.component.html
<div class="grid grid-cols-12 gap-8 h-full" cdkDropListGroup>
  
  <!-- Left Side: Player Pool -->
  <div class="col-span-7">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">Player Pool</h2>
      <div class="flex space-x-2 bg-white p-1 rounded-lg border shadow-sm">
        <button (click)="selectedFilter='ALL'" [class.bg-slate-900]="selectedFilter==='ALL'" [class.text-white]="selectedFilter==='ALL'" class="px-4 py-1 rounded text-sm font-bold">ALL</button>
        <button (click)="selectedFilter='BAT'" [class.bg-slate-900]="selectedFilter==='BAT'" [class.text-white]="selectedFilter==='BAT'" class="px-4 py-1 rounded text-sm font-bold">BAT</button>
        <button (click)="selectedFilter='BWL'" [class.bg-slate-900]="selectedFilter==='BWL'" [class.text-white]="selectedFilter==='BWL'" class="px-4 py-1 rounded text-sm font-bold">BWL</button>
      </div>
    </div>

    <div cdkDropList [cdkDropListData]="pool" (cdkDropListDropped)="drop($event)"
         class="grid grid-cols-3 gap-4 min-h-[400px]">
      <div *ngFor="let player of filteredPool" cdkDrag
           class="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-grab relative">
        <div class="absolute top-3 right-3 text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded">{{player.role}}</div>
        <img [src]="player.imageUrl" class="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-indigo-500 p-0.5">
        <div class="text-center">
          <p class="font-bold text-sm truncate">{{player.cardName}}</p>
          <p class="text-xs text-slate-400 mb-2">IND 🟢</p>
          <div class="pt-2 border-t flex justify-between items-center">
            <span class="text-indigo-600 font-black">{{player.cardCost}} Cr</span>
            <button class="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">+</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Right Side: Your Squad -->
  <div class="col-span-5 bg-white rounded-3xl border shadow-sm p-6 flex flex-col">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-xl font-bold">Your Squad</h2>
        <p class="text-sm text-slate-400">{{mySquad.length}}/11 Selected</p>
      </div>
      <button class="text-red-500 text-sm font-bold flex items-center">🔄 RESET</button>
    </div>

    <div cdkDropList [cdkDropListData]="mySquad" (cdkDropListDropped)="drop($event)"
         class="flex-1 space-y-3 min-h-[300px] border-2 border-dashed border-slate-100 rounded-2xl p-4">
      
      <div *ngFor="let player of mySquad" cdkDrag class="bg-slate-50 p-3 rounded-xl flex items-center justify-between border">
        <div class="flex items-center space-x-3">
          <img [src]="player.imageUrl" class="w-10 h-10 rounded-full border">
          <div>
            <p class="font-bold text-sm">{{player.cardName}}</p>
            <p class="text-[10px] text-slate-400">{{player.role}} • {{player.cardCost}} Cr</p>
          </div>
        </div>
        <button class="text-slate-300">➖</button>
      </div>

      <div *ngIf="mySquad.length === 0" class="h-full flex flex-col items-center justify-center text-slate-300">
          <p class="italic text-sm">Drag players here to build your XI</p>
      </div>
    </div>

    <button class="mt-6 w-full py-4 bg-gray-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center">
      <span class="mr-2">🧠</span> Get AI Coach Critique
    </button>
  </div>
</div>
EOF

# 11. Final Module Updates
cat <<EOF > src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { SquadBuilderComponent } from './squad-builder/squad-builder.component';

@NgModule({
  declarations: [AppComponent, SidebarComponent, HeaderComponent, SquadBuilderComponent],
  imports: [BrowserModule, DragDropModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
EOF

echo "✅ Setup Complete! Run 'cd cricket-squad-builder && npm start' to view."