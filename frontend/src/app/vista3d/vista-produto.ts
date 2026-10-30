import {
  Component, ElementRef, computed, inject, input, signal, afterNextRender, DestroyRef, viewChild,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Componente, TipoComponente } from '../core/modelos';
import { FotoNotebook } from '../shared/foto-notebook';
import {
  ALTURA, ANCORA, LARGURA, ORDEM_DESENHO, Y_EXPLODIDO, Y_MONTADO, svgDaPeca,
} from './pecas-3d';

const PALCO_L = 800;
const PALCO_A = 900;

interface PecaNaTela {
  componente: Componente;
  url: SafeUrl;
  montado: string;
  explodido: string;
  ordem: number;
}

interface Legenda {
  componente: Componente;
  numero: number;
  ponto: { x: number; y: number };
  marcador: { x: number; y: number };
}

const RAIO = 11;
const DIST_MIN = RAIO * 2 + 4;

const RECORTE = { x: 44, y: 118, l: 400, a: 768 };

@Component({
  selector: 'app-vista-produto',
  imports: [FotoNotebook],
  templateUrl: './vista-produto.html',
  styleUrl: './vista-produto.scss',
})
export class VistaProduto {
  readonly fotos = input<string[]>([]);
  readonly componentes = input<Componente[]>([]);
  readonly titulo = input('');

  readonly aberto = signal(false);
  readonly fotoAtual = signal(0);
  readonly destaque = signal<TipoComponente | null>(null);
  readonly escala = signal(1);

  readonly largura = PALCO_L;
  readonly altura = PALCO_A;

  private sanitizer = inject(DomSanitizer);
  private host = inject(ElementRef<HTMLElement>);
  private palco = viewChild<ElementRef<HTMLElement>>('palco');

  readonly compacto = computed(() => this.escala() < 0.72);

  readonly temPecas = computed(() => this.componentes().length > 0);

  readonly pecas = computed<PecaNaTela[]>(() => {
    const k = 1.4;
    return [...this.componentes()]
      .sort((a, b) => ORDEM_DESENHO.indexOf(a.tipo) - ORDEM_DESENHO.indexOf(b.tipo))
      .map((c, i) => {
        const svg = svgDaPeca(c.tipo, c.quantidade);
        const url = this.sanitizer.bypassSecurityTrustUrl('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
        return {
          componente: c,
          url,
          ordem: i,
          montado: `translate(134px, ${180 + Y_MONTADO[c.tipo] * k}px) scale(${k})`,
          explodido: `translate(40px, ${Y_EXPLODIDO[c.tipo]}px) scale(1)`,
        };
      });
  });

  readonly legendas = computed<Legenda[]>(() => {
    const itens = this.componentes().map(c => {
      const [ax, ay] = ANCORA[c.tipo];
      return { c, x: 40 + ax, y: Y_EXPLODIDO[c.tipo] + ay };
    }).sort((a, b) => a.y - b.y || a.x - b.x);

    const marcas = itens.map(it => ({ x: it.x, y: it.y }));
    for (let volta = 0; volta < 60; volta++) {
      let mexeu = false;
      for (let i = 0; i < marcas.length; i++) {
        for (let j = i + 1; j < marcas.length; j++) {
          const dx = marcas[j].x - marcas[i].x, dy = marcas[j].y - marcas[i].y;
          const d = Math.hypot(dx, dy);
          if (d >= DIST_MIN) continue;
          const ux = d > 0.01 ? dx / d : 1, uy = d > 0.01 ? dy / d : 0;
          const empurra = (DIST_MIN - d) / 2 + 0.5;
          marcas[i].x -= ux * empurra; marcas[i].y -= uy * empurra;
          marcas[j].x += ux * empurra; marcas[j].y += uy * empurra;
          mexeu = true;
        }
      }
      if (!mexeu) break;
    }

    return itens.map((it, i) => ({ componente: it.c, numero: i + 1, ponto: { x: it.x, y: it.y }, marcador: marcas[i] }));
  });

  readonly alturaLegendas = computed(() => Math.min(760, this.legendas().length * 82));

  readonly escalaCompacta = computed(() => Math.min(this.escala() * PALCO_L / RECORTE.l, 1.3));
  readonly recorte = RECORTE;

  readonly transformDesenho = computed(() => this.compacto()
    ? `scale(${this.escalaCompacta()}) translate(${-RECORTE.x}px, ${-RECORTE.y}px)`
    : `scale(${this.escala()})`);

  realcar(c: Componente | null): void {
    if (c && !this.aberto()) return;
    this.destaque.set(c ? c.tipo : null);
  }

  apagada(c: Componente): boolean {
    const d = this.destaque();
    return !!d && d !== c.tipo;
  }

  movido(l: Legenda): boolean {
    return Math.hypot(l.marcador.x - l.ponto.x, l.marcador.y - l.ponto.y) > 2;
  }

  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement as HTMLElement;
      const obs = new ResizeObserver(() => {
        const w = this.palco()?.nativeElement.clientWidth ?? el.clientWidth;
        this.escala.set(Math.min(w / PALCO_L, 1.2));
      });
      obs.observe(el);
      this.destroyRef.onDestroy(() => obs.disconnect());
    });
  }

  alternar(): void {
    this.aberto.set(!this.aberto());
    this.destaque.set(null);
  }

  atraso(p: PecaNaTela): string {
    const n = this.pecas().length;
    return `${(this.aberto() ? p.ordem : n - p.ordem) * 40}ms`;
  }

  quantidade(c: Componente): string {
    return c.quantidade > 1 ? ` (${c.quantidade}x)` : '';
  }

  readonly LARGURA_PECA = LARGURA;
  readonly ALTURA_PECA = ALTURA;
}
