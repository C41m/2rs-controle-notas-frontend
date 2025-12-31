// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard.service';
import { roleGuard } from './core/role-guard.service';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/layout.component').then(c => c.LayoutComponent),
    children: [
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clientes/cliente-list/cliente-list.component').then(c => c.ClienteListComponent)
      },
      {
        path: 'notas-fiscais',
        loadComponent: () =>
          import('./features/notas-fiscais/notas-fiscais-list/notas-fiscais.component').then(c => c.NotasFiscaisComponent)
      },
      {
        path: 'admin/usuarios',
        loadComponent: () =>
          import('./features/admin/user-list/user-list.component').then(c => c.UserListComponent),
        canActivate: [roleGuard(1)]
      },
      {
        path: 'admin/notas-fiscais',
        loadComponent: () =>
          import('./features/notas-fiscais/notas-fiscais-admin/notas-fiscais-empresa.component').then(c => c.NotasFiscaisEmpresaComponent),
        canActivate: [roleGuard(1)]
      },
      {
        path: 'conta',
        loadComponent: () =>
          import('./features/user-account/user-account/user-account.component').then(c => c.UserAccountComponent),
        canActivate: [authGuard]
      },
      { path: '', redirectTo: 'notas-fiscais', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
