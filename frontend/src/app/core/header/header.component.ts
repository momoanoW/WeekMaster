import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  constructor(
    private dialogService: DialogService,
    private router: Router
  ) {}

  // Dialog-Methoden
  openDialog(): void {
    this.dialogService.triggerOpenDialog();
  }

  showBetaAlert(): void {
    this.dialogService.triggerBetaDialog();
  }

  // Navigation-Methoden
  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToTables(): void {
    this.router.navigate(['/tables']);
  }
}