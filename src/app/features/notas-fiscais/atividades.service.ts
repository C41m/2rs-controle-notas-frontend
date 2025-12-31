// src/app/features/notas-fiscais/nota-fiscal.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Atividade {
    id: number;
    cod_cnae: string;
    desc_cnae: string;
    usuario_id: string;
}

@Injectable({ providedIn: 'root' })
export class AtividadeService {
    private apiUrl = `${environment.apiUrl}/atividades`;

    constructor(private http: HttpClient) { }

    listarMinhas(): Observable<Atividade[]> {
        return this.http.get<Atividade[]>(this.apiUrl);
    }
}