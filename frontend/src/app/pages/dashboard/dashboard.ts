import { Component } from '@angular/core';
import { TaskTableComponent } from '../../components/task-table/task-table'; // 1. Importieren

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TaskTableComponent], // 2. Hier bekannt machen
  templateUrl: './dashboard.html', // 3. Hier verwenden
})
export class DashboardComponent {

}