import { Component, input, signal, effect } from '@angular/core';

@Component({
  selector: 'app-foto-notebook',
  template: `
    @if (src() && !falhou()) {
      <img [src]="src()" [alt]="alt()" loading="lazy" (error)="falhou.set(true)" />
    } @else {
      <div class="vazio" role="img" [attr.aria-label]="alt() || 'Foto do notebook'">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
                stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          <circle cx="12" cy="13" r="3.5" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <span class="rotulo">Foto real do notebook</span>
      </div>
    }
  `,
  styles: `
    :host { display: block; background: var(--superficie); }
    img { width: 100%; height: 100%; object-fit: cover; }
    .vazio {
      width: 100%; height: 100%; min-height: 60px;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
      color: var(--texto-suave);
    }
    :host-context(.miniaturas) .vazio .rotulo { display: none; }
    :host-context(.miniaturas) svg { width: 22px; height: 22px; }
  `,
})
export class FotoNotebook {
  readonly src = input<string | null>(null);
  readonly alt = input('');
  readonly falhou = signal(false);

  constructor() {
    effect(() => { this.src(); this.falhou.set(false); });
  }
}
