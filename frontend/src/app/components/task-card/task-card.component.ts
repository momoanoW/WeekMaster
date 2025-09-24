import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.component.html'
})
export class TaskCardComponent {
  @Input() task!: Task;
  
  @Output() statusChange = new EventEmitter<{taskId: number, newStatus: string}>();
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<number>();

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;
    this.statusChange.emit({ taskId: this.task.aufgaben_id, newStatus });
  }

  onEdit(): void {
    this.editTask.emit(this.task);
  }

  onDelete(): void {
    this.deleteTask.emit(this.task.aufgaben_id);
  }

  formatDate(dateString: string | Date): string {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  isOverdue(): boolean {
    if (!this.task.frist_datum) return false;
    const today = new Date();
    const dueDate = typeof this.task.frist_datum === 'string' ? 
      new Date(this.task.frist_datum) : this.task.frist_datum;
    return dueDate < today && this.task.status_name !== 'Erledigt';
  }

  getDaysUntilDue(): number {
    if (!this.task.frist_datum) return 0;
    const today = new Date();
    const dueDate = typeof this.task.frist_datum === 'string' ? 
      new Date(this.task.frist_datum) : this.task.frist_datum;
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * CSS-Klassen für Priorität-Badges (gleich wie in TaskDisplay)
   */
  getPriorityClasses(priority: string): string {
    switch (priority) {
      case 'Hoch': return 'bg-warning text-white';
      case 'Mittel': return 'bg-accent text-text-dark';
      case 'Niedrig': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}
