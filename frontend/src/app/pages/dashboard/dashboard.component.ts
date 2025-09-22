import { Component } from '@angular/core';
import { TaskTableComponent } from '../../components/task-table/task-table.component'; // TaskTable importieren
import { TaskDialogComponent } from '../../components/task-dialog/task-dialog.component'; // Dialog für neue Aufgabe importieren
import { CommonModule } from '@angular/common'; // 2. CommonModule für @if importieren

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TaskTableComponent, TaskDialogComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  // Dialog "Schalter", anfangs ist der Dialog geschlossen
  isDialogOpen = false;

  // Methode, um den Schalter umzulegen
  openDialog(): void {
  // Ändere den Wert der Eigenschaft 'isDialogOpen' von 'false' auf 'true'
  this.isDialogOpen = true;
  }

  // Methode legt Schalter wieder auf 'false' um.
  closeDialog(): void {
    this.isDialogOpen = false;
  }
}
