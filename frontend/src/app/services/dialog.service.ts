import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private openDialogSubject = new Subject<void>();
  private betaDialogSubject = new Subject<void>();
  
  // Observable für andere Komponenten
  openDialog$ = this.openDialogSubject.asObservable();
  betaDialog$ = this.betaDialogSubject.asObservable();

  // Methode um Task-Dialog zu öffnen
  triggerOpenDialog(): void {
    this.openDialogSubject.next();
  }

  // Methode um Beta-Dialog zu öffnen
  triggerBetaDialog(): void {
    this.betaDialogSubject.next();
  }
}
