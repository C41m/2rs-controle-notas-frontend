// src/app/features/notas-fiscais/resumo-dashboard-notas-fiscal/resumo-dashboard-notas-fiscal.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { NgApexchartsModule } from 'ng-apexcharts';
import { BadgeModule } from 'primeng/badge';


import { NotaFiscalService, MinhaNotaFiscal, NotaRecebida } from '../nota-fiscal.service';
import { AuthService } from '../../../core/auth.service';
import { StatusService, StatusNota } from '../status.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-resumo-dashboard-notas-fiscal',
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    ProgressBarModule,
    TagModule,
    ToastModule,
    NgApexchartsModule,
    BadgeModule
  ],
  providers: [MessageService],
  templateUrl: './resumo-dashboard-notas-fiscal.component.html',
  styleUrls: ['./resumo-dashboard-notas-fiscal.component.scss']
})
export class ResumoDashboardNotasFiscalComponent implements OnInit {
  // Dados para o gráfico - GRÁFICO DE LINHA COM VALORES EM R$ (EMITIDOS E RECEBIDOS)
  public chartOptions: any = {
    series: [
      {
        name: 'Valor Emitido',
        data: []
      },
      {
        name: 'Valor Recebido',
        data: []
      }
    ],
    chart: {
      type: 'line',
      height: 350,
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      },
      zoom: {
        enabled: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#4CAF50', '#2196F3']
    },
    colors: ['#4CAF50', '#2196F3'],
    xaxis: {
      categories: [],
      labels: {
        style: {
          fontSize: '12px',
          colors: ['#666']
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      title: {
        text: 'Data',
        style: {
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#666'
        }
      }
    },
    yaxis: {
      min: 0,
      labels: {
        formatter: function (val: number) {
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(val);
        },
        style: {
          fontSize: '13px'
        }
      },
      axisBorder: {
        show: false
      },
      title: {
        text: 'Valor (R$)',
        style: {
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#666'
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(val);
        }
      },
      style: {
        fontSize: '14px'
      },
      theme: 'light',
      marker: {
        show: true
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '14px',
      markers: {
        radius: 12
      }
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 3
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 280
          },
          xaxis: {
            labels: {
              fontSize: '10px'
            }
          }
        }
      }
    ]
  };

  // Métricas
  totalEmitidas = 0;
  totalRecebidas = 0;
  valorEmitido = 0;
  valorRecebido = 0;
  loading = true;

  // Status map
  statusMap: Record<number, string> = {};

  // Dados detalhados (para cards)
  notasEmitidas: MinhaNotaFiscal[] = [];
  notasRecebidas: NotaRecebida[] = [];

  constructor(
    private notaService: NotaFiscalService,
    private authService: AuthService,
    private messageService: MessageService,
    private statusService: StatusService
  ) { }

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.loading = true;

    // Calcular datas (últimos 31 dias a partir de hoje)
    const hoje = new Date();
    const dataInicio = new Date();
    dataInicio.setDate(hoje.getDate() - 28);

