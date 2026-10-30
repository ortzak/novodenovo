import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, of } from 'rxjs';
import { VitrineService } from '../core/vitrine.service';
import { linkWhatsapp } from '../core/textos';
import { IconeWhatsapp } from '../shared/icone-whatsapp';

@Component({
  selector: 'app-cabecalho',
  imports: [RouterLink, RouterLinkActive, IconeWhatsapp],
  template: `
    <header>
      <div class="container barra">
        <a routerLink="/" class="logo" aria-label="NovoDeNovo — início">
          <img src="img/logo-novodenovo.png" alt="" width="56" height="37" />
          <span>NovoDeNovo</span>
        </a>

        <button type="button" class="menu-celular" (click)="menuAberto.set(!menuAberto())"
                [attr.aria-expanded]="menuAberto()" aria-label="Abrir menu">
          <span></span><span></span><span></span>
        </button>

        <nav [class.aberto]="menuAberto()" (click)="menuAberto.set(false)">
          <a routerLink="/" routerLinkActive="ativo" [routerLinkActiveOptions]="{ exact: true }">Catálogo</a>
          <a routerLink="/servicos" routerLinkActive="ativo">Serviços</a>
          <a routerLink="/como-comprar" routerLinkActive="ativo">Como comprar</a>
        </nav>

        <a class="btn btn-whatsapp" [href]="whatsapp()" target="_blank" rel="noopener">
          <app-icone-whatsapp /> <span>WhatsApp</span>
        </a>
      </div>
    </header>
  `,
  styles: `
    header { background: var(--escuro); color: var(--branco); position: sticky; top: 0; z-index: 20; }
    .barra { display: flex; align-items: center; justify-content: space-between; gap: 24px; height: 72px; }
    .logo {
      display: flex; align-items: center; gap: 10px; text-decoration: none;
      font: 500 20px/1 var(--fonte-titulo);
      img { height: 37px; width: auto; }
    }
    nav { display: flex; gap: 32px; a { font-weight: 600; text-decoration: none; opacity: .85; &:hover, &.ativo { opacity: 1; color: var(--destaque); } } }
    .menu-celular { display: none; }
    @media (max-width: 760px) {
      .barra { gap: 12px; }
      .btn-whatsapp { padding: 10px 14px; span { display: none; } }
      .menu-celular {
        display: flex; flex-direction: column; gap: 5px; margin-left: auto;
        background: none; border: 0; padding: 10px; cursor: pointer;
        span { width: 22px; height: 2px; background: var(--branco); border-radius: 2px; }
      }
      nav {
        display: none; position: absolute; top: 72px; left: 0; right: 0;
        flex-direction: column; gap: 0; background: var(--escuro); border-top: 1px solid #3A3C42;
        a { padding: 16px var(--margem); }
        &.aberto { display: flex; }
      }
    }
  `,
})
export class Cabecalho {
  private vitrine = inject(VitrineService);
  private loja = toSignal(this.vitrine.loja().pipe(catchError(() => of(undefined))));
  readonly whatsapp = computed(() => linkWhatsapp(this.loja()));
  readonly menuAberto = signal(false);
}
