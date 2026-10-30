import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mensagemDeErro } from '../core/autenticacao';
import { data, telefone } from '../core/formatos';
import { Garantia } from '../core/modelos';
import { PainelApi } from '../core/painel-api.service';

type Filtro = 'ATIVAS' | 'VENCE_EM_BREVE' | 'VENCIDA' | 'TODAS';

@Component({
  selector: 'app-garantias',
  imports: [RouterLink],
  template: `
    <div class="p-pagina">
      <header class="p-topo">
        <div>
          <h1>Garantias</h1>
          <p class="suave">Criadas automaticamente a cada venda. Fale com o cliente direto pelo WhatsApp.</p>
        </div>
      </header>

      <div class="p-chips">
        @for (f of filtros; track f.valor) {
          <button type="button" class="p-chip" [class.ativo]="filtro() === f.valor" (click)="filtro.set(f.valor)">
            {{ f.rotulo }} ({{ contar(f.valor) }})</button>
        }
      </div>

      @if (erro()) { <div class="p-aviso erro">{{ erro() }}</div> }

      <section class="p-cartao sem-borda-interna">
        @if (carregando()) {
          <div class="p-carregando">Carregando…</div>
        } @else if (visiveis().length) {
          <div class="p-tabela-rolagem">
            <table class="p-tabela">
              <thead><tr><th>Situação</th><th>Código</th><th>Notebook</th><th>Cliente</th><th>Início</th><th>Fim</th><th>Restam</th><th></th></tr></thead>
              <tbody>
                @for (g of visiveis(); track g.id) {
                  <tr>
                    <td><span class="situacao" [class]="'situacao ' + g.situacao.toLowerCase()">{{ nome(g) }}</span></td>
                    <td class="num forte"><a [routerLink]="['/painel/notebooks', g.idNotebook]">{{ g.codigo }}</a></td>
                    <td>{{ g.notebook }}</td>
                    <td>{{ g.clienteNome }}<span class="tel">{{ fone(g.clienteTelefone) }}</span></td>
                    <td>{{ dia(g.dataInicio) }}</td>
                    <td>{{ dia(g.dataFim) }}</td>
                    <td class="num">{{ g.situacao === 'VENCIDA' ? '—' : g.diasRestantes + (g.diasRestantes === 1 ? ' dia' : ' dias') }}</td>
                    <td><a class="p-link verde" [href]="whatsapp(g)" target="_blank" rel="noopener">WhatsApp</a></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="p-vazio">Nenhuma garantia {{ filtro() === 'TODAS' ? 'registrada ainda' : 'neste filtro' }}.</div>
        }
      </section>
    </div>
  `,
  styles: `
    .tel { display: block; font-size: 12px; color: var(--texto-suave); }
    a { color: inherit; }
    .situacao { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap; }
    .ativa { background: var(--sucesso-claro); color: var(--sucesso); }
    .vence_em_breve { background: var(--destaque-claro); color: #6B4A00; }
    .vencida { background: var(--superficie); color: var(--texto-suave); }
  `,
})
export class Garantias {
  private api = inject(PainelApi);
  readonly dia = data;
  readonly fone = telefone;
  readonly filtros: { valor: Filtro; rotulo: string }[] = [
    { valor: 'ATIVAS', rotulo: 'Ativas' }, { valor: 'VENCE_EM_BREVE', rotulo: 'Vencem em 7 dias' },
    { valor: 'VENCIDA', rotulo: 'Vencidas' }, { valor: 'TODAS', rotulo: 'Todas' },
  ];

  readonly lista = signal<Garantia[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal('');
  readonly filtro = signal<Filtro>('ATIVAS');
  readonly visiveis = computed(() => this.lista().filter(g => this.passa(g, this.filtro())));

  constructor() {
    this.api.garantias().subscribe({
      next: l => { this.lista.set(l); this.carregando.set(false); },
      error: e => { this.erro.set(mensagemDeErro(e)); this.carregando.set(false); },
    });
  }

  contar(f: Filtro): number {
    return this.lista().filter(g => this.passa(g, f)).length;
  }

  nome(g: Garantia): string {
    return g.situacao === 'VENCIDA' ? 'Vencida' : g.situacao === 'VENCE_EM_BREVE' ? 'Vence em breve' : 'Ativa';
  }

  whatsapp(g: Garantia): string {
    const texto = `Olá, ${g.clienteNome.split(' ')[0]}! Aqui é da NovoDeNovo, sobre o seu ${g.notebook} (${g.codigo}).`;
    return `https://wa.me/${g.clienteTelefone}?text=${encodeURIComponent(texto)}`;
  }

  private passa(g: Garantia, f: Filtro): boolean {
    return f === 'TODAS' || (f === 'ATIVAS' ? g.situacao !== 'VENCIDA' : g.situacao === f);
  }
}
