import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { TaskDisplayComponent } from '../../components/task-display/task-display.component';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TaskDisplayComponent, CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('taskDisplay') taskDisplay!: TaskDisplayComponent;
  private subscription = new Subscription();

  constructor(private dialogService: DialogService) {}

  
  ngOnInit(): void {
    // Auf Task-Saved Events hören für Grid-Updates
    this.subscription.add(
      this.dialogService.taskSaved$.subscribe(() => {
        console.log('✅ Task-Saved Event empfangen - Dashboard aktualisiert Task-Liste');
        this.onTaskSaved();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Prüft ob Tasks vorhanden sind
  private sindTasksVorhanden(): boolean {
    if (this.taskDisplay == null || this.taskDisplay.tasks == null) {
      return false;
    }
    return true;
  }

  // Prüft ob ein Datum in den nächsten 7 Tagen liegt
  private istInNaechsten7Tagen(datum: Date): boolean {
    const heute = new Date();
    const in7Tagen = new Date();
    in7Tagen.setDate(heute.getDate() + 7);
    
    return datum >= heute && datum <= in7Tagen;
  }

  // Prüft ob Tasks mit hoher Priorität existieren
  hatHochPrioritaetsTasks(): boolean {
    if (!this.sindTasksVorhanden()) {
      return false;
    }
    
    for (const task of this.taskDisplay.tasks) {
      if (task.prio_name === 'Hoch') {
        return true;
      }
    }
    return false;
  }

  // Prüft ob erledigte Tasks existieren
  hatErledigteTasks(): boolean {
    if (!this.sindTasksVorhanden()) {
      return false;
    }
    
    for (const task of this.taskDisplay.tasks) {
      if (task.status_name === 'Erledigt') {
        return true;
      }
    }
    return false;
  }

  // Zählt Tasks mit Frist in den nächsten 7 Tagen
  getTotalTasks(): number {
    if (!this.sindTasksVorhanden()) {
      return 0;
    }
    
    let anzahl = 0;
    for (let task of this.taskDisplay.tasks) {
      if (task.frist_datum != null) {
        const taskDatum = new Date(task.frist_datum);
        if (this.istInNaechsten7Tagen(taskDatum)) {
          anzahl++;
        }
      }
    }
    return anzahl;
  }

  // Zählt alle erledigten Tasks
  getCompletedTasks(): number {
    if (!this.sindTasksVorhanden()) {
      return 0; 
    }
    
    let erledigtZaehler = 0;
    for (const task of this.taskDisplay.tasks) {
      if (task.status_name === 'Erledigt') {
        erledigtZaehler++;
      }
    }
    return erledigtZaehler; 
  }

  // Zählt offene und in Bearbeitung befindliche Tasks
  getPendingTasks(): number {
    if (!this.sindTasksVorhanden()) {
      return 0;
    }
    
    let offeneTasksZaehler = 0;
    for (let task of this.taskDisplay.tasks) {
      // Alle Status außer 'Erledigt' zählen als pending
      if (task.status_name === 'Default' || 
          task.status_name === 'Problem' || 
          task.status_name === 'Beobachten' || 
          task.status_name === 'Abstimmung nötig') {
        offeneTasksZaehler++;
      }
    }
    return offeneTasksZaehler;
  }

  // Zählt Tasks mit hoher Priorität
  getHighPriorityTasks(): number {
    if (!this.sindTasksVorhanden()) {
      return 0;
    }
    
    let anzahl = 0;
    for (let task of this.taskDisplay.tasks) {
      if (task.prio_name === 'Hoch') {
        anzahl++;
      }
    }
    return anzahl;
  }

  // Task gespeichert - Liste neu laden (wird von globalem Dialog aufgerufen)
  onTaskSaved(): void {
    this.taskDisplay.loadTasks();
  }
}