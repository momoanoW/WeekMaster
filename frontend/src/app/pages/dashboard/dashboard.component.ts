import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TaskTableComponent } from '../../components/task-table/task-table.component'; // TaskTable importieren
import { TaskDialogComponent } from '../../components/task-dialog/task-dialog.component'; // Dialog für neue Aufgabe importieren
import { BetaDialogComponent } from '../../components/beta-dialog/beta-dialog.component'; // Beta Dialog importieren
import { CommonModule } from '@angular/common'; // 2. CommonModule für @if importieren
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TaskTableComponent, TaskDialogComponent, BetaDialogComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  // === COMPONENT REFERENCES ===
  @ViewChild('taskTable') taskTable!: TaskTableComponent;

  // === DIALOG STATE ===
  isDialogOpen = false;
  isBetaDialogOpen = false;

  // === SUBSCRIPTIONS ===
  private dialogSubscription!: Subscription;
  private betaDialogSubscription!: Subscription;

  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {
    // Subscribe auf den Task Dialog Service
    this.dialogSubscription = this.dialogService.openDialog$.subscribe(() => {
      this.openDialog();
    });

    // Subscribe auf den Beta Dialog Service
    this.betaDialogSubscription = this.dialogService.betaDialog$.subscribe(() => {
      this.openBetaDialog();
    });
  }

  ngOnDestroy(): void {
    // Subscription cleanup
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
    if (this.betaDialogSubscription) {
      this.betaDialogSubscription.unsubscribe();
    }
  }

  // === TASK DIALOG METHODEN ===
  openDialog(): void {
    this.isDialogOpen = true;
  }

  closeDialog(): void {
    this.isDialogOpen = false;
  }

  onTaskSaved(): void {
    this.taskTable.loadTasks(); // Ruft die öffentliche Methode der Kind-Komponente auf
    this.closeDialog();
  }

  // === BETA DIALOG METHODEN ===
  openBetaDialog(): void {
    this.isBetaDialogOpen = true;
  }

  closeBetaDialog(): void {
    this.isBetaDialogOpen = false;
  }
}