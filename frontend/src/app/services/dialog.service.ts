import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Typisierte Dialog-Event-Struktur für bessere Type-Safety
export type DialogEventType = 'openTask' | 'beta' | 'confirm' | 'taskSaved';

export interface DialogEvent<T = any> {
  type: DialogEventType;
  data?: T;
}

// Spezifische Event-Daten-Typen
export interface ConfirmDialogData {
  taskId: number;
  taskName: string;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  // OPTIMIERT: Ein einziger Subject für alle Dialog-Events
  private dialogEvents = new Subject<DialogEvent>();
  
  // Ein einziges Observable für alle Dialog-Events 
  dialogEvents$ = this.dialogEvents.asObservable();

  // OPTIMIERT: Eine einheitliche Trigger-Methode für alle Dialog-Typen
  triggerDialog<T>(type: DialogEventType, data?: T): void {
    this.dialogEvents.next({ type, data });
  }

  // Convenience-Methoden für bessere API (optional - können entfernt werden)
  triggerOpenDialog(): void {
    this.triggerDialog('openTask');
  }

  triggerBetaDialog(): void {
    this.triggerDialog('beta');
  }

  triggerConfirmDialog(taskId: number, taskName: string): void {
    this.triggerDialog('confirm', { taskId, taskName } as ConfirmDialogData);
  }

  triggerTaskSaved(): void {
    this.triggerDialog('taskSaved');
  }
}
