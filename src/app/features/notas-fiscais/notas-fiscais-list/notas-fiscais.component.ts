// src/app/features/notas-fiscais/notas-fiscais-list/notas-fiscais.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { NotaFiscalCreate, NotaFiscalService, MinhaNotaFiscal } from '../nota-fiscal.service';
import { ClienteService } from '../../clientes/cliente.service';
import { catchError, of } from 'rxjs';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { EmitirNotaDialogComponent } from "../emissao/emitir-nota-dialog.component";
import { MaskCpfCnpjPipe } from '../../../shared/mask-cpf-cnpj.pipe';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { NotasFiscaisDashboardComponent } from '../notas-fiscais-dashboard/notas-fiscais-dashboard.component';
import { SelectModule } from 'primeng/select';
import { StatusService, StatusNota } from '../status.service';
import { VisualizarNotaUsuarioDialogComponent } from '../shared/visualizar-nota-usuario-dialog/visualizar-nota-usuario-dialog.component';
import { ProgressBarModule } from 'primeng/progressbar';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from "primeng/confirmdialog";
import { AuthService } from '../../../core/auth.service';
import { User } from '../../admin/user.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-notas-fiscais',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    SelectModule,
    FormsModule,
    RouterModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    EmitirNotaDialogComponent,
    MaskCpfCnpjPipe,
    ToolbarModule,
    ToastModule,
    InputTextModule,
    VisualizarNotaUsuarioDialogComponent,
    ProgressBarModule,
    NotasFiscaisDashboardComponent,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './notas-fiscais.component.html',
  styleUrls: ['./notas-fiscais.component.scss']
})
export class NotasFiscaisComponent implements OnInit {

  get usuarioLogado(): any {
    return this.authService.currentUserSubject.value;
  }

  @ViewChild('dt') dt!: Table;
  notaVisualizar: MinhaNotaFiscal | null = null;
  modalVisualizarUsuarioVisible = false;
  notas: MinhaNotaFiscal[] = [];
  statusMap: Record<number, string> = {};
  loadingTabela = false;
  loadingInicial = true;


  // Estado do modal simplificado
  modalVisivel = false;
  modoModal: 'criar' | 'editar' = 'criar';
  notaIdParaEdicao: number | null = null; // Apenas o ID, não o objeto completo

  constructor(
    private notaService: NotaFiscalService,
    private clienteService: ClienteService,
    private messageService: MessageService,
    private statusService: StatusService,
    private confirmationService: ConfirmationService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadingInicial = true;

    // 1. Atualiza perfil
    this.authService.getProfile().subscribe({
      next: () => {
        // 2. Carrega status
        this.loadStatusMap();
      },
      error: () => {
        this.loadStatusMap();
      }
    });
  }


  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
  }

  carregarNotas() {
    this.loadingTabela = true; // para operações durante uso
    this.notaService.listarMinhasNotas().subscribe({
      next: (notas) => {
        this.notas = notas;
      },
      error: (err) => {
        console.error('Erro ao carregar notas:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar notas.'
        });
        this.notas = [];
      },
      complete: () => {
        this.loadingTabela = false;
        this.loadingInicial = false; // ✅ Tudo pronto!
        console.log('Notas carregadas:', this.notas);
      }
    });
  }

  abrirModal() {
    this.modoModal = 'criar';
    this.notaIdParaEdicao = null;
    this.modalVisivel = true;
  }

  editarNota(nota: MinhaNotaFiscal) {
    this.modoModal = 'editar';
    this.notaIdParaEdicao = nota.id; // Apenas o ID
    this.modalVisivel = true;
  }

  onNotaEmitida() {
    this.carregarNotas();
    this.modalVisivel = false;
  }

  visualizarNota(nota: MinhaNotaFiscal) {
    this.notaVisualizar = nota;
    this.modalVisualizarUsuarioVisible = true;
  }

  visualizarPdf(nota: MinhaNotaFiscal): void {
    if (this.loadingTabela) return;
    const url = nota.link_api_pdf?.trim();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  visualizarXml(nota: MinhaNotaFiscal): void {
    if (this.loadingTabela) return;
    const url = nota.link_api_xml?.trim();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  excluirNota(nota: MinhaNotaFiscal) {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja cancelar esta nota fiscal? Essa ação não pode ser desfeita.',
      header: 'Confirmar Cancelamento',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Cancelar Nota',
      rejectLabel: 'Voltar',
      acceptIcon: 'pi pi-trash',
      acceptButtonProps: {
        styleClass: 'p-button-danger'
      },
      rejectButtonProps: {
        styleClass: 'p-button-secondary'
      },
      accept: () => {
        // Chama o serviço com status 5 (Cancelada pelo usuário)
        this.loadingTabela = true;
        this.notaService.atualizarStatus(nota.id, { status_id: 5 }).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Nota cancelada com sucesso!'
            });
            this.carregarNotas();
          },
          error: (err) => {
            console.error('Erro ao cancelar nota:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Falha ao cancelar nota.'
            });
          },
          complete: () => {
            this.loadingTabela = false;
          }
        });
      }
    });
  }

  emitirNota(nota: MinhaNotaFiscal) {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja emitir esta nota fiscal?',
      header: 'Confirmação de Emissão',
      icon: 'pi pi-check-circle',
      acceptIcon: 'pi pi-check',
      acceptLabel: 'Emitir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { styleClass: 'p-button-success' },
      rejectButtonProps: { styleClass: 'p-button-secondary' },
      accept: () => {
        this.loadingTabela = true;
        this.notaService.emitirNota(nota.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Nota emitida com sucesso!'
            });
            this.carregarNotas();
          },
          error: (err) => {
            console.error('Erro ao emitir nota:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Falha ao emitir nota.'
            });
          },
          complete: () => {
            this.loadingTabela = false;
          }
        });
      }
    });
  }

  // Métodos auxiliares
  loadStatusMap(): void {
    this.statusService.getAllStatus().subscribe({
      next: (statusList: StatusNota[]) => {
        this.statusMap = statusList.reduce((map, status) => {
          map[status.id] = status.nome;
          return map;
        }, {} as Record<number, string>);
      },
      error: (err) => {
        console.error('Erro ao carregar status:', err);
        this.statusMap = {
          1: 'Aguardando Validação',
          2: 'Emitida',
          3: 'Cancelada',
          4: 'Aprovada'
        };
      },
      complete: () => {
        // 3. Só agora carrega as notas
        this.carregarNotas();
      }
    });
  }

  getStatusLabel(statusId: number): string {
    return this.statusMap[statusId] || 'Desconhecido';
  }

  getStatusSeverity(statusId: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (statusId) {
      case 1: return 'secondary';        // Aguardando Validação
      case 2: return 'success';     // Emitida
      case 3: return 'danger';      // Cancelada
      case 4: return 'info';        // Aprovada
      case 6: return 'info';        // Processamento
      default: return 'secondary';
    }
  }
}