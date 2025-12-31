// src/app/features/admin/user-form/user-form.component.ts

import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputMaskModule } from 'primeng/inputmask';
import { TableModule } from 'primeng/table';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Atividade, CreateUser, User, UserService } from '../user.service';

interface CnaeSecundario {
  codigo: string | number;
  descricao: string;
}

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
  cnae_fiscal: string | number;
  cnae_fiscal_descricao: string;
  cnaes_secundarios: CnaeSecundario[];
}

@Component({
  selector: 'app-user-form',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    InputGroupModule,
    InputGroupAddonModule,
    FloatLabelModule,
    InputMaskModule,
    TableModule,
    ToggleSwitchModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent {
  private _usuarioInicial: User | null = null;

  @Input()
  set usuarioInicial(value: User | null) {
    this._usuarioInicial = value;
    if (value) {
      this.usuario = {
        ...value,
        password: ''
      };
    } else {
      this.usuario = this.getUsuarioVazio();
    }
  }

  get usuarioInicial(): User | null {
    return this._usuarioInicial;
  }

  @Output() salvar = new EventEmitter<CreateUser>();
  @Output() cancelar = new EventEmitter<void>();

  usuario: CreateUser = this.getUsuarioVazio();

  novaAtividadeCodigo: string = '';
  novaAtividadeDescricao: string = '';

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  private getUsuarioVazio(): CreateUser {
    return {
      email: '',
      password: '',
      razao_social: '',
      cnpj_cpf: '',
      role_id: 2,
      aliquota: null,
      atividades: [],
      telefone: '',
      pais: 'Brasil',
      uf: '',
      cidade: '',
      bairro: '',
      logradouro: '',
      numero: '',
      complemento: '',
      cep: '',
      emite: false,
      insc_municipal: null
    };
  }

  onCnpjCpfInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const clean = input.value.replace(/\D/g, '');
    let masked = '';

    if (clean.length <= 11) {
      masked = clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (clean.length <= 14) {
      masked = clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    input.value = masked;
    this.usuario.cnpj_cpf = masked;
    this.usuario.atividades = [];

    if (clean.length === 14) {
      this.buscarDadosCnpj(clean);
    }
  }

  buscarDadosCnpj(cnpj: string) {
    // Correção: remover espaços extras na URL
    this.http.get<ApiResponse>(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`).subscribe({
      next: (data) => {
        this.usuario = {
          ...this.usuario,
          razao_social: data.razao_social,
          email: data.email || '',
          telefone: data.ddd_telefone_1 || '',
          cep: data.cep || '',
          uf: data.uf || '',
          cidade: data.municipio || '',
          bairro: data.bairro || '',
          logradouro: data.logradouro || '',
          numero: data.numero || '',
          complemento: data.complemento || '',
          pais: data.pais || 'Brasil'
        };

        const atividades: Atividade[] = [];

        // CNAE fiscal (se existir)
        if (data.cnae_fiscal) {
          atividades.push({
            cod_cnae: String(data.cnae_fiscal).trim(),
            desc_cnae: data.cnae_fiscal_descricao || ''
          });
        }

        // CNAEs secundários
        if (data.cnaes_secundarios?.length) {
          for (const c of data.cnaes_secundarios) {
            atividades.push({
              cod_cnae: String(c.codigo).trim(),
              desc_cnae: c.descricao || ''
            });
          }
        }

        this.usuario.atividades = atividades;
      },
      error: (err) => {
        console.error('Erro ao buscar CNPJ:', err);
        this.messageService.add({
          severity: 'warn',
          summary: 'Atenção',
          detail: 'Não foi possível carregar dados do CNPJ. Preencha manualmente.'
        });
      }
    });
  }

  adicionarAtividadeManual() {
    const codigo = this.novaAtividadeCodigo.trim();
    const descricao = this.novaAtividadeDescricao.trim();

    if (codigo && descricao) {
      this.usuario.atividades.push({ cod_cnae: codigo, desc_cnae: descricao });
      this.novaAtividadeCodigo = '';
      this.novaAtividadeDescricao = '';
    }
  }

  podeAdicionarAtividade(): boolean {
    return !!this.novaAtividadeCodigo.trim() && !!this.novaAtividadeDescricao.trim();
  }

  removerAtividade(index: number) {
    this.usuario.atividades.splice(index, 1);
  }

  onSubmit() {
    if (this.usuario.razao_social && this.usuario.cnpj_cpf) {
      this.salvar.emit({ ...this.usuario });
    }
  }

  onCancel() {
    this.cancelar.emit();
  }

  redefinirSenha() {
    if (!this.usuarioInicial?.id) return;

    this.confirmationService.confirm({
      message: 'Deseja redefinir a senha deste usuário? Uma nova senha será enviada por e-mail.',
      header: 'Confirmar Redefinição',
      icon: 'pi pi-lock',
      acceptLabel: 'Sim, redefinir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => {
        this.userService.redefinirSenha(this.usuarioInicial!.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Senha redefinida com sucesso! Um e-mail foi enviado ao usuário.'
            });
          },
          error: (err) => {
            console.error('Erro ao redefinir senha:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível redefinir a senha. Tente novamente.'
            });
          }
        });
      }
    });
  }
}