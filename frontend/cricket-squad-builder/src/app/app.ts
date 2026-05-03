import { Component } from '@angular/core';
import { Sidebar } from './sidebar/sidebar';
import { Header } from './header/header';
import { SquadBuilder } from './squad-builder/squad-builder';

@Component({
  selector: 'app-root',
  imports: [Sidebar, Header, SquadBuilder],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
