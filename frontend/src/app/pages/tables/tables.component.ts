import { Component } from '@angular/core';
import { TaskTableComponent } from '../../components/task-table/task-table.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [TaskTableComponent, CommonModule],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.css'
})
export class TablesComponent {
  
}
