import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotebookCard } from '../core/modelos';
import { linhaEstado, preco, processadorCurto } from '../core/textos';
import { FotoNotebook } from './foto-notebook';
import { SeloStatus } from './selo-status';

@Component({
  selector: 'app-card-notebook',
  imports: [RouterLink, FotoNotebook, SeloStatus],
  template: `
    <a class="card" [routerLink]="['/notebook', n().codigo]">
      <app-foto-notebook class="foto" [src]="n().fotoPrincipal" [alt]="n().marca + ' ' + n().modelo" />
      <div class="conteudo">
        <app-selo-status [status]="n().status" />
        <span class="rotulo">{{ n().marca }}</span>
        <h3>{{ n().modelo }}</h3>
        <div class="specs spec">
          <span [title]="n().processador">{{ cpu() }}</span>
          <span>{{ resto() }}</span>
        </div>
        <span class="suave estado">{{ estado() }}</span>
        @if (n().usos.length) {
          <ul class="usos" aria-label="Indicado para">
            @for (u of n().usos.slice(0, 3); track u) { <li>{{ u }}</li> }
          </ul>
        }
        <strong class="preco">{{ valor() }}</strong>
        <span class="btn btn-secundario btn-bloco">Ver detalhes</span>
      </div>
    </a>
  `,
  styles: `
    :host { display: block; }
    .card {
      display: flex; flex-direction: column; height: 100%;
      background: var(--branco); border: 1px solid var(--borda); border-radius: var(--raio);
      overflow: hidden; text-decoration: none; color: inherit;
      transition: transform .2s ease, box-shadow .2s ease;
      &:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgb(22 23 26 / .1); }
      &:focus-visible { outline: 3px solid var(--info); outline-offset: 3px; }
    }
    .foto { aspect-ratio: 306 / 210; }
    .conteudo { display: flex; flex-direction: column; gap: 8px; padding: 16px 20px 20px; flex: 1; }
    app-selo-status { margin-bottom: 4px; }
    .estado { font-size: 14px; }
    .specs {
      display: flex; flex-direction: column; font-size: 13px; line-height: 1.5;
      span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      span:first-child { color: var(--texto); font-weight: 600; }
      span:last-child { color: var(--texto-suave); }
    }
    .usos {
      list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px;
      li { padding: 3px 9px; border-radius: 999px; background: var(--superficie); font-size: 12px; font-weight: 600; }
    }
    .preco { font: 700 28px/36px var(--fonte-titulo); margin-top: auto; }
  `,
})
export class CardNotebook {
  readonly n = input.required<NotebookCard>();
  readonly cpu = computed(() => processadorCurto(this.n().processador));
  readonly resto = computed(() => {
    const n = this.n();
    const disco = n.tipoArmazenamento === 'HD' ? 'HD' : 'SSD';
    const gpu = n.placaVideo ? n.placaVideo.replace(/^NVIDIA (GeForce )?/, '') : null;
    return [`${n.memoriaRamGb} GB RAM`, `${n.armazenamentoGb >= 1000 ? n.armazenamentoGb / 1000 + ' TB' : n.armazenamentoGb + ' GB'} ${disco}`, gpu]
      .filter(Boolean).join(' · ');
  });
  readonly estado = computed(() => linhaEstado(this.n()));
  readonly valor = computed(() => preco(this.n().precoVenda));
}
