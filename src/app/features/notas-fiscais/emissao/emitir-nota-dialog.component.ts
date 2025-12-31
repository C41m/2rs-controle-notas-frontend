import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { NotaFiscalService, NotaFiscalCreate, MinhaNotaFiscal } from '../nota-fiscal.service';
import { Atividade } from '../../admin/user.service';
import { AtividadeService } from '../atividades.service';

interface ApiResponse {
  cnpj: string;
  razao_social: string;
  email: string | null;
  ddd_telefone_1: string;
  cep: string;
  uf: string;
  municipio: string;
  bairro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  pais: string | null;
}

@Component({
  selector: 'app-emitir-nota-dialog',
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    InputGroupModule,
    InputGroupAddonModule,
    FloatLabelModule,
    InputMaskModule,
    SelectModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './emitir-nota-dialog.component.html',
  styleUrls: ['./emitir-nota-dialog.component.scss']
})
export class EmitirNotaDialogComponent implements OnInit, OnChanges {

  @Input() visible = false;
  @Input() modo: 'criar' | 'editar' = 'criar';
  @Input() notaId?: number; // ID da nota para edição
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() emitida = new EventEmitter<void>();

  // Dados do formulário
  cpf_cnpj = '';
  razao_social = '';
  email = '';
  telefone = '';
  pais = 'Brasil';
  uf = '';
  cidade = '';
  cep = '';
  logradouro = '';
  numero = '';
  complemento = '';
  bairro = '';
  descricao = '';
  valor_total: number | null = null;
  cod_cnae = '';

  atividadesUsuario: Atividade[] = [];
  carregando = false;
  salvando = false;

