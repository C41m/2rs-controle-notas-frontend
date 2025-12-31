// src/app/features/admin/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  cnpj_cpf: string;
  razao_social: string;
  role_id: number;
  aliquota: number | null;
  atividades: Atividade[];
  telefone: string;
  pais: string;
  uf: string;
  cidade: string;
  bairro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  cep: string;
  emite: boolean | false;
  insc_municipal: string | null;
}

export interface CreateUser {
  email: string;
  password: string | null;
  cnpj_cpf: string;
  razao_social: string;
  role_id: number;
  aliquota: number | null;
  atividades: Atividade[];
  telefone: string;
  pais: string;
  uf: string;
  cidade: string;
  bairro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  cep: string;
  emite: boolean | false;
  insc_municipal: string | null;
}

export interface Atividade {
  cod_cnae: string;
  desc_cnae: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrlUsuarios = `${environment.apiUrl}/usuarios`;
  private apiUrlAuth = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  listar(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrlUsuarios);
  }

  criar(usuario: CreateUser): Observable<User> {
    return this.http.post<User>(`${this.apiUrlAuth}/register`, usuario);
  }

  atualizar(id: string, usuario: Partial<CreateUser>): Observable<User> {
    const { password, ...payload } = usuario;
    return this.http.put<User>(`${this.apiUrlAuth}/${id}`, payload);
  }

  excluir(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrlAuth}/${id}`);
  }

  atualizarAliquotasEmLote(): Observable<any> {
    return this.http.post(`${this.apiUrlUsuarios}/atualizar-aliquotas-lote`, {});
  }

  meusDadosUsuario(): Observable<User> {
    return this.http.get<User>(`${this.apiUrlUsuarios}/meusDadosUsuario`);
  }

  redefinirSenha(userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrlAuth}/redefinir-senha`, {
      user_id: userId 
    });
  }
}