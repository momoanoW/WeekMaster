import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type DialogType = 'info' | 'warning' | 'confirm' | 'danger';

@Component({
  selector: 'app-universal-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './universal-dialog.component.html'
})
export class UniversalDialogComponent {
  
  // Dialog-Konfiguration
  @Input() type: DialogType = 'info';
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() icon: string = '';
  
  // Button-Konfiguration
  @Input() showCancelButton: boolean = true;
  @Input() confirmText: string = 'OK';
  @Input() cancelText: string = 'Abbrechen';
  @Input() confirmButtonType: 'primary' | 'danger' = 'primary';

  // Event-Emitter
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  // Getters für dynamische Styles
  get headerClass(): string {
    switch (this.type) {
      case 'info': return 'gradient-brand';
      case 'warning': return 'bg-yellow-500';
      case 'confirm': return 'bg-blue-500';
      case 'danger': return 'bg-red-500';
      default: return 'gradient-brand';
    }
  }

  get confirmButtonClass(): string {
    return this.confirmButtonType === 'danger' ? 'btn-danger' : 'btn-primary';
  }

  // Event-Handler
  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
