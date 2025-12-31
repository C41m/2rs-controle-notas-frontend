// user-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserFormComponent } from '../user-form/user-form.component';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { MaskCpfCnpjPipe } from '../../../shared/mask-cpf-cnpj.pipe';
import { UserService, User, CreateUser } from '../user.service';

@Component({
  selector: 'app-user-list',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    DialogModule,
    ToolbarModule,
    ToastModule,
    ProgressBarModule,
    ConfirmDialogModule,
    UserFormComponent,
    TooltipModule,
    MaskCpfCnpjPipe
  ],
  providers: [ConfirmationService, MessageService], // ✅ Adicionado
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  @ViewChild('dt') dt!: Table; // ✅ Para controle do filtro

  usuarios: User[] = [];
  exibirModal = false;
  usuarioEmEdicao: User | null = null;
  loadingTabela = true; // ✅ Indicador de carregamento

  constructor(
    private userService: UserService,
    private messageService: MessageService,        // ✅
    private confirmationService: ConfirmationService // ✅
  ) { }

  ngOnInit() {
    this.carregarUsuarios();
  }

  carregarUsuarios() {
    this.loadingTabela = true;
    this.userService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar usuários.' });
        this.usuarios = [];
      },
      complete: () => {
        this.loadingTabela = false;
      }
    });
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
  }

  editarUsuario(user: User) {
    this.usuarioEmEdicao = user;
    this.exibirModal = true;
  }

  excluirUsuario(user: User) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir ${user.razao_social}?`,
      header: 'Confirmação de Exclusão',
      icon: 'pi pi-trash',
      acceptIcon: 'pi pi-check',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { styleClass: 'p-button-danger' },
      rejectButtonProps: { styleClass: 'p-button-secondary' },
      accept: () => {
        this.userService.excluir(user.id).subscribe({
          next: (response) => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: response.message });
            this.usuarios = this.usuarios.filter(u => u.id !== user.id);
          },
          error: (err) => {
            console.error('Erro ao excluir usuário:', err);
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir o usuário.' });
          }
        });
      }
    });
  }

  atualizarAliquotasEmLote() {
    this.confirmationService.confirm({
      message: 'Deseja atualizar as alíquotas de TODAS as notas pendentes com a alíquota atual de cada cliente?',
      header: 'Atualização em Lote',
      icon: 'pi pi-percentage',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { styleClass: 'p-button-help' },
      rejectButtonProps: { styleClass: 'p-button-secondary' },
      accept: () => {
        this.loadingTabela = true;
        this.userService.atualizarAliquotasEmLote().subscribe({
          next: (res: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `${res.total_usuarios} usuários processados. ${res.total_notas_atualizadas} notas atualizadas.`
            });
            this.carregarUsuarios();
          },
          error: (err) => {
            console.error('Erro na atualização em lote:', err);
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar as alíquotas em lote.' });
            this.loadingTabela = false;
          }
        });
      }
    });
  }

  abrirModal() {
    this.usuarioEmEdicao = null;
    this.exibirModal = true;
  }

  onCancelar() {
    this.exibirModal = false;
    this.usuarioEmEdicao = null;
  }

  onSalvar(usuario: CreateUser) {
    const payload = { ...usuario, aliquota: usuario.aliquota ?? null };
    console.log('Payload:', payload)
    this.loadingTabela = true; // 👈 ativa loader

    const saveObservable = this.usuarioEmEdicao
      ? this.userService.atualizar(this.usuarioEmEdicao.id, payload)
      : this.userService.criar(payload);

    saveObservable.subscribe({
      next: (usuarioSalvo) => {
        if (this.usuarioEmEdicao) {
          const index = this.usuarios.findIndex(u => u.id === usuarioSalvo.id);
          if (index !== -1) this.usuarios[index] = usuarioSalvo;
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário atualizado.' });
        } else {
          this.usuarios.push(usuarioSalvo);
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário cadastrado.' });
        }
        this.exibirModal = false;
        this.usuarioEmEdicao = null;
        this.carregarUsuarios();
      },
      error: (err) => {
        console.error('Erro ao salvar usuário:', err);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar o usuário.' });
        this.loadingTabela = false;
      }
    });
  }
}