    // Buscar notas emitidas
    this.notaService.listarMinhasNotas().subscribe({
      next: (notas) => {
        // Filtrar apenas as dos últimos 31 dias
        this.notasEmitidas = notas.filter(nota => {
          const dataNota = new Date(nota.data_criacao);
          return dataNota >= dataInicio && dataNota <= hoje && nota.status_id === 2;
        });

        this.totalEmitidas = this.notasEmitidas.length;
        this.valorEmitido = this.notasEmitidas.reduce((sum, n) => sum + n.valor_total, 0);

        console.log('Notas emitidas:', this.notasEmitidas);
        // Buscar notas recebidas
        const dataInicioISO = dataInicio.toISOString().split('T')[0];
        const hojeISO = hoje.toISOString().split('T')[0];

        this.notaService.consultarNotasRecebidas({
          data_inicio: dataInicioISO,
          data_fim: hojeISO
        }).subscribe({
          next: (notasRecebidas) => {
            this.notasRecebidas = notasRecebidas;
            this.totalRecebidas = this.notasRecebidas.length;
            this.valorRecebido = this.notasRecebidas.reduce((sum, n) => {
              const valor = parseFloat(n.Valor.replace(',', '.'));
              return sum + (isNaN(valor) ? 0 : valor);
            }, 0);

            // Agrupar valores por data para o gráfico
            this.agruparValoresPorData();
          },
          error: (err) => {
            console.error('Erro ao carregar notas recebidas:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Falha ao carregar notas recebidas.'
            });
            this.agruparValoresPorData(); // Continua mesmo com erro
          },
          complete: () => {
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Erro ao carregar notas emitidas:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar notas emitidas.'
        });
        this.loading = false;
      }
    });
  }

  agruparValoresPorData() {
    // Criar array com os últimos 31 dias a partir de hoje
    const hoje = new Date(); // 30 de dezembro de 2025
    const datas = [];
    const valoresEmitidos = [];
    const valoresRecebidos = [];

    for (let i = 30; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - i);

      // Formatar data para exibição (DD/MM)
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      datas.push(`${dia}/${mes}`);

      // Filtrar notas emitidas dessa data e somar valores
      const valorEmitidoDia = this.notasEmitidas
        .filter(nota => {
          const dataNota = new Date(nota.data_criacao);
          return (
            dataNota.getDate() === data.getDate() &&
            dataNota.getMonth() === data.getMonth() &&
            dataNota.getFullYear() === data.getFullYear()
          );
        })
        .reduce((sum, nota) => sum + nota.valor_total, 0);

      valoresEmitidos.push(valorEmitidoDia);

      // Filtrar notas recebidas dessa data e somar valores
      const valorRecebidoDia = this.notasRecebidas
        .filter(nota => {
          // A nota recebida tem campo 'Emissao' no formato DD/MM/YYYY
          const dataEmissao = nota.Emissao;
          const [diaNota, mesNota, anoNota] = dataEmissao.split('/');
          const dataNota = new Date(`${anoNota}-${mesNota}-${diaNota}`);

          return (
            dataNota.getDate() === data.getDate() &&
            dataNota.getMonth() === data.getMonth() &&
            dataNota.getFullYear() === data.getFullYear()
          );
        })
        .reduce((sum, nota) => {
          const valor = parseFloat(nota.Valor.replace(',', '.'));
          return sum + (isNaN(valor) ? 0 : valor);
        }, 0);

      valoresRecebidos.push(valorRecebidoDia);
    }

    // Atualizar o gráfico
    this.chartOptions = {
      ...this.chartOptions,
      series: [
        {
          name: 'Valor Emitido',
          data: valoresEmitidos
        },
        {
          name: 'Valor Recebido',
          data: valoresRecebidos
        }
      ],
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: datas
      }
    };
  }

  getStatusSeverityEmitida(statusId: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (statusId) {
      case 1: return 'secondary';
      case 2: return 'success';
      case 3: return 'danger';
      case 4: return 'info';
      case 6: return 'info';
      default: return 'secondary';
    }
  }

  getStatusSeverityRecebida(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status?.toUpperCase()) {
      case 'EMITIDA': return 'success';
      case 'RECEBIDA': return 'info';
      case 'CANCELADA': return 'danger';
      default: return 'secondary';
    }
  }

  loadStatusMap(): void {
    this.statusService.getAllStatus().subscribe({
      next: (statusList: StatusNota[]) => {
        this.statusMap = statusList.reduce((map, status) => {
          map[status.id] = status.nome;
          return map;
        }, {} as Record<number, string>);

        this.carregarDados();
      },
      error: (err) => {
        console.error('Erro ao carregar status:', err);
        // Status fallback
        this.statusMap = {
          1: 'Aguardando Validação',
          2: 'Emitida',
          3: 'Cancelada',
          4: 'Aprovada',
          6: 'Em Processamento'
        };
        this.carregarDados();
      }
    });
  }

  parseValor(valor: string): number {
    return parseFloat(valor.replace(',', '.'));
  }
}