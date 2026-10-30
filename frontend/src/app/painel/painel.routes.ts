import { Routes } from '@angular/router';
import { somenteLogado } from './core/autenticacao';
import { PainelLayout } from './layout/painel-layout';

export const PAINEL_ROTAS: Routes = [
  { path: 'entrar', title: 'NovoDeNovo · Entrar no painel',
    loadComponent: () => import('./login/login').then(m => m.Login) },
  {
    path: '', component: PainelLayout, canActivate: [somenteLogado],
    children: [
      { path: '', title: 'Painel · Dashboard',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardPagina) },
      { path: 'notebooks', title: 'Painel · Notebooks',
        loadComponent: () => import('./notebooks/lista').then(m => m.ListaNotebooks) },
      { path: 'notebooks/novo', title: 'Painel · Novo notebook',
        loadComponent: () => import('./notebooks/editor').then(m => m.EditorNotebook) },
      { path: 'notebooks/:id', title: 'Painel · Notebook',
        loadComponent: () => import('./notebooks/editor').then(m => m.EditorNotebook) },
      { path: 'vendas', title: 'Painel · Vendas',
        loadComponent: () => import('./vendas/vendas').then(m => m.Vendas) },
      { path: 'garantias', title: 'Painel · Garantias',
        loadComponent: () => import('./garantias/garantias').then(m => m.Garantias) },
      { path: 'configuracoes', title: 'Painel · Configurações',
        loadComponent: () => import('./configuracoes/configuracoes').then(m => m.Configuracoes) },
    ],
  },
];
