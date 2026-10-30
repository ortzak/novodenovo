import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'NovoDeNovo · Notebooks revisados',
    loadComponent: () => import('./paginas/catalogo/catalogo').then(m => m.Catalogo) },
  { path: 'notebook/:codigo', title: 'NovoDeNovo · Notebook',
    loadComponent: () => import('./paginas/detalhe/detalhe').then(m => m.Detalhe) },
  { path: 'servicos', title: 'NovoDeNovo · Serviços técnicos',
    loadComponent: () => import('./paginas/servicos/servicos').then(m => m.Servicos) },
  { path: 'como-comprar', title: 'NovoDeNovo · Como comprar',
    loadComponent: () => import('./paginas/como-comprar/como-comprar').then(m => m.ComoComprar) },
  { path: 'loja', redirectTo: 'como-comprar' },
  { path: '**', title: 'NovoDeNovo · Página não encontrada',
    loadComponent: () => import('./paginas/nao-encontrada/nao-encontrada').then(m => m.NaoEncontrada) },
];
