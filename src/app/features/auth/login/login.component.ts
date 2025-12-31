import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputMaskModule } from 'primeng/inputmask';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api'; // ✅ para toasts
import { ToastModule } from 'primeng/toast'; // ✅ necessário para toasts
import { ProgressSpinner } from 'primeng/progressspinner';

// Validador customizado

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputMaskModule,
    FloatLabelModule,
    ToastModule,
    ProgressSpinner
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm = this.fb.group({
    document: ['', [Validators.required]], // ← campo "document"
    password: ['', Validators.required]
  });

  isSubmitting = false
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService // ✅ injete

  ) { }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.loginForm.disable(); // <<<<< DESABILITA TUDO DE VERDADE


    const { document, password } = this.loginForm.value;

    this.authService.login({ username: document!, password: password! }).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Login realizado com sucesso!',
          life: 3000
        });
        if (response.role_id === 1) {
          this.router.navigate(['/admin/notas-fiscais']);
        } else {
          this.router.navigate(['/notas-fiscais']);
        }
      },
      error: (err) => {
        this.loginForm.enable();  // <<<<< REATIVA
        this.isSubmitting = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Usuário ou senha inválidos.',
          life: 5000
        });
        this.isSubmitting = false; // ✅ reabilita após erro
      },
      complete: () => {
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && (control.touched || this.submitted));
  }
}