// Root-Komponente der Angular-Anwendung = Vorstand der App (weiß, an wen sie was weitergibt. weiß aber nicht, was jeder einzelne MA tut)

import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // bürogebäude mit Türen zu verschiedenen Abteilungen
import { HeaderComponent } from './core/header/header.component'; // eingangsbereich
import { FooterComponent } from './core/footer/footer.component'; // ausgangsbereich
import { TaskDialogComponent } from './components/task-dialog/task-dialog.component';
import { UniversalDialogComponent } from './components/universal-dialog/universal-dialog.component';
import { CommonModule } from '@angular/common';
import { DialogService, DialogEvent, ConfirmDialogData } from './services/dialog.service';
import { TaskService } from './services/task.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,

  //Alle Bauteile hier bekannt machen
  imports: [RouterOutlet, HeaderComponent, FooterComponent, TaskDialogComponent, UniversalDialogComponent, CommonModule],
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend';
  isDialogOpen = false; // Steuert Task-Dialog Anzeige
  isBetaDialogOpen = false; // Steuert Beta-Info Dialog Anzeige
  isConfirmDialogOpen = false; // Steuert Confirm-Dialog Anzeige
  confirmDialogData: { taskId: number; taskName: string } | null = null; // Daten für Confirm-Dialog
  private subscription = new Subscription(); // Sammelt alle Event-Subscriptions

  constructor(
    private dialogService: DialogService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    // OPTIMIERT: Ein einziger Event-Stream statt 3 separate Subscriptions
    this.subscription.add(
      this.dialogService.dialogEvents$.subscribe((event: DialogEvent) => {
        switch (event.type) {
          case 'openTask':
            this.openDialog();
            break;
          case 'beta':
            this.openBetaDialog();
            break;
          case 'confirm':
            this.openConfirmDialog(event.data as ConfirmDialogData);
            break;
          case 'taskSaved':
            // TaskSaved events werden von Dashboard-Component direkt behandelt
            break;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); // Verhindert Memory Leaks
  }

  // Task-Dialog Management
  openDialog(): void {
    this.isDialogOpen = true;
  }

  closeDialog(): void {
    this.isDialogOpen = false;
  }

  // Beta-Dialog Management
  openBetaDialog(): void {
    this.isBetaDialogOpen = true;
  }

  closeBetaDialog(): void {
    this.isBetaDialogOpen = false;
  }

  // Confirm-Dialog Management (für Task-Löschung)
  openConfirmDialog(data: ConfirmDialogData): void {
    this.confirmDialogData = data;
    this.isConfirmDialogOpen = true;
  }

  closeConfirmDialog(): void {
    this.isConfirmDialogOpen = false;
    this.confirmDialogData = null;
  }

  // Task tatsächlich löschen (nach Bestätigung)
  confirmDeleteTask(): void {
    if (!this.confirmDialogData) return;
    
    const taskId = this.confirmDialogData.taskId;
    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        console.log('Task erfolgreich gelöscht');
        this.closeConfirmDialog();
        this.dialogService.triggerTaskSaved(); // Liste neu laden
      },
      error: (error) => {
        console.error('Fehler beim Löschen:', error);
        alert('Fehler beim Löschen: ' + (error.error?.error || error.message));
        this.closeConfirmDialog();
      }
    });
  }

  // Nach Task-Speicherung: Dialog schließen + andere Komponenten informieren
  onTaskSaved(): void {
    this.closeDialog();
    console.log('AppComponent sendet Task-Saved Event...');
    this.dialogService.triggerTaskSaved(); // Dashboard-Update auslösen
  }
}