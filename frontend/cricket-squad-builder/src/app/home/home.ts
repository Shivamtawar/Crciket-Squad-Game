import { Component } from '@angular/core';
import { SquadBuilder } from '../squad-builder/squad-builder';
import { CoachCritique } from '../coach-critique/coach-critique';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SquadBuilder, CoachCritique],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
