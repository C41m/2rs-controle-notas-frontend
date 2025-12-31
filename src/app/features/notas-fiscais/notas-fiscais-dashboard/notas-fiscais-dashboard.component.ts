// src/app/features/notas-fiscais/notas-fiscais-dashboard/notas-fiscais-dashboard.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { MinhaNotaFiscal } from '../nota-fiscal.service';
import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-notas-fiscais-dashboard',
  imports: [
    CommonModule,
    CardModule,
    BadgeModule,
    TagModule
  ],
  templateUrl: './notas-fiscais-dashboard.component.html',
  styleUrls: ['./notas-fiscais-dashboard.component.scss'],
  styles: []
})
export class NotasFiscaisDashboardComponent {
  @Input() notas: MinhaNotaFiscal[] = [];

  get totalNotas(): number {
    return this.notas.length;
  }

  get valorTotal(): number {
    return this.notas.reduce((sum, nota) => sum + (nota.valor_total || 0), 0);
  }

  get emitidas(): number {
    return this.notas.filter(nota => nota.status_id === 2).length;
  }

  get pendentes(): number {
    // Supondo que status_id === 4 = "pronto para emitir" (como no seu HTML)
    // e status_id === 1 = "aguardando validação"
    return this.notas.filter(nota => nota.status_id !== 2 && nota.status_id !== 3).length;
  }


  get aguardandoValidacao(): number {
    // Supondo que status_id === 1 representa "aguardando validação"
    return this.notas.filter(nota => nota.status_id === 1).length;
  }
  get faturamentoMes(): number {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    return this.notas
      .filter(nota => nota.status_id === 2) // só notas emitidas
      .filter(nota => {
        const dataNota = new Date(nota.data_criacao || '');
        return dataNota.getMonth() === mesAtual && dataNota.getFullYear() === anoAtual;
      })
      .reduce((sum, nota) => sum + (nota.valor_total || 0), 0);
  }

}