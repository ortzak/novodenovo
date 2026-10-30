import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mensagemDeErro } from '../core/autenticacao';
import { data, dinheiro, NOME_CANAL, NOME_PAGAMENTO, telefone } from '../core/formatos';
import { Venda } from '../core/modelos';
import { PainelApi } from '../core/painel-api.service';

@Component({
  selector: 'app-vendas',
  imports: [RouterLink],
  template: `
    <div class="p-pagina">
      <header class="p-topo">
        <div>
          <h1>Vendas</h1>
          <p class="suave">Lucro = valor final − (valor de compra + custos adicionais).</p>
        </div>
        <label class="p-campo periodo"><span>Período</span>
          <select [value]="periodo()" (change)="periodo.set($any($event.target).value)">
            <option value="">Todas</option>
            @for (m of meses(); track m.valor) { <option [value]="m.valor">{{ m.rotulo }}</option> }
          </select></label>
      </header>

      @if (erro()) { <div class="p-aviso erro">{{ erro() }}</div> }

      <section class="totais">
        <div class="p-cartao"><span class="rotulo">Vendas</span><strong>{{ filtradas().length }}</strong></div>
        <div class="p-cartao"><span class="rotulo">Faturamento</span><strong>{{ moeda(faturamento()) }}</strong></div>
        <div class="p-cartao"><span class="rotulo">Lucro</span><strong [class.negativo]="lucro() < 0">{{ moeda(lucro()) }}</strong></div>
        <div class="p-cartao"><span class="rotulo">Margem média</span><strong>{{ margem() }}</strong></div>
      </section>

      <section class="p-cartao sem-borda-interna">
        @if (carregando()) {
          <div class="p-carregando">Carregando…</div>
        } @else if (filtradas().length) {
          <div class="p-tabela-rolagem">
            <table class="p-tabela">
              <thead><tr><th>Data</th><th>Código</th><th>Notebook</th><th>Cliente</th><th>Pagamento</th><th>Canal</th>
                <th class="direita">Valor</th><th class="direita">Custo</th><th class="direita">Lucro</th><th></th></tr></thead>
              <tbody>
                @for (v of filtradas(); track v.id) {
                  <tr>
                    <td>{{ dia(v.dataVenda) }}</td>
                    <td class="num forte"><a [routerLink]="['/painel/notebooks', v.idNotebook]">{{ v.codigo }}</a></td>
                    <td>{{ v.notebook }}</td>
                    <td>{{ v.clienteNome }}<span class="tel">{{ fone(v.clienteTelefone) }}</span></td>
                    <td>{{ pagamento[v.formaPagamento] }}{{ v.parcelas > 1 ? ' ' + v.parcelas + 'x' : '' }}</td>
                    <td>{{ canal[v.canal] }}</td>
                    <td class="num direita">{{ moeda(v.valorFinal) }}</td>
                    <td class="num direita">{{ moeda(v.custoTotal) }}</td>
                    <td class="direita" [class]="v.lucro >= 0 ? 'p-lucro direita' : 'p-prejuizo direita'">{{ moeda(v.lucro) }}</td>
                    <td><button type="button" class="p-link vermelho" (click)="desfazer(v)">Desfazer</button></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="p-vazio">Nenhuma venda {{ periodo() ? 'neste período' : 'registrada ainda' }}.</div>
        }
      </section>
    </div>
  `,
  styles: `
    .periodo { min-width: 200px; }
    .totais { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px;
      .p-cartao { display: flex; flex-direction: column; gap: 4px; }
      strong { font: 700 24px var(--fonte-titulo); }
      strong.negativo { color: var(--erro); } }
    .tel { display: block; font-size: 12px; color: var(--texto-suave); }
    a { color: inherit; }
    @media (max-width: 900px) { .totais { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  `,
})
export class Vendas {
  private api = inject(PainelApi);
  readonly moeda = dinheiro;
  readonly dia = data;
  readonly fone = telefone;
  readonly canal = NOME_CANAL;
  readonly pagamento = NOME_PAGAMENTO;

  readonly lista = signal<Venda[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal('');
  readonly periodo = signal('');

  readonly meses = computed(() => {
    const vistos = new Set(this.lista().map(v => v.dataVenda.slice(0, 7)));
    vistos.add(new Date().toISOString().slice(0, 7));
    return [...vistos].sort().reverse().map(m => ({
      valor: m,
      rotulo: new Date(m + '-15T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^./, c => c.toUpperCase()),
    }));
  });
  readonly filtradas = computed(() => this.lista().filter(v => !this.periodo() || v.dataVenda.startsWith(this.periodo())));
  readonly faturamento = computed(() => this.filtradas().reduce((s, v) => s + v.valorFinal, 0));
  readonly lucro = computed(() => this.filtradas().reduce((s, v) => s + v.lucro, 0));
  readonly margem = computed(() => this.faturamento() ? `${Math.round((this.lucro() / this.faturamento()) * 100)}%` : '—');

  constructor() {
    this.carregar();
  }

  desfazer(v: Venda): void {
    if (!confirm(`Desfazer a venda do ${v.codigo} para ${v.clienteNome}? O notebook volta para Disponível e a garantia é apagada.`)) return;
    this.api.desfazerVenda(v.id).subscribe({ next: () => this.carregar(), error: e => this.erro.set(mensagemDeErro(e)) });
  }

  private carregar(): void {
    this.api.vendas().subscribe({
      next: l => { this.lista.set(l); this.carregando.set(false); },
      error: e => { this.erro.set(mensagemDeErro(e)); this.carregando.set(false); },
    });
  }
}
