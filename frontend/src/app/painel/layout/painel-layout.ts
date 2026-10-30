import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessaoService } from '../core/sessao.service';

@Component({
  selector: 'app-painel-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="painel">
      <aside [class.aberto]="menuAberto()">
        <div class="marca">
          <a routerLink="/painel" class="logo">
            <img src="img/logo-novodenovo.png" alt="" width="48" height="32" />
            <span>Painel</span>
          </a>
          <button type="button" class="menu-celular" (click)="menuAberto.set(!menuAberto())"
                  [attr.aria-expanded]="menuAberto()" aria-label="Abrir menu">
            <span></span><span></span><span></span>
          </button>
        </div>
        <nav (click)="menuAberto.set(false)">
          <a routerLink="/painel" routerLinkActive="ativo" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          <a routerLink="/painel/notebooks" routerLinkActive="ativo">Notebooks</a>
          <a routerLink="/painel/vendas" routerLinkActive="ativo">Vendas</a>
          <a routerLink="/painel/garantias" routerLinkActive="ativo">Garantias</a>
          <a routerLink="/painel/configuracoes" routerLinkActive="ativo">Configurações</a>
          <div class="rodape">
            <a href="/" target="_blank" rel="noopener" class="secundario">Ver vitrine ↗</a>
            <span class="usuario">{{ sessao.sessao()?.nome }}</span>
            <button type="button" class="sair" (click)="sair()">Sair</button>
          </div>
        </nav>
      </aside>
      <main><router-outlet /></main>
    </div>
  `,
  styles: `
    .painel {
      display: grid; grid-template-columns: 248px minmax(0, 1fr); min-height: 100vh;
      background: linear-gradient(to right, var(--escuro) 248px, var(--fundo) 248px);
    }
    aside {
      background: var(--escuro); color: var(--branco); padding: 24px 16px;
      position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; gap: 32px;
    }
    .marca { display: flex; align-items: center; justify-content: space-between; }
    .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; font: 500 20px var(--fonte-titulo); }
    .logo img { height: 32px; width: auto; }
    nav { display: flex; flex-direction: column; gap: 6px; flex: 1; }
    nav > a {
      padding: 11px 14px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;
      &:hover { background: rgb(255 255 255 / .06); }
      &.ativo { background: var(--destaque); color: var(--texto); }
    }
    .rodape {
      margin-top: auto; display: flex; flex-direction: column; gap: 10px; padding: 16px 14px 0;
      border-top: 1px solid #3A3C42; font-size: 14px;
    }
    .secundario { text-decoration: none; opacity: .8; &:hover { opacity: 1; color: var(--destaque); } }
    .usuario { color: var(--superficie); }
    .sair {
      align-self: flex-start; background: none; border: 1px solid #55575E; color: var(--branco);
      padding: 6px 14px; border-radius: 8px; cursor: pointer; font: 600 13px var(--fonte-texto);
      &:hover { border-color: var(--destaque); color: var(--destaque); }
    }
    .menu-celular { display: none; }
    main { min-width: 0; }
    @media (max-width: 900px) {
      .painel { grid-template-columns: 1fr; background: var(--fundo); }
      aside { position: sticky; top: 0; z-index: 20; height: auto; padding: 14px 16px; gap: 0; }
      .menu-celular {
        display: flex; flex-direction: column; gap: 5px; background: none; border: 0; padding: 8px; cursor: pointer;
        span { width: 22px; height: 2px; background: var(--branco); border-radius: 2px; }
      }
      nav { display: none; padding-top: 16px; }
      aside.aberto nav { display: flex; }
    }
  `,
})
export class PainelLayout {
  readonly sessao = inject(SessaoService);
  private router = inject(Router);
  readonly menuAberto = signal(false);

  sair(): void {
    this.sessao.sair();
    this.router.navigate(['/painel/entrar']);
  }
}
