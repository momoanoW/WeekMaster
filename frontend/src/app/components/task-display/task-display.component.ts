import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { DialogService } from '../../services/dialog.service';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-task-display',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  templateUrl: './task-display.component.html',
  styleUrl: './task-display.component.css'
})
export class TaskDisplayComponent implements OnInit {
  @Input() mode: 'grid' | 'table' = 'grid';
  
  tasks: Task[] = [];
  isLoading: boolean = true;

  @Output() editTaskEvent = new EventEmitter<Task>();

  constructor(
    private taskService: TaskService, 
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  /**
   * Lädt alle Tasks vom Service
   */
  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Fehler beim Laden der Tasks:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Event Handler für Status-Änderungen
   */
  onStatusChange(event: {taskId: number, newStatus: string}): void {
    this.taskService.updateTaskStatus(event.taskId, event.newStatus).subscribe({
      next: () => {
        console.log('Status erfolgreich geändert');
        this.loadTasks();
      },
      error: (error) => {
        console.error('Fehler beim Status-Update:', error);
        alert('Fehler beim Status-Update: ' + (error.error?.error || error.message));
      }
    });
  }

  /**
   * Event Handler für Task-Bearbeitung
   */
  onEditTask(task: Task): void {
    this.editTaskEvent.emit(task);
  }

  /**
   * Event Handler für Task-Löschung
   */
  onDeleteTask(taskId: number): void {
    const task = this.tasks.find(t => t.aufgaben_id === taskId);
    const taskName = task ? task.beschreibung : 'Unbekannte Aufgabe';
    this.dialogService.triggerConfirmDialog(taskId, taskName);
  }

  /**
   * Bestätigt Task-Löschung
   */
  confirmDeleteTask(taskId: number): void {
    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        console.log('Task erfolgreich gelöscht');
        this.loadTasks();
      },
      error: (error) => {
        console.error('Fehler beim Löschen:', error);
      }
    });
  }

  /**
   * TrackBy function für ngFor Performance
   */
  trackByTaskId(index: number, task: Task): number {
    return task?.aufgaben_id || index;
  }
}
