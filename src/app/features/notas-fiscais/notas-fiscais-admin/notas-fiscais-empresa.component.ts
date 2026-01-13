// src/app/features/notas-fiscais/notas-fiscais-admin/notas-fiscais-empresa.component.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import {
    NotaFiscalService,
    NotaFiscalAdmin,
    RecusarNota
} from '../nota-fiscal.service';
import { MaskCpfCnpjPipe } from '../../../shared/mask-cpf-cnpj.pipe';
import { VisualizarNotaDialogComponent } from '../shared/visualizar-nota-dialog/visualizar-nota-dialog.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { RecusarNotaDialogComponent } from '../shared/recusar-nota-dialog/recusar-nota-dialog.component';
import { StatusService, StatusNota } from '../status.service';
import { SelectModule } from 'primeng/select';
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'app-notas-fiscais-empresa',
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        TagModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        ToolbarModule,
        ToastModule,
        MaskCpfCnpjPipe,
        VisualizarNotaDialogComponent,
        ConfirmDialogModule,
        ProgressBarModule,
        RecusarNotaDialogComponent,
        SelectModule,
        FormsModule
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './notas-fiscais-empresa.component.html',
    styleUrls: ['./notas-fiscais-empresa.component.scss']
})
export class NotasFiscaisEmpresaComponent implements OnInit {

    @ViewChild('dt') dt!: Table;

    statusMap: Record<number, string> = {};
    notas: NotaFiscalAdmin[] = [];
    notaSelecionadaClienteAdmin: NotaFiscalAdmin | null = null;
    modalVisualizarVisivel = false;
    loadingAcao: { notaId: number; tipo: 'emitir' | 'recusar' } | null = null;
    loadingTabela = true;
    notaParaRecusar: NotaFiscalAdmin | null = null;
    modalRecusarVisivel = false;
    statusOptions: { label: string; value: number | null; severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' }[] = [];
    selectedStatus: number | null = null;
    globalFilterValue = '';

    constructor(
        private notaService: NotaFiscalService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private statusService: StatusService
    ) { }

    ngOnInit() {
        this.loadStatusMap();
        this.carregarNotas();
    }

    onGlobalFilter(event: Event) {
        const input = event.target as HTMLInputElement;
        this.globalFilterValue = input.value;
        this.dt.filterGlobal(input.value, 'contains');
    }

    carregarNotas() {
        this.loadingTabela = true;
        this.notaService.listarTodasNotas().subscribe({
            next: (notas) => this.notas = notas,
            error: (err) => {
                console.error('Erro ao carregar notas:', err);
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar notas.' });
                this.notas = [];
            },
            complete: () => this.loadingTabela = false
        });
    }

    visualizarNota(nota: NotaFiscalAdmin) {
        this.notaSelecionadaClienteAdmin = nota;
        this.modalVisualizarVisivel = true;
    }

    emitirNota(nota: NotaFiscalAdmin) {
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
                this.executarAcaoDeStatus(nota, 'emitir'); // status 3 = Emitida
            }
        });
    }

    visualizarPdf(nota: NotaFiscalAdmin): void {
        if (this.loadingTabela) return;
        const url = nota.link_api_pdf?.trim();
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    visualizarXml(nota: NotaFiscalAdmin): void {
        if (this.loadingTabela) return;
        const url = nota.link_api_xml?.trim();
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }


    recusarNota(nota: NotaFiscalAdmin) {
        this.notaParaRecusar = nota;
        this.modalRecusarVisivel = true;
    }

    onRecusarConfirmado(motivo: string) {
        if (!this.notaParaRecusar) return;
        this.executarAcaoComMotivo(this.notaParaRecusar, 3, motivo, 'recusar'); // status 3 = Recusada
        this.modalRecusarVisivel = false;
        this.notaParaRecusar = null;
    }

    private executarAcaoDeStatus(nota: NotaFiscalAdmin, tipo: 'emitir' | 'recusar') {
        this.loadingAcao = { notaId: nota.id, tipo };
        this.notaService.emitirNota(nota.id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Nota aprovada com sucesso!' });
                this.carregarNotas();
            },
            error: (err) => {
                console.error('Erro ao emitir nota:', err);
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao emitir nota: ' + err.message || '' });
                this.loadingAcao = null
            },
            complete: () => {
                this.loadingAcao = null

            }
        });
    }

    private executarAcaoComMotivo(
        nota: NotaFiscalAdmin,
        statusId: number,
        motivo: string,
        tipo: 'recusar'
    ) {
        this.loadingAcao = { notaId: nota.id, tipo };
        const payload: RecusarNota = {
            nota_id: nota.id,
            status_id: statusId,
            desc_motivo: motivo
        };
        this.notaService.recusarNota(payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Nota recusada com sucesso!' });
                this.carregarNotas();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao recusar nota.' });
            },
            complete: () => this.loadingAcao = null
        });
    }

    estaCarregando(notaId: number): boolean {
        return this.loadingAcao?.notaId === notaId;
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

    loadStatusMap(): void {
        this.statusService.getAllStatus().subscribe({
            next: (statusList: StatusNota[]) => {
                this.statusMap = statusList.reduce((map, status) => {
                    map[status.id] = status.nome;
                    return map;
                }, {} as Record<number, string>);

                // ✅ Preenche as opções do dropdown
                this.statusOptions = [
                    { label: 'Todos os status', value: null, severity: 'secondary' },
                    ...statusList.map(status => ({
                        label: status.nome,
                        value: status.id,
                        severity: this.getStatusSeverity(status.id) // ✅ reutiliza sua função existente
                    }))

                ];
            },
            error: (err) => {
                console.error('Erro ao carregar status:', err);
                // Fallback se a API falhar
                this.statusOptions = [
                    { label: 'Aguardando', value: 1, severity: 'secondary' },
                    { label: 'Aprovada', value: 2, severity: 'success' },
                    { label: 'Recusada', value: 3, severity: 'warn' },
                    { label: 'Emitida', value: 4, severity: 'info' }
                ];
                this.statusMap = this.statusOptions.reduce((map, opt) => {
                    if (opt.value !== null) map[opt.value] = opt.label;
                    return map;
                }, {} as Record<number, string>);
            }
        });
    }

    onStatusFilter() {
        if (this.selectedStatus === null) {
            this.dt.filter('', 'status_id', 'equals'); // Limpa filtro
        } else {
            this.dt.filter(this.selectedStatus, 'status_id', 'equals');
        }
    }

    clearFilters() {
        this.dt.clear();
        this.selectedStatus = null;
        this.globalFilterValue = ''; // ✅ reseta o valor
        this.onStatusFilter();
    }

    getStatusLabel(statusId: number): string {
        return this.statusMap[statusId] || 'Desconhecido';
    }
}