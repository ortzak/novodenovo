import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mensagemDeErro } from '../core/autenticacao';
import { data, dinheiro, hojeIso, NOME_CUSTO, TIPOS_CUSTO } from '../core/formatos';
import { Custo, TipoCusto } from '../core/modelos';
import { PainelApi } from '../core/painel-api.service';

@Component({
  selector: 'app-aba-custos',
  imports: [FormsModule],
  template: `
    <p class="suave texto">Gastos depois da compra: peças, reparos, upgrades e limpeza. Entram no custo total e no lucro. Nunca aparecem na vitrine.</p>

    @if (erro()) { <div class="p-aviso erro">{{ erro() }}</div> }

    @if (!travado()) {
      <form class="p-cartao novo" (ngSubmit)="adicionar()" #f="ngForm">
        <label class="p-campo"><span>Tipo</span>
          <select name="tipo" [(ngModel)]="tipo">
            @for (t of tipos; track t.valor) { <option [value]="t.valor">{{ t.rotulo }}</option> }
          </select></label>
        <label class="p-campo descricao"><span>Descrição</span>
          <input name="descricao" [(ngModel)]="descricao" required maxlength="150" placeholder="ex.: Teclado ABNT2 novo" /></label>
        <label class="p-campo"><span>Valor (R$)</span>
          <input name="valor" type="number" min="0.01" step="0.01" [(ngModel)]="valor" required /></label>
        <label class="p-campo"><span>Data</span><input name="data" type="date" [(ngModel)]="dataCusto" required /></label>
        <button type="submit" class="btn btn-primario btn-pequeno" [disabled]="salvando() || !f.valid">Adicionar</button>
      </form>
    } @else {
      <div class="p-aviso info">Notebook vendido: os custos ficam travados para não mudar o lucro já registrado.</div>
    }

    <section class="p-cartao sem-borda-interna">
      @if (custos().length) {
        <div class="p-tabela-rolagem">
          <table class="p-tabela">
            <thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th class="direita">Valor</th><th></th></tr></thead>
            <tbody>
              @for (c of custos(); track c.id) {
                <tr>
                  <td>{{ dia(c.dataCusto) }}</td>
                  <td>{{ nomeTipo[c.tipo] }}</td>
                  <td class="quebra">{{ c.descricao }}</td>
                  <td class="num direita">{{ moeda(c.valor) }}</td>
                  <td class="direita">@if (!travado()) { <button type="button" class="p-link vermelho" (click)="excluir(c)">Remover</button> }</td>
                </tr>
              }
            </tbody>
            <tfoot><tr><td colspan="3" class="forte">Total de custos adicionais</td><td class="num direita forte">{{ moeda(total()) }}</td><td></td></tr></tfoot>
          </table>
        </div>
      } @else {
        <div class="p-vazio">Nenhum custo adicional registrado.</div>
      }
    </section>
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 16px; }
    .texto { font-size: 14px; }
    .novo { display: grid; grid-template-columns: 150px minmax(0, 1fr) 130px 160px auto; gap: 12px; align-items: end; }
    tfoot td { padding: 14px 16px; border-top: 2px solid var(--superficie); }
    @media (max-width: 900px) { .novo { grid-template-columns: 1fr 1fr; .descricao { grid-column: 1 / -1; } } }
  `,
})
export class AbaCustos {
  readonly idNotebook = input.required<number>();
  readonly custos = input.required<Custo[]>();
  readonly travado = input(false);
  readonly mudou = output<Custo[]>();

  private api = inject(PainelApi);
  readonly tipos = TIPOS_CUSTO;
  readonly nomeTipo = NOME_CUSTO;
  readonly moeda = dinheiro;
  readonly dia = data;
  readonly salvando = signal(false);
  readonly erro = signal('');
  readonly total = computed(() => this.custos().reduce((s, c) => s + c.valor, 0));

  tipo: TipoCusto = 'PECA';
  descricao = '';
  valor: number | null = null;
  dataCusto = hojeIso();

  adicionar(): void {
    this.erro.set('');
    this.salvando.set(true);
    this.api.adicionarCusto(this.idNotebook(), {
      tipo: this.tipo, descricao: this.descricao, valor: Number(this.valor), dataCusto: this.dataCusto,
    }).subscribe({
      next: l => { this.salvando.set(false); this.descricao = ''; this.valor = null; this.mudou.emit(l); },
      error: e => { this.salvando.set(false); this.erro.set(mensagemDeErro(e)); },
    });
  }

  excluir(c: Custo): void {
    if (!confirm(`Remover o custo "${c.descricao}"?`)) return;
    this.api.excluirCusto(c.id).subscribe({ next: l => this.mudou.emit(l), error: e => this.erro.set(mensagemDeErro(e)) });
  }
}
