// src/app/features/notas-fiscais/shared/visualizar-nota-dialog/visualizar-nota-dialog.component.ts

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MinhaNotaFiscal } from '../../nota-fiscal.service';
import { MaskCpfCnpjPipe } from '../../../../shared/mask-cpf-cnpj.pipe';
import { StatusService, StatusNota } from '../../status.service';

@Component({
  selector: 'app-visualizar-nota-usuario-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, TagModule, MaskCpfCnpjPipe, ButtonModule],
  templateUrl: './visualizar-nota-usuario-dialog.component.html',
  styleUrls: ['./visualizar-nota-usuario-dialog.component.scss']
})
export class VisualizarNotaUsuarioDialogComponent implements OnInit {
  @Input() nota: MinhaNotaFiscal | null = null;
  @Input() visible = false;
  @Input() loadingAprovar = false;
  @Input() loadingRecusar = false;

  @Output() visibleChange = new EventEmitter<boolean>();

  statusMap: Record<number, string> = {};

  constructor(private statusService: StatusService) { }

  ngOnInit() {
    this.loadStatusMap();
  }

  loadStatusMap(): void {
    this.statusService.getAllStatus().subscribe({
      next: (statusList: StatusNota[]) => {
        this.statusMap = statusList.reduce((map, status) => {
          map[status.id] = status.nome;
          return map;
        }, {} as Record<number, string>);
      },
      error: () => {
        this.statusMap = {
          1: 'Aguardando Validação',
          2: 'Emitida',
          3: 'Cancelada',
          4: 'Pronto para Emitir' // ⚠️ Alinhado com o admin!
        };
      }
    });
  }

  getStatusLabel(statusId: number): string {
    return this.statusMap[statusId] || 'Desconhecido';
  }

  getStatusSeverity(statusId: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (statusId) {
      case 1: return 'secondary';
      case 2: return 'success';
      case 3: return 'warn';
      case 4: return 'info';
      default: return 'secondary';
    }
  }

  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}