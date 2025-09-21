import { Component } from '@angular/core';
import { TaskTable } from '../../components/task-table/task-table'; // 1. Importieren

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TaskTable], // 2. Hier bekannt machen
  templateUrl: './dashboard.html', // 3. Hier verwenden
})
export class DashboardComponent {

}