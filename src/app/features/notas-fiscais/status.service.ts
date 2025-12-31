import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StatusNota {
  id: number;
  nome: string;
}

export interface Atividade {
  id: number;
  cod_cnae: string;
  desc_cnae: string;
  usuario_id: string;
}

@Injectable({ providedIn: 'root' })
export class StatusService {
  private apiUrl = `${environment.apiUrl}/status`;

  constructor(private http: HttpClient) {}

  getAllStatus(): Observable<StatusNota[]> {
    return this.http.get<StatusNota[]>(this.apiUrl);
  }

  getStatusById(id: number): Observable<StatusNota> {
    return this.http.get<StatusNota>(`${this.apiUrl}/${id}`);
  }
}