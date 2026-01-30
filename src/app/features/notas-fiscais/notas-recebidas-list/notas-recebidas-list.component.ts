// src/app/features/notas-fiscais/notas-recebidas-list/notas-recebidas-list.component.ts
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { LOCALE_ID, Inject } from '@angular/core';

import { NotaFiscalService, NotaRecebida } from '../nota-fiscal.service';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-notas-recebidas-list',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ToastModule,
    TooltipModule,
    TagModule,
    ProgressBarModule,
    DatePickerModule,
    FormsModule
  ],
  providers: [MessageService],
  templateUrl: './notas-recebidas-list.component.html',
  styleUrls: ['./notas-recebidas-list.component.scss']
})
export class NotasRecebidasListComponent {
  @ViewChild('dt') dt!: Table;

  notas: NotaRecebida[] = [];
  loading = false;
  dataInicio: Date | null = new Date(new Date().getFullYear(), new Date().getMonth(), 1); // 1º do mês atual
  dataFim: Date | null = new Date();

  constructor(
    private notaService: NotaFiscalService,
    private messageService: MessageService,) {
  }


  ngOnInit() {
    this.carregarNotas();
  }

  carregarNotas() {
    if (!this.dataInicio || !this.dataFim) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione um período válido.'
      });
      return;
    }

    // ✅ Validação: máximo de 31 dias
    const diffTime = Math.abs(this.dataFim.getTime() - this.dataInicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 31) {
      this.messageService.add({
        severity: 'error',
        summary: 'Período Inválido',
        detail: 'O período máximo permitido é de 31 dias. Por favor, selecione um intervalo menor.'
      });
      return;
    }

    this.loading = true;
    this.notaService.consultarNotasRecebidas({
      data_inicio: this.dataInicio,
      data_fim: this.dataFim
    }).subscribe({
      next: (notas) => {
        this.notas = notas;
        console.log('Notas carregadas:', this.notas);
      },
      error: (err) => {
        console.error('Erro ao carregar notas recebidas:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar notas recebidas.'
        });
        this.notas = [];
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  formatarData(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); // getMonth() é 0-indexado
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  parseValor(valor: string): number {
    return parseFloat(valor.replace(',', '.'));
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
  }

  visualizarPdf(url: string): void {
    if (url?.trim()) {
      window.open(url.trim(), '_blank', 'noopener,noreferrer');
    }
  }

  visualizarXml(url: string): void {
    if (url?.trim()) {
      window.open(url.trim(), '_blank', 'noopener,noreferrer');
    }
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status?.toUpperCase()) {
      case 'EMITIDA': return 'success';
      case 'RECEBIDA': return 'info';
      case 'CANCELADA': return 'danger';
      default: return 'secondary';
    }
  }
}