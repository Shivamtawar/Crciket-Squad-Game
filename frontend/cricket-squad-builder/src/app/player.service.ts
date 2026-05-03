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
