import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { VitrineService } from '../core/vitrine.service';
import { telefoneFormatado } from '../core/textos';

@Component({
  selector: 'app-rodape',
  imports: [RouterLink],
  template: `
    <footer>
      <div class="container colunas">
        @if (loja(); as l) {
          <div><span class="rotulo">Atendimento</span><p>Online ou no local{{ l.areaAtendimento ? ' · ' + l.areaAtendimento : '' }}</p></div>
          <div><span class="rotulo">Horário</span><p>{{ l.horarioAtendimento }}</p></div>
          <div><span class="rotulo">Contato</span><p>{{ telefone(l.whatsapp) }}{{ l.instagram ? ' · ' + l.instagram : '' }}</p></div>
        }
        <div><span class="rotulo">Serviços</span><p><a routerLink="/servicos">Limpeza, manutenção e troca de peças</a></p></div>
        <div class="assinatura"><span class="rotulo">NovoDeNovo</span><p>Garantia de {{ loja()?.garantiaPadraoDias ?? 90 }} dias em todos os notebooks.</p><p class="revendedor"><a routerLink="/painel">Área do revendedor</a></p></div>
      </div>
    </footer>
  `,
  styles: `
    footer { background: var(--escuro); color: var(--branco); padding: 40px 0; margin-top: 72px; }
    .colunas { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 24px 40px; }
    .rotulo { color: var(--destaque); display: block; margin-bottom: 6px; }
    p { font-size: 14px; }
    .revendedor { margin-top: 8px; font-size: 12.5px; opacity: .7; }
    a { color: inherit; text-underline-offset: 3px; &:hover { color: var(--destaque); } }
  `,
})
export class Rodape {
  readonly loja = toSignal(inject(VitrineService).loja().pipe(catchError(() => of(undefined))));
  readonly telefone = telefoneFormatado;
}
