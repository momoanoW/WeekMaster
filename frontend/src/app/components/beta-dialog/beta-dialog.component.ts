import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-beta-dialog',
  standalone: true,
  imports: [],
  templateUrl: './beta-dialog.component.html',
  styleUrl: './beta-dialog.component.css'
})
export class BetaDialogComponent {
  @Output() close = new EventEmitter<void>();

  closeDialog(): void {
    this.close.emit();
  }
}
