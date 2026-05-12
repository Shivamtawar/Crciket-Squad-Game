import { Component } from '@angular/core';
import { SquadBuilder } from '../squad-builder/squad-builder';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SquadBuilder],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
