import { Component, computed, input } from '@angular/core';
import { Status } from '../core/modelos';
import { STATUS } from '../core/textos';

@Component({
  selector: 'app-selo-status',
  template: `<span class="selo" [class]="'selo ' + status().toLowerCase()"><i></i>{{ texto() }}</span>`,
  styles: `
    .selo {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 10px; border-radius: 999px;
      font: 600 12px/16px var(--fonte-texto);
      i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    }
    .disponivel { background: var(--sucesso-claro); color: var(--sucesso); }
    .reservado { background: var(--info-claro); color: var(--info); }
    .em_preparacao { background: var(--superficie); color: var(--texto-suave); }
    .vendido { background: var(--escuro); color: var(--branco); i { background: var(--destaque); } }
  `,
})
export class SeloStatus {
  readonly status = input.required<Status>();
  readonly texto = computed(() => STATUS[this.status()]);
}
