import { Component } from '@angular/core';
import { TaskDisplayComponent } from '../../components/task-display/task-display.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [TaskDisplayComponent, CommonModule],
  templateUrl: './tables.component.html'
})
export class TablesComponent {
  
}
