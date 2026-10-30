import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-icone-servico',
  template: `
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @switch (tipo()) {
        @case ('limpeza') {
          <circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-6 4-6 2 0 2 3 0 4.5L12 10M14 12c4 0 6 1 6 4 0 2-3 2-4.5 0L14 12M12 14c0 4-1 6-4 6-2 0-2-3 0-4.5L12 14M10 12c-4 0-6-1-6-4 0-2 3-2 4.5 0L10 12"/>
        }
        @case ('troca') {
          <rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>
        }
        @case ('upgrade') {
          <rect x="3" y="12" width="18" height="8" rx="1.5"/><path d="M7 16h.01M12 3v6M9 6l3-3 3 3"/>
        }
        @case ('formatacao') {
          <rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 21h8M12 17v4M9.5 10.5a2.8 2.8 0 1 0 1-2.2M9.5 7v1.5H11"/>
        }
        @default {
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z"/>
        }
      }
    </svg>
  `,
  styles: `:host { display: inline-flex; }`,
})
export class IconeServico {
  readonly nome = input('');
  readonly tipo = computed(() => {
    const n = this.nome().toLowerCase();
    if (n.includes('limp')) return 'limpeza';
    if (n.includes('troca') || n.includes('peça')) return 'troca';
    if (n.includes('upgrade') || n.includes('ssd') || n.includes('memória')) return 'upgrade';
    if (n.includes('format') || n.includes('program') || n.includes('sistema')) return 'formatacao';
    return 'manutencao';
  });
}
