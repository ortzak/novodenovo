import { Component, inject, input, output, signal } from '@angular/core';
import { FotoNotebook } from '../../shared/foto-notebook';
import { mensagemDeErro } from '../core/autenticacao';
import { Foto } from '../core/modelos';
import { PainelApi } from '../core/painel-api.service';

const MAX_FOTOS = 8;
const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-aba-fotos',
  imports: [FotoNotebook],
  template: `
    <div class="p-cartao conteudo">
      <div class="cabeca">
        <p class="suave">Fotos reais do aparelho (até {{ max }}). A principal aparece no catálogo e é a primeira na página do notebook.</p>
        <label class="btn btn-secundario btn-pequeno" [class.desligado]="enviando() || fotos().length >= max">
          {{ enviando() ? 'Enviando…' : '+ Adicionar fotos' }}
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden
                 [disabled]="enviando() || fotos().length >= max" (change)="escolher($event)" />
        </label>
      </div>

      @if (erro()) { <div class="p-aviso erro">{{ erro() }}</div> }

      <div class="area" [class.sobre]="arrastando()"
           (dragover)="$event.preventDefault(); arrastando.set(true)" (dragleave)="arrastando.set(false)"
           (drop)="soltar($event)">
        @for (f of fotos(); track f.id) {
          <figure>
            <app-foto-notebook [src]="f.url" [alt]="'Foto ' + f.ordem" />
            @if (f.principal) { <span class="principal">Principal</span> }
            <figcaption>
              @if (!f.principal) { <button type="button" class="p-link" (click)="principal(f)">Tornar principal</button> }
              <button type="button" class="p-link vermelho" (click)="excluir(f)">Excluir</button>
            </figcaption>
          </figure>
        }
        @if (fotos().length < max) {
          <label class="soltar">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Arraste fotos aqui ou clique para escolher</span>
            <span class="ajuda">JPG, PNG ou WebP · até 8 MB cada</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden (change)="escolher($event)" />
          </label>
        }
      </div>
    </div>
  `,
  styles: `
    .conteudo { display: flex; flex-direction: column; gap: 16px; }
    .cabeca { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; .suave { font-size: 14px; max-width: 60ch; } }
    .desligado { opacity: .5; pointer-events: none; }
    .area {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;
      border-radius: 12px; transition: background-color .15s ease;
      &.sobre { background: var(--destaque-claro); }
    }
    figure { margin: 0; position: relative; display: flex; flex-direction: column; gap: 8px; }
    figure app-foto-notebook { aspect-ratio: 4 / 3; border-radius: 10px; overflow: hidden; border: 1px solid var(--borda); }
    figcaption { display: flex; gap: 14px; }
    .principal {
      position: absolute; top: 8px; left: 8px; padding: 3px 10px; border-radius: 999px;
      background: var(--destaque); font-size: 12px; font-weight: 700;
    }
    .soltar {
      aspect-ratio: 4 / 3; border: 2px dashed var(--borda); border-radius: 10px; cursor: pointer;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; text-align: center; padding: 12px;
      color: var(--texto-suave); font-size: 14px;
      &:hover { border-color: var(--destaque); color: var(--texto); }
      .ajuda { font-size: 12px; }
    }
  `,
})
export class AbaFotos {
  readonly idNotebook = input.required<number>();
  readonly fotos = input.required<Foto[]>();
  readonly mudou = output<Foto[]>();

  private api = inject(PainelApi);
  readonly max = MAX_FOTOS;
  readonly enviando = signal(false);
  readonly arrastando = signal(false);
  readonly erro = signal('');

  escolher(ev: Event): void {
    const campo = ev.target as HTMLInputElement;
    this.enviar(Array.from(campo.files ?? []));
    campo.value = '';
  }

  soltar(ev: DragEvent): void {
    ev.preventDefault();
    this.arrastando.set(false);
    this.enviar(Array.from(ev.dataTransfer?.files ?? []));
  }

  principal(f: Foto): void {
    this.api.fotoPrincipal(f.id).subscribe({ next: l => this.mudou.emit(l), error: e => this.erro.set(mensagemDeErro(e)) });
  }

  excluir(f: Foto): void {
    if (!confirm('Excluir esta foto?')) return;
    this.api.excluirFoto(f.id).subscribe({ next: l => this.mudou.emit(l), error: e => this.erro.set(mensagemDeErro(e)) });
  }

  private enviar(arquivos: File[]): void {
    this.erro.set('');
    if (!arquivos.length) return;
    if (arquivos.some(a => !TIPOS.includes(a.type))) { this.erro.set('Envie fotos em JPG, PNG ou WebP.'); return; }
    if (arquivos.some(a => a.size > 8 * 1024 * 1024)) { this.erro.set('Cada foto pode ter até 8 MB.'); return; }
    if (this.fotos().length + arquivos.length > MAX_FOTOS) { this.erro.set(`Cada notebook pode ter até ${MAX_FOTOS} fotos.`); return; }
    this.enviando.set(true);
    this.api.enviarFotos(this.idNotebook(), arquivos).subscribe({
      next: l => { this.enviando.set(false); this.mudou.emit(l); },
      error: e => { this.enviando.set(false); this.erro.set(mensagemDeErro(e)); },
    });
  }
}
