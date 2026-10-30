import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { linkWhatsapp, telefoneFormatado } from '../../core/textos';
import { VitrineService } from '../../core/vitrine.service';
import { IconeWhatsapp } from '../../shared/icone-whatsapp';

@Component({
  selector: 'app-como-comprar',
  imports: [RouterLink, IconeWhatsapp],
  template: `
    <section class="container topo">
      <p class="spec chamada">COMO COMPRAR</p>
      <h1>Sem loja física, sem complicação.</h1>
      <p class="suave">Você escolhe pelo site, tira as dúvidas no WhatsApp e combina como prefere ver o notebook.</p>
    </section>

    <section class="container">
      <ol class="passos">
        <li><strong>Escolha</strong><span>Veja a foto real e as peças por dentro de cada notebook.</span></li>
        <li><strong>Chame no WhatsApp</strong><span>A mensagem já vai com o código do notebook. Tire dúvidas e combine o valor.</span></li>
        <li><strong>Online ou no local</strong><span>Feche tudo pelo WhatsApp ou combine um atendimento no local para ver o notebook pessoalmente.</span></li>
        <li><strong>Pague com garantia</strong><span>Pix, cartão ou dinheiro, com {{ loja()?.garantiaPadraoDias ?? 90 }} dias de garantia em todos os notebooks.</span></li>
      </ol>
    </section>

    <section id="atendimento" class="container atendimento">
      <div class="formas">
        <article>
          <span class="spec etiqueta">ONLINE</span>
          <h3>Pelo WhatsApp</h3>
          <p class="suave">Fotos e vídeos extras do notebook, dúvidas, negociação e pagamento, sem sair de casa.</p>
        </article>
        <article>
          <span class="spec etiqueta">NO LOCAL</span>
          <h3>Atendimento presencial</h3>
          <p class="suave">Combinamos o local para você ver e testar o notebook antes de fechar{{ area() ? ' — ' + area() : '' }}.</p>
        </article>
      </div>

      <div class="cartao">
        @if (loja(); as l) {
          <dl>
            @if (l.areaAtendimento) { <div><dt class="rotulo">Região</dt><dd>{{ l.areaAtendimento }}</dd></div> }
            <div><dt class="rotulo">Horário</dt><dd>{{ l.horarioAtendimento }}</dd></div>
            <div><dt class="rotulo">WhatsApp</dt><dd>{{ telefone(l.whatsapp) }}</dd></div>
            @if (l.instagram) { <div><dt class="rotulo">Instagram</dt><dd>{{ l.instagram }}</dd></div> }
          </dl>
        } @else {
          <p class="suave">Carregando…</p>
        }
        <a class="btn btn-whatsapp btn-bloco" [href]="whatsapp()" target="_blank" rel="noopener">
          <app-icone-whatsapp /> Chamar no WhatsApp
        </a>
      </div>
    </section>

    <section class="container">
     <div class="faixa">
      <div>
        <h2>Precisa de conserto ou limpeza?</h2>
        <p>Também fazemos limpeza, manutenção, troca de peças e upgrade no seu notebook.</p>
      </div>
      <a class="btn btn-primario" routerLink="/servicos">Ver serviços</a>
     </div>
    </section>
  `,
  styles: `
    .topo { padding-top: 56px; padding-bottom: 32px; display: flex; flex-direction: column; gap: 12px; }
    .chamada { color: var(--destaque); }
    .passos {
      list-style: none; counter-reset: passo; margin: 0; padding: 0;
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;
      li {
        counter-increment: passo; display: flex; flex-direction: column; gap: 6px;
        padding: 20px; border-radius: var(--raio); background: var(--branco); border: 1px solid var(--borda);
        &::before { content: counter(passo); font: 700 28px var(--fonte-titulo); color: var(--destaque); }
        span { color: var(--texto-suave); font-size: 14px; }
      }
    }
    .atendimento {
      display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: stretch; padding-top: 48px; scroll-margin-top: 80px;
    }
    .formas {
      display: grid; grid-template-columns: 1fr; gap: 16px;
      article {
        display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 28px; border-radius: var(--raio);
        background: var(--escuro); color: var(--branco);
        .suave { color: var(--superficie); }
      }
    }
    .etiqueta { color: var(--destaque); font-size: 12px; }
    .cartao {
      display: flex; flex-direction: column; gap: 20px; padding: 24px;
      background: var(--branco); border: 1px solid var(--borda); border-radius: var(--raio);
      dl { margin: 0; display: flex; flex-direction: column; gap: 14px; }
      dd { margin: 4px 0 0; }
    }
    .faixa {
      display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap;
      margin-top: 48px; padding: 28px 32px;
      border-radius: var(--raio); background: var(--superficie);
      p { color: var(--texto-suave); }
    }
    @media (max-width: 900px) {
      .atendimento { grid-template-columns: 1fr; }
    }
  `,
})
export class ComoComprar {
  readonly loja = toSignal(inject(VitrineService).loja().pipe(catchError(() => of(undefined))));
  readonly whatsapp = computed(() => linkWhatsapp(this.loja()));
  readonly area = computed(() => this.loja()?.areaAtendimento ?? '');
  readonly telefone = telefoneFormatado;
}
