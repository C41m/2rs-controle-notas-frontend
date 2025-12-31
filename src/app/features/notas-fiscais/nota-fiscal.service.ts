// src/app/features/notas-fiscais/nota-fiscal.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Atividade } from './../admin/user.service';

export interface Cliente {
  id: number;
  razao_social: string;
  cpf_cnpj: string;
  email?: string;
  telefone?: string;
  pais?: string;
  uf?: string;
  cidade?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
}


export interface MinhaNotaFiscal {
  id: number;
  valor_total: number;
  aliquota: number;
  cod_cnae: string;
  desc_cnae: string;
  status_id: number;
  data_criacao: string;
  descricao: string | null;
  cliente: Cliente; // ← este cliente é o PRÓPRIO USUÁRIO
  desc_motivo: string | null;
}


export interface NotaFiscalCreate {
  // Cliente existente (prioritário)
  cliente_id?: number;

  // Cliente novo (só usado se cliente_id não for informado)
  cpf_cnpj?: string;
  razao_social?: string;
  email?: string;
  telefone?: string;
  pais?: string;
  uf?: string;
  cidade?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;

  // Dados da nota (sempre obrigatórios)
  cod_cnae: string;
  valor_total: number;
  descricao?: string;
}


export interface AtualizarStatusNotaPayload {
  status_id: number;
}

export interface RecusarNota {
  nota_id: number;
  status_id: number;
  desc_motivo: string;
}

export interface AceitarNota {
  nota_id: number;
}

export interface UsuarioResumo {
  id: string;
  email: string;
  razao_social: string;
  cnpj_cpf: string;
}

export interface NotaFiscalAdmin extends MinhaNotaFiscal {
  usuario: {
    id: string;
    email: string;
    razao_social: string;
    cnpj_cpf: string;
  };
}


// Tipo base com campos mínimos para visualização

@Injectable({ providedIn: 'root' })
export class NotaFiscalService {
  private apiUrl = `${environment.apiUrl}/nota-fiscal`;

  constructor(private http: HttpClient) { }

  emitir(nota: NotaFiscalCreate): Observable<MinhaNotaFiscal> {
    return this.http.post<MinhaNotaFiscal>(this.apiUrl, nota);
  }

  // Novo: buscar cliente pelo documento (CPF/CNPJ) para o usuário logado
  buscarClientePorDocumento(documento: string): Observable<Cliente | null> {
    return this.http.get<Cliente | null>(`${environment.apiUrl}/clientes/por-documento/${documento}`);
  }

  buscarAtividades(): Observable<Atividade[]> {
    return this.http.get<Atividade[]>(`${environment.apiUrl}/atividades`);
  }

  listarMinhasNotas(): Observable<MinhaNotaFiscal[]> {
    return this.http.get<MinhaNotaFiscal[]>(this.apiUrl);
  }

  listarTodasNotas(): Observable<NotaFiscalAdmin[]> {
    return this.http.get<NotaFiscalAdmin[]>(`${this.apiUrl}/admin`);
  }

  atualizar(id: number, dados: NotaFiscalCreate): Observable<MinhaNotaFiscal> {
    return this.http.put<MinhaNotaFiscal>(`${this.apiUrl}/${id}`, dados);
  }

  atualizarStatus(id: number, dados: AtualizarStatusNotaPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/status`, dados);
  }

  recusarNota(dados: RecusarNota): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/recusar`, dados);
  }

  emitirNota(notaId: number): Observable<void> {
    const payload = { nota_id: notaId };
    return this.http.post<void>(`${this.apiUrl}/emitir-finalizada`, payload);
  }


  buscarPorId(id: number): Observable<MinhaNotaFiscal> {
    return this.http.get<MinhaNotaFiscal>(`${this.apiUrl}/${id}`);
  }

}