  constructor(
    private notaService: NotaFiscalService,
    private atividadeService: AtividadeService,
    private http: HttpClient,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.carregarAtividadesDoUsuario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.resetForm();

      if (this.modo === 'editar' && this.notaId) {
        this.carregarDadosParaEdicao();
      }
    }
  }

  private resetForm() {
    this.cpf_cnpj = '';
    this.razao_social = '';
    this.email = '';
    this.telefone = '';
    this.pais = 'Brasil';
    this.uf = '';
    this.cidade = '';
    this.cep = '';
    this.logradouro = '';
    this.numero = '';
    this.complemento = '';
    this.bairro = '';
    this.descricao = '';
    this.valor_total = null;
    this.cod_cnae = '';
    this.carregando = false;
  }

  private carregarDadosParaEdicao() {
    this.carregando = true;

    this.notaService.buscarPorId(this.notaId!).subscribe({
      next: (nota) => {
        this.preencherFormulario(nota);
      },
      error: (err) => {
        console.error('Erro ao carregar nota:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os dados da nota.',
          life: 3000
        });
        this.fechar();
      },
      complete: () => {
        this.carregando = false;
      }
    });
  }

  private preencherFormulario(nota: MinhaNotaFiscal) {
    const cliente = nota.cliente;

    this.cpf_cnpj = this.formatarDocumento(cliente.cpf_cnpj || '');
    this.razao_social = cliente.razao_social || '';
    this.email = cliente.email || '';
    this.telefone = cliente.telefone || '';
    this.cep = cliente.cep || '';
    this.logradouro = cliente.logradouro || '';
    this.numero = cliente.numero || '';
    this.complemento = cliente.complemento || '';
    this.bairro = cliente.bairro || '';
    this.uf = cliente.uf || '';
    this.cidade = cliente.cidade || '';
    this.pais = cliente.pais || 'Brasil';

    this.valor_total = nota.valor_total;
    this.descricao = nota.descricao || '';
    this.cod_cnae = nota.cod_cnae || '';
  }

  private carregarAtividadesDoUsuario() {
    this.atividadeService.listarMinhas().subscribe({
      next: (atividades) => {
        this.atividadesUsuario = atividades;
      },
      error: (err) => {
        console.error('Erro ao carregar atividades:', err);
      }
    });
  }

  formatarDocumento(doc: string): string {
    const clean = doc.replace(/\D/g, '');
    if (clean.length === 11) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (clean.length === 14) {
      return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return doc;
  }

  onCnpjCpfInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const clean = input.value.replace(/\D/g, '');
    let masked = '';

    if (clean.length <= 11) {
      masked = clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (clean.length <= 14) {
      masked = clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    input.value = masked;
    this.cpf_cnpj = masked;
  }

  onCnpjCpfBlur() {
    const clean = this.cpf_cnpj.replace(/\D/g, '');
    if (clean.length === 11 || clean.length === 14) {
      this.buscarDadosCliente(clean);
    }
  }

  private buscarDadosCliente(documento: string) {
    this.carregando = true;

    this.notaService.buscarClientePorDocumento(documento).subscribe({
      next: (cliente) => {
        if (cliente) {
          this.preencherDadosCliente(cliente);
        } else if (documento.length === 14) {
          this.buscarDadosCnpj(documento);
        } else {
          this.carregando = false;
        }
      },
      error: (err) => {
        console.error('Erro ao buscar cliente:', err);
        if (documento.length === 14) {
          this.buscarDadosCnpj(documento);
        } else {
          this.carregando = false;
        }
      }
    });
  }

  private buscarDadosCnpj(cnpj: string) {
    this.http.get<ApiResponse>(`https://brasilapi.com.br/api/cnpj/v1/${cnpj.trim()}`).subscribe({
      next: (data) => {
        this.preencherDadosCnpj(data);
      },
      error: (err) => {
        console.error('Erro ao buscar CNPJ:', err);
        this.carregando = false;
      },
      complete: () => {
        this.carregando = false;
      }
    });
  }

  private preencherDadosCliente(cliente: any) {
    this.razao_social = cliente.razao_social || this.razao_social;
    this.email = cliente.email || this.email;
    this.telefone = cliente.telefone || this.telefone;
    this.pais = cliente.pais || this.pais;
    this.uf = cliente.uf || this.uf;
    this.cidade = cliente.cidade || this.cidade;
    this.cep = cliente.cep || this.cep;
    this.logradouro = cliente.logradouro || this.logradouro;
    this.numero = cliente.numero || this.numero;
    this.complemento = cliente.complemento || this.complemento;
    this.bairro = cliente.bairro || this.bairro;
    this.carregando = false;
  }

  private preencherDadosCnpj(data: ApiResponse) {
    this.razao_social = data.razao_social || this.razao_social;
    this.email = data.email || this.email;
    this.telefone = data.ddd_telefone_1 || this.telefone;
    this.cep = data.cep || this.cep;
    this.uf = data.uf || this.uf;
    this.cidade = data.municipio || this.cidade;
    this.bairro = data.bairro || this.bairro;
    this.logradouro = data.logradouro || this.logradouro;
    this.numero = data.numero || this.numero;
    this.complemento = data.complemento || this.complemento;
    this.pais = data.pais || this.pais;
    this.carregando = false;
  }

  fechar() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.resetForm();
  }

  salvar() {
    if (!this.cpf_cnpj || !this.razao_social || !this.valor_total || !this.cod_cnae) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios.',
        life: 3000
      });
      return;
    }

    this.salvando = true;
    this.carregando = true;

    const payload: NotaFiscalCreate = {
      cpf_cnpj: this.cpf_cnpj.replace(/\D/g, ''),
      razao_social: this.razao_social,
      email: this.email || undefined,
      telefone: this.telefone || undefined,
      pais: this.pais || undefined,
      uf: this.uf || undefined,
      cidade: this.cidade || undefined,
      cep: this.cep || undefined,
      logradouro: this.logradouro || undefined,
      numero: this.numero || undefined,
      complemento: this.complemento || undefined,
      bairro: this.bairro || undefined,
      cod_cnae: this.cod_cnae,
      valor_total: this.valor_total!,
      descricao: this.descricao,
    };

    const operacao$ = this.modo === 'criar'
      ? this.notaService.emitir(payload)
      : this.notaService.atualizar(this.notaId!, payload);

    operacao$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: this.modo === 'criar'
            ? 'Solicitação de nota fiscal emitida com sucesso!'
            : 'Nota fiscal atualizada com sucesso!',
          life: 3000
        });
        this.emitida.emit();
        this.fechar();
      },
      error: (err) => {
        console.error('Erro ao salvar nota:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: this.modo === 'criar'
            ? 'Não foi possível emitir a nota fiscal.'
            : 'Não foi possível atualizar a nota fiscal.',
          life: 5000
        });
        this.salvando = false;
        this.carregando = false;        

      },
      complete: () => {
        this.salvando = false;
        this.carregando = false;
      }
    });
  }

  truncate(text: string, maxLength: number = 30): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}