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

  // Zentrale Methode für alle Task-Statistiken (optimiert)
  getTaskStats(): { total: number; completed: number; pending: number; highPriority: number } {
    const tasks = this.taskDisplay?.tasks || [];
    const heute = new Date();
    const in7Tagen = new Date(heute.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return tasks.reduce((stats, task) => {
      // Tasks mit Frist in den nächsten 7 Tagen
      if (task.frist_datum) {
        const taskDatum = new Date(task.frist_datum);
        if (taskDatum >= heute && taskDatum <= in7Tagen) {
          stats.total++;
        }
      }
      
      // Erledigte Tasks
      if (task.status_name === 'Erledigt') {
        stats.completed++;
      }
      
      // Pending Tasks (alle außer Erledigt)
      if (task.status_name !== 'Erledigt') {
        stats.pending++;
      }
      
      // Hohe Priorität Tasks
      if (task.prio_name === 'Hoch') {
        stats.highPriority++;
      }
      
      return stats;
    }, { total: 0, completed: 0, pending: 0, highPriority: 0 });
  }

  // Einzelne Getter für Template-Kompatibilität (delegieren an zentrale Stats)
  getTotalTasks(): number {
    return this.getTaskStats().total;
  }

  getCompletedTasks(): number {
    return this.getTaskStats().completed;
  }

  getPendingTasks(): number {
    return this.getTaskStats().pending;
  }

  getHighPriorityTasks(): number {
    return this.getTaskStats().highPriority;
  }

  // Task gespeichert - Liste neu laden (wird von globalem Dialog aufgerufen)
  onTaskSaved(): void {
    this.taskDisplay.loadTasks();
  }
}