import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Cliente, ClienteService } from '../cliente.service';

@Component({
    selector: 'app-cliente-list',
    imports: [CommonModule, RouterLink],
    template: `
    <h2>Meus Clientes</h2>
    <button routerLink="/clientes/novo">+ Novo Cliente</button>
    <div *ngFor="let c of clientes">
      {{ c.nome }} - {{ c.cpf_cnpj }}
    </div>
  `
})
export class ClienteListComponent implements OnInit {
  clientes: Cliente[] = [];

  constructor(
    private http: HttpClient,
    private clienteService: ClienteService
  ) { }

  ngOnInit() {
    this.clienteService.listar().subscribe(clientes => this.clientes = clientes);
  }
}