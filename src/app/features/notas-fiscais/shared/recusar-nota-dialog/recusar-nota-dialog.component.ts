import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-recusar-nota-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    TextareaModule,
    FormsModule,
    ButtonModule
  ],
  templateUrl: './recusar-nota-dialog.component.html'
})
export class RecusarNotaDialogComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() recusar = new EventEmitter<string>();

  motivo = '';
  loading = false;
  motivoTouched = false;

  get motivoValido(): boolean {
    return this.motivo.trim().length > 0;
  }

  onConfirm() {
    this.motivoTouched = true;
    if (this.motivoValido) {
      this.loading = true;
      this.recusar.emit(this.motivo.trim());
    }
  }

  onCancel() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.motivo = '';
    this.motivoTouched = false;
    this.loading = false;
  }

  hide() {
    this.onCancel();
  }
}