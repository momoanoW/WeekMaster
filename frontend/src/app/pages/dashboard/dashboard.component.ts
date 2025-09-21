import { Component } from '@angular/core';
import { TaskTableComponent } from '../../components/task-table/task-table.component'; // 1. Importieren

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TaskTableComponent], // 2. Hier bekannt machen
  templateUrl: './dashboard.component.html', // 3. Hier verwenden
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}