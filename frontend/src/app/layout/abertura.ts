import {
  Component, ElementRef, HostListener, afterNextRender, output, signal, viewChild,
} from '@angular/core';

const CHAVE = 'novodenovo:abertura-vista';

@Component({
  selector: 'app-abertura',
  template: `
    @if (visivel()) {
      <div class="abertura" [class.saindo]="saindo()" (click)="fechar()">
        <video #video muted playsinline preload="auto" poster="video/abertura-poster.jpg"
               (ended)="fechar()" (error)="fechar(true)">
          <source src="video/abertura.webm" type="video/webm" />
          <source src="video/abertura.mp4" type="video/mp4" />
        </video>
        <button type="button" class="pular" (click)="fechar(); $event.stopPropagation()">Pular ›</button>
      </div>
    }
  `,
  styles: `
    .abertura {
      position: fixed; inset: 0; z-index: 100; background: #000;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      transition: opacity .7s ease;
      &.saindo { opacity: 0; pointer-events: none; }
    }
    video { width: 100%; height: 100%; object-fit: contain; }
    .pular {
      position: absolute; right: 24px; bottom: 24px;
      padding: 10px 18px; border-radius: 999px; cursor: pointer;
      background: rgb(255 255 255 / .1); color: #fff; border: 1px solid rgb(255 255 255 / .35);
      font: 600 14px/1 var(--fonte-texto); backdrop-filter: blur(4px);
      &:hover { background: rgb(232 163 23 / .9); color: var(--texto); border-color: transparent; }
    }
  `,
})
export class Abertura {
  readonly terminou = output<void>();
  readonly visivel = signal(deveMostrar());
  readonly saindo = signal(false);
  private video = viewChild<ElementRef<HTMLVideoElement>>('video');

  constructor() {
    if (!this.visivel()) return;
    document.body.style.overflow = 'hidden';
    afterNextRender(() => {
      const v = this.video()?.nativeElement;
      if (!v) return this.fechar(true);
      v.muted = true;
      v.play().catch(e => { console.warn('Abertura não tocou:', e?.name); this.fechar(true); });
      setTimeout(() => this.fechar(), 12000);
    });
  }

  @HostListener('document:keydown.escape')
  fechar(imediato = false): void {
    if (!this.visivel() || this.saindo()) return;
    try { sessionStorage.setItem(CHAVE, '1'); } catch {  }
    document.body.style.overflow = '';
    this.saindo.set(true);
    setTimeout(() => { this.visivel.set(false); this.terminou.emit(); }, imediato ? 0 : 700);
  }
}

function deveMostrar(): boolean {
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
    return sessionStorage.getItem(CHAVE) !== '1';
  } catch {
    return true;
  }
}
