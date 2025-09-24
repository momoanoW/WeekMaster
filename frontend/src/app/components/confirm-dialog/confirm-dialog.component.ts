import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  
  // Input für den Text (optional)
  @Input() title: string = 'Bestätigung erforderlich';
  @Input() message: string = 'Möchtest du diese Aktion wirklich ausführen?';
  @Input() confirmText: string = 'Bestätigen';
  @Input() cancelText: string = 'Abbrechen';

  // Event-Emitter für Bestätigung und Abbruch
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  // Bestätigung
  onConfirm(): void {
    this.confirm.emit();
  }

  // Abbruch
  onCancel(): void {
    this.cancel.emit();
  }
}
