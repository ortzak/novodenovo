import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith } from 'rxjs';
import { Servico } from '../../core/modelos';
import { linkOrcamento, preco } from '../../core/textos';
import { VitrineService } from '../../core/vitrine.service';
import { IconeServico } from '../../shared/icone-servico';
import { IconeWhatsapp } from '../../shared/icone-whatsapp';

type Estado = { estado: 'carregando' } | { estado: 'ok'; itens: Servico[] } | { estado: 'erro' };

@Component({
  selector: 'app-servicos',
  imports: [RouterLink, IconeServico, IconeWhatsapp],
  template: `
    <section class="container topo">
      <p class="spec chamada">SERVIÇOS TÉCNICOS</p>
      <h1>Deixe o seu notebook novo de novo.</h1>
      <p class="suave">
        Os mesmos cuidados que damos aos notebooks da vitrine, agora no seu.
        Atendimento online pelo WhatsApp ou no local combinado{{ area() ? ', em ' + area() : '' }}.
      </p>
    </section>

    <section class="container">
      @switch (dados().estado) {
        @case ('carregando') {
          <div class="grade">@for (i of [1, 2, 3]; track i) { <div class="esqueleto"></div> }</div>
        }
        @case ('erro') {
          <div class="aviso">
            <strong>Não foi possível carregar a lista de serviços agora.</strong>
            <p>Chame no WhatsApp e conte o que o seu notebook precisa.</p>
            <a class="btn btn-whatsapp" [href]="orcamento()" target="_blank" rel="noopener"><app-icone-whatsapp /> Pedir orçamento</a>
          </div>
        }
        @default {
          <div class="grade">
            @for (s of itens(); track s.nome) {
              <article class="servico">
                <span class="icone"><app-icone-servico [nome]="s.nome" /></span>
                <h3>{{ s.nome }}</h3>
                <p class="suave">{{ s.descricao }}</p>
                <div class="rodape-card">
                  <span class="spec valor">{{ s.precoAPartir != null ? 'a partir de ' + valor(s.precoAPartir) : 'sob orçamento' }}</span>
                  @if (s.prazo) { <span class="spec prazo">{{ s.prazo }}</span> }
                </div>
                <a class="btn btn-secundario btn-bloco" [href]="orcamentoDe(s)" target="_blank" rel="noopener">
                  <app-icone-whatsapp /> Pedir orçamento
                </a>
              </article>
            }
          </div>
        }
      }
    </section>

    <section class="container como">
      <h2>Como funciona</h2>
      <ol>
        <li><strong>Conte o problema</strong><span>Chame no WhatsApp. Fotos ou um vídeo curto ajudam no diagnóstico.</span></li>
        <li><strong>Receba o orçamento</strong><span>Explicamos o que precisa ser feito e quanto custa, sem compromisso.</span></li>
        <li><strong>Online ou no local</strong><span>Resolvemos à distância quando dá; senão, combinamos o atendimento no local.</span></li>
        <li><strong>Você aprova antes</strong><span>Nenhuma peça é trocada sem a sua confirmação.</span></li>
      </ol>
      <div class="cta">
        <a class="btn btn-whatsapp" [href]="orcamento()" target="_blank" rel="noopener"><app-icone-whatsapp /> Chamar no WhatsApp</a>
        <a class="btn btn-secundario" routerLink="/">Ver notebooks à venda</a>
      </div>
    </section>
  `,
  styles: `
    .topo { padding-top: 56px; padding-bottom: 32px; display: flex; flex-direction: column; gap: 12px; p { max-width: 62ch; } }
    .chamada { color: var(--destaque); }
    .grade { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    @media (max-width: 1000px) { .grade { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .grade { grid-template-columns: 1fr; } }
    .servico {
      display: flex; flex-direction: column; gap: 10px; padding: 24px;
      background: var(--branco); border: 1px solid var(--borda); border-radius: var(--raio);
      p { font-size: 15px; flex: 1; }
      .btn { margin-top: 6px; }
    }
    .icone {
      width: 52px; height: 52px; border-radius: 12px; display: grid; place-items: center;
      background: var(--escuro); color: var(--destaque); margin-bottom: 4px;
    }
    .rodape-card { display: flex; flex-wrap: wrap; gap: 8px; }
    .valor, .prazo { font-size: 12.5px; padding: 4px 10px; border-radius: 999px; }
    .valor { background: var(--superficie); color: var(--texto); }
    .prazo { background: var(--sucesso-claro); color: var(--sucesso); }
    .esqueleto { height: 300px; border-radius: var(--raio); background: var(--superficie); }
    .aviso { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; padding: 24px; border-radius: var(--raio); background: var(--superficie); }
    .como { padding-top: 64px; }
    ol {
      list-style: none; counter-reset: passo; margin: 24px 0 0; padding: 0;
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;
      li {
        counter-increment: passo; display: flex; flex-direction: column; gap: 6px;
        padding: 20px; border-radius: var(--raio); background: var(--branco); border: 1px solid var(--borda);
        &::before { content: counter(passo); font: 700 28px var(--fonte-titulo); color: var(--destaque); }
        span { color: var(--texto-suave); font-size: 14px; }
      }
    }
    .cta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
  `,
})
export class Servicos {
  private vitrine = inject(VitrineService);
  private loja = toSignal(this.vitrine.loja().pipe(catchError(() => of(undefined))));

  readonly dados = toSignal(
    this.vitrine.servicos().pipe(
      map(itens => ({ estado: 'ok', itens }) as Estado),
      catchError(() => of({ estado: 'erro' } as Estado)),
      startWith({ estado: 'carregando' } as Estado),
    ),
    { initialValue: { estado: 'carregando' } as Estado },
  );
  readonly itens = computed(() => { const d = this.dados(); return d.estado === 'ok' ? d.itens : []; });
  readonly area = computed(() => this.loja()?.areaAtendimento ?? '');
  readonly orcamento = computed(() => linkOrcamento(this.loja()));
  readonly valor = preco;

  orcamentoDe(s: Servico): string {
    return linkOrcamento(this.loja(), s);
  }
}
