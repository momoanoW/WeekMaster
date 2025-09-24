import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private openDialogSubject = new Subject<void>();
  private betaDialogSubject = new Subject<void>();
  private confirmDialogSubject = new Subject<{ taskId: number; taskName: string }>();
  private taskSavedSubject = new Subject<void>();
  
  // Observable für andere Komponenten
  openDialog$ = this.openDialogSubject.asObservable();
  betaDialog$ = this.betaDialogSubject.asObservable();
  confirmDialog$ = this.confirmDialogSubject.asObservable();
  taskSaved$ = this.taskSavedSubject.asObservable();

  // Methode um Task-Dialog zu öffnen
  triggerOpenDialog(): void {
    this.openDialogSubject.next();
  }

  // Methode um Beta-Dialog zu öffnen
  triggerBetaDialog(): void {
    this.betaDialogSubject.next();
  }

  // Methode um Confirm-Dialog zu öffnen
  triggerConfirmDialog(taskId: number, taskName: string): void {
    this.confirmDialogSubject.next({ taskId, taskName });
  }

  // Methode um Task-Saved Event zu triggern
  triggerTaskSaved(): void {
    this.taskSavedSubject.next();
  }
}
