// src/app/features/user-account/user-account/user-account.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/auth.service';
import { UserService, User } from '../../../features/admin/user.service';
import { firstValueFrom } from 'rxjs';
import { DividerModule } from 'primeng/divider';
import { MaskCpfCnpjPipe } from '../../../shared/mask-cpf-cnpj.pipe';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { FloatLabel } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { ProgressBar } from 'primeng/progressbar';

@Component({
  selector: 'app-user-account',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    DividerModule,
    MaskCpfCnpjPipe,
    InputGroup,
    InputGroupAddon,
    FloatLabel,
    MessageModule,
    ProgressBar
  ],
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.scss']
})
export class UserAccountComponent implements OnInit {
  protected auth = inject(AuthService);
  protected userService = inject(UserService);
  protected messageService = inject(MessageService);

  user: User | null = null;
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  isLoading = false
  isLoadingInfo = false

  // Flags para exibir mensagens de erro
  currentPasswordTouched = false;
  newPasswordTouched = false;
  confirmNewPasswordTouched = false;

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.isLoadingInfo = true
    this.userService.meusDadosUsuario().subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (err) => {
        console.error('Erro ao carregar dados do usuário', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar seus dados.'
        });
      },
      complete: () => {
        this.isLoadingInfo = false
      }
    });
  }

  // Validação manual para exibição de erro
  get currentPasswordInvalid(): boolean {
    return this.currentPasswordTouched && !this.currentPassword.trim();
  }

  get newPasswordInvalid(): boolean {
    return this.newPasswordTouched && !this.newPassword.trim();
  }

  get confirmNewPasswordInvalid(): boolean {
    return (
      this.confirmNewPasswordTouched &&
      (!this.confirmNewPassword.trim() || this.newPassword !== this.confirmNewPassword)
    );
  }

  // Atualiza o estado "touched" ao sair do campo (blur)
  markTouched(field: 'current' | 'new' | 'confirm') {
    switch (field) {
      case 'current':
        this.currentPasswordTouched = true;
        break;
      case 'new':
        this.newPasswordTouched = true;
        break;
      case 'confirm':
        this.confirmNewPasswordTouched = true;
        break;
    }
  }

  // Validação completa (usada no botão)
  get canChangePassword(): boolean {
    return (
      this.currentPassword.trim().length > 0 &&
      this.newPassword.trim().length > 0 &&
      this.newPassword === this.confirmNewPassword
    );
  }

  async changePassword() {
    // Validação inicial
    this.currentPasswordTouched = true;
    this.newPasswordTouched = true;
    this.confirmNewPasswordTouched = true;

    if (!this.canChangePassword) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha corretamente a senha atual e a nova senha (com confirmação).'
      });
      return;
    }

    this.isLoading = true; // ← ativa loading

    try {
      await firstValueFrom(
        this.auth.changePassword(this.currentPassword, this.newPassword)
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Senha alterada com sucesso!'
      });

      // Reset
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmNewPassword = '';
      this.currentPasswordTouched = false;
      this.newPasswordTouched = false;
      this.confirmNewPasswordTouched = false;

    } catch (error: any) {
      const msg = error?.error?.detail || 'Erro ao alterar a senha. Verifique sua senha atual.';
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: msg
      });
    } finally {
      this.isLoading = false; // ← desativa loading sempre
    }
  }
}