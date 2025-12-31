// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { inject } from '@angular/core';
import { ConfirmDialog } from "primeng/confirmdialog";
import { CommonModule } from '@angular/common'; // ✅ Import here
import { ConfirmationService, MessageService } from 'primeng/api'; // ✅ Importe aqui

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, ConfirmDialog,CommonModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'controle-notas';
  protected messageService = inject(MessageService);

}
