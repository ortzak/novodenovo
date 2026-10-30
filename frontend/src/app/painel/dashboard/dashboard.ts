import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith } from 'rxjs';
import { dataHora, data, dinheiroCurto, NOME_CANAL } from '../core/formatos';
import { mensagemDeErro } from '../core/autenticacao';
import { Dashboard } from '../core/modelos';
import { PainelApi } from '../core/painel-api.service';

type Estado = { estado: 'carregando' } | { estado: 'ok'; d: Dashboard } | { estado: 'erro'; msg: string };

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <div class="p-pagina">
      <header class="p-topo">
        <div>
          <h1>{{ saudacao() }}{{ d()?.nomeUsuario ? ', ' + d()!.nomeUsuario : '' }}</h1>
          <p class="suave">{{ hoje }}</p>
        </div>
        <a class="btn btn-primario" routerLink="/painel/notebooks/novo">+ Novo notebook</a>
      </header>

      @switch (dados().estado) {
        @case ('carregando') { <div class="p-carregando">Carregando…</div> }
        @case ('erro') { <div class="p-aviso erro">{{ erroMsg() }}</div> }
        @default {
          @if (d(); as d) {
            <section class="indicadores">
              <a class="p-cartao indicador" routerLink="/painel/notebooks" [queryParams]="{ status: 'DISPONIVEL' }">
                <i class="verde"></i><span class="rotulo">Disponíveis</span>
                <strong>{{ d.disponiveis }}</strong>
                <span class="suave">na vitrine agora</span>
              </a>
              <a class="p-cartao indicador" routerLink="/painel/notebooks" [queryParams]="{ status: 'RESERVADO' }">
                <i class="azul"></i><span class="rotulo">Reservados</span>
                <strong>{{ d.reservados }}</strong>
                <span class="suave">{{ d.proximaReservaVence ? 'próxima vence ' + quando(d.proximaReservaVence) : 'nenhuma reserva' }}</span>
              </a>
              <a class="p-cartao indicador" routerLink="/painel/vendas">
                <i class="preto"></i><span class="rotulo">Vendidos no mês</span>
                <strong>{{ d.vendidosMes }}</strong>
                <span class="suave">{{ comparacao() }}</span>
              </a>
              <a class="p-cartao indicador" routerLink="/painel/vendas">
                <i class="amarelo"></i><span class="rotulo">Lucro do mês</span>
                <strong>{{ moeda(d.lucroMes) }}</strong>
                <span class="suave">faturamento {{ moeda(d.faturamentoMes) }}</span>
              </a>
            </section>

            <section class="meio">
              <div class="p-cartao grafico">
                <h2>Lucro por mês</h2>
                <div class="barras" role="img" [attr.aria-label]="descricaoGrafico()">
                  @for (m of barras(); track m.rotulo) {
                    <div class="coluna" [class.atual]="m.atual" [title]="m.vendas + (m.vendas === 1 ? ' venda' : ' vendas')">
                      <span class="valor">{{ moeda(m.lucro) }}</span>
                      <div class="barra" [style.height.%]="m.altura"></div>
                      <span class="mes">{{ m.rotulo }}</span>
                    </div>
                  }
                </div>
              </div>

              <div class="p-cartao atencao">
                <h2>Precisa de atenção</h2>
                @for (a of d.alertas; track $index) {
                  <a class="p-aviso" [class]="'p-aviso ' + a.nivel"
                     [routerLink]="a.idNotebook ? ['/painel/notebooks', a.idNotebook] : null">
                    <strong>{{ a.titulo }}</strong>
                    <span class="spec">{{ a.detalhe }}</span>
                  </a>
                } @empty {
                  <p class="suave tudo-certo">Tudo em dia por aqui.</p>
                }
                @if (d.emPreparacao) {
                  <a class="p-link" routerLink="/painel/notebooks" [queryParams]="{ status: 'EM_PREPARACAO' }">
                    {{ d.emPreparacao }} {{ d.emPreparacao === 1 ? 'notebook em preparação' : 'notebooks em preparação' }} →
                  </a>
                }
              </div>
            </section>

            <section class="p-cartao sem-borda-interna">
              <div class="titulo-tabela"><h2>Últimas vendas</h2><a class="p-link" routerLink="/painel/vendas">Ver todas →</a></div>
              @if (d.ultimasVendas.length) {
                <div class="p-tabela-rolagem">
                  <table class="p-tabela">
                    <thead><tr><th>Data</th><th>Código</th><th>Notebook</th><th>Cliente</th><th>Canal</th><th>Valor</th><th>Lucro</th></tr></thead>
                    <tbody>
                      @for (v of d.ultimasVendas; track v.id) {
                        <tr class="clicavel" [routerLink]="['/painel/notebooks', v.idNotebook]">
                          <td>{{ dia(v.dataVenda) }}</td>
                          <td class="num forte">{{ v.codigo }}</td>
                          <td>{{ v.notebook }}</td>
                          <td>{{ v.clienteNome }}</td>
                          <td>{{ canal[v.canal] }}</td>
                          <td class="num">{{ moeda(v.valorFinal) }}</td>
                          <td [class]="v.lucro >= 0 ? 'p-lucro' : 'p-prejuizo'">{{ v.lucro >= 0 ? '+ ' : '' }}{{ moeda(v.lucro) }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="p-vazio">Nenhuma venda registrada ainda.</div>
              }
            </section>
          }
        }
      }
    </div>
  `,
  styles: `
    .indicadores { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
    .indicador {
      display: flex; flex-direction: column; gap: 6px; text-decoration: none; transition: box-shadow .2s ease;
      &:hover { box-shadow: 0 8px 24px rgb(22 23 26 / .08); }
      i { width: 24px; height: 4px; border-radius: 2px; }
      strong { font: 700 30px/1.1 var(--fonte-titulo); }
      .suave { font-size: 13px; }
    }
    .verde { background: var(--sucesso); } .azul { background: var(--info); }
    .preto { background: var(--escuro); } .amarelo { background: var(--destaque); }
    .meio { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 16px; align-items: start; }
    .grafico h2, .atencao h2 { margin-bottom: 16px; }
    .barras { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: clamp(6px, 1.5vw, 14px); height: 210px; align-items: end; }
    .coluna {
      height: 100%; min-width: 0; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 6px;
      .valor { font-size: 11.5px; font-weight: 600; color: var(--texto-suave); white-space: nowrap; }
      @media (max-width: 600px) { .valor { font-size: 9.5px; letter-spacing: -.02em; } }
      .barra { width: 100%; min-height: 4px; border-radius: 6px 6px 2px 2px; background: var(--superficie); transition: height .6s ease; }
      .mes { font-family: var(--fonte-spec); font-size: 13px; color: var(--texto-suave); }
      &.atual .barra { background: var(--destaque); }
      &.atual .valor { color: var(--texto); }
    }
    .atencao { display: flex; flex-direction: column; gap: 10px; }
    .atencao .p-aviso { text-decoration: none; display: block; .spec { font-size: 12.5px; color: var(--texto-suave); } }
    .tudo-certo { padding: 16px 0; }
    .titulo-tabela { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; }
    @media (max-width: 1100px) {
      .indicadores { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .meio { grid-template-columns: 1fr; }
    }
  `,
})
export class DashboardPagina {
  private api = inject(PainelApi);

  readonly dados = toSignal(
    this.api.dashboard().pipe(
      map(d => ({ estado: 'ok', d }) as Estado),
      catchError(e => of({ estado: 'erro', msg: mensagemDeErro(e) } as Estado)),
      startWith({ estado: 'carregando' } as Estado),
    ),
    { initialValue: { estado: 'carregando' } as Estado },
  );
  readonly d = computed(() => { const x = this.dados(); return x.estado === 'ok' ? x.d : null; });
  readonly erroMsg = computed(() => { const x = this.dados(); return x.estado === 'erro' ? x.msg : ''; });

  readonly hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .replace(/^./, c => c.toUpperCase());
  readonly moeda = dinheiroCurto;
  readonly dia = data;
  readonly canal = NOME_CANAL;

  saudacao(): string {
    const h = new Date().getHours();
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  }

  readonly comparacao = computed(() => {
    const d = this.d();
    if (!d) return '';
    const dif = d.vendidosMes - d.vendidosMesAnterior;
    const mesPassado = MESES[(new Date().getMonth() + 11) % 12];
    return dif === 0 ? `igual a ${mesPassado}` : `${dif > 0 ? '+' : ''}${dif} vs. ${mesPassado}`;
  });

  readonly barras = computed(() => {
    const d = this.d();
    if (!d) return [];
    const maior = Math.max(1, ...d.meses.map(m => Math.max(m.lucro, 0)));
    return d.meses.map((m, i) => ({
      rotulo: MESES[Number(m.mes.slice(5, 7)) - 1],
      lucro: m.lucro,
      vendas: m.vendas,
      altura: Math.max(2, (Math.max(m.lucro, 0) / maior) * 82),
      atual: i === d.meses.length - 1,
    }));
  });

  readonly descricaoGrafico = computed(() =>
    this.barras().map(b => `${b.rotulo}: ${dinheiroCurto(b.lucro)}`).join(', '));

  quando(iso: string): string {
    return dataHora(iso);
  }
}
