// src/app/core/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role_id: number;
  razao_social: string;
  emite?: boolean;
}

export interface User {
  email: string;
  role_id: number;
  razao_social: string;
  emite?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  public currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();


  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('access_token');
    if (token && this.isLoggedIn()) {
      // Carrega dados do localStorage se existirem
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          this.currentUserSubject.next(JSON.parse(storedUser));
        } catch {
          // Ignora erro e deixa como null ou extrai do token
          this.currentUserSubject.next(this.getUserFromToken(token));
        }
      } else {
        this.currentUserSubject.next(this.getUserFromToken(token));
      }

      // ✅ Atualiza imediatamente com dados reais do backend
      this.getProfile().subscribe(); // não precisa de tratamento de erro aqui
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        // Extrai o email do payload do JWT (mais confiável)
        const payload = JSON.parse(atob(response.access_token.split('.')[1]));
        const user: User = {
          email: payload.sub, // ✅ vem do token (não da resposta)
          role_id: response.role_id,
          razao_social: response.razao_social,
          emite: response.emite
        };
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp; // timestamp Unix (em segundos)
      return exp * 1000 > Date.now(); // converte para milissegundos
    } catch {
      return false;
    }
  }

  hasRole(roleId: number): boolean {
    return this.currentUserSubject.value?.role_id === roleId;
  }

  private getUserFromToken(token: string): User {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        email: payload.sub,
        role_id: payload.role_id,
        razao_social: payload.razao_social || '',
        emite: payload.emite ?? false
      };
    } catch {
      return { email: '', role_id: 0, razao_social: '', emite: false };
    }
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/change-password`, {
      current_password: currentPassword,
      new_password: newPassword
    });
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/perfil`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        // Opcional: salvar no localStorage para inicialização mais rápida
        localStorage.setItem('currentUser', JSON.stringify(user));
      })
    );
  }


}