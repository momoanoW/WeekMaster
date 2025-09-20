import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HttpClientModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Application title
  protected readonly title = signal('WeekMaster');
  
  // Version information
  protected readonly version = signal('1.0.0');
  
  // Application state
  protected readonly isLoading = signal(false);
  
  constructor() {
    // Initialize app
    console.log('WeekMaster App initialized');
  }
}
