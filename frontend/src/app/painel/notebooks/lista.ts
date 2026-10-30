import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Status } from '../../core/modelos';
import { ESTADO, STATUS } from '../../core/textos';
import { FotoNotebook } from '../../shared/foto-notebook';
import { SeloStatus } from '../../shared/selo-status';
import { mensagemDeErro } from '../core/autenticacao';
import { dinheiroCurto } from '../core/formatos';
import { NotebookResumo } from '../core/modelos';
import { PainelApi } from '../core/painel-api.service';
import { VendaModal } from '../vendas/venda-modal';

const FILTROS: (Status | 'TODOS')[] = ['TODOS', 'EM_PREPARACAO', 'DISPONIVEL', 'RESERVADO', 'VENDIDO'];

@Component({
  selector: 'app-lista-notebooks',
  imports: [RouterLink, SeloStatus, FotoNotebook, VendaModal],
  template: `
    <div class="p-pagina">
      <header class="p-topo">
        <div>
          <h1>Notebooks</h1>
          <p class="suave">Cada linha é uma unidade física, com número de série próprio.</p>
        </div>
        <a class="btn btn-primario" routerLink="/painel/notebooks/novo">+ Novo notebook</a>
      </header>

      <div class="barra">
        <div class="p-chips" role="group" aria-label="Filtrar por status">
          @for (f of filtros; track f) {
            <button type="button" class="p-chip" [class.ativo]="filtro() === f" (click)="filtrar(f)">
              {{ f === 'TODOS' ? 'Todos' : nomeStatus[f] }} ({{ contagem()[f] }})
            </button>
          }
        </div>
        <input class="busca" type="search" placeholder="Buscar código, marca ou modelo" [value]="busca()"
               (input)="busca.set($any($event.target).value)" aria-label="Buscar notebook" />
      </div>

      @if (erro()) { <div class="p-aviso erro">{{ erro() }}</div> }

      <section class="p-cartao sem-borda-interna">
        @if (carregando()) {
          <div class="p-carregando">Carregando…</div>
        } @else if (visiveis().length) {
          <div class="p-tabela-rolagem">
            <table class="p-tabela">
              <thead>
                <tr><th></th><th>Código</th><th>Notebook</th><th>Estado</th><th>Custo total</th><th>Preço</th>
                  <th>Lucro prev.</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                @for (n of visiveis(); track n.id) {
                  <tr>
                    <td class="mini"><app-foto-notebook class="miniaturas" [src]="n.fotoPrincipal" [alt]="''" /></td>
                    <td class="num">{{ n.codigo }}</td>
                    <td class="quebra nome-col"><a class="nome" [routerLink]="['/painel/notebooks', n.id]">{{ n.marca }} {{ n.modelo }}</a>
                      <span class="pecas">{{ n.componentes }} {{ n.componentes === 1 ? 'peça' : 'peças' }} na vista 3D</span></td>
                    <td>{{ nomeEstado[n.estado] }}</td>
                    <td class="num">{{ moeda(n.custoTotal) }}</td>
                    <td class="num">{{ moeda(n.precoVenda) }}</td>
                    <td [class]="n.lucroPrevisto >= 0 ? 'p-lucro' : 'p-prejuizo'">{{ moeda(n.lucroPrevisto) }}</td>
                    <td><app-selo-status [status]="n.status" /></td>
                    <td>
                      <div class="p-acoes">
                        @if (n.status === 'VENDIDO') {
                          <a class="p-link" [routerLink]="['/painel/notebooks', n.id]">Ver venda</a>
                        } @else {
                          <button type="button" class="p-link verde" [disabled]="n.status === 'EM_PREPARACAO'"
                                  [title]="n.status === 'EM_PREPARACAO' ? 'Deixe disponível antes de vender' : ''"
                                  (click)="vendendo.set(n)">Registrar venda</button>
                          <a class="p-link" [routerLink]="['/painel/notebooks', n.id]">Editar</a>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="p-vazio">
            @if (lista().length) { Nenhum notebook com esse filtro. }
            @else {
              <span>Nenhum notebook cadastrado ainda.</span>
              <a class="btn btn-primario btn-pequeno" routerLink="/painel/notebooks/novo">Cadastrar o primeiro</a>
            }
          </div>
        }
      </section>
    </div>

    @if (vendendo(); as n) {
      <app-venda-modal [idNotebook]="n.id" [titulo]="n.codigo + ' · ' + n.marca + ' ' + n.modelo"
                       [precoVenda]="n.precoVenda" [custoTotal]="n.custoTotal"
                       (fechar)="vendendo.set(null)" (vendido)="aoVender()" />
    }
  `,
  styles: `
    .barra { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; align-items: center; }
    .busca {
      width: min(320px, 100%); padding: 9px 14px; border: 1px solid var(--borda); border-radius: 999px;
      font: 400 14px var(--fonte-texto); background: var(--branco);
      &:focus { outline: 2px solid var(--info); border-color: transparent; }
    }
    .mini { width: 72px; padding-right: 0; }
    .mini app-foto-notebook { width: 56px; height: 40px; border-radius: 6px; overflow: hidden; }
    .nome { font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } }
    .pecas { display: block; font-size: 12px; color: var(--texto-suave); white-space: nowrap; }
    .nome-col { min-width: 170px; }
  `,
})
export class ListaNotebooks {
  readonly status = input<string>();
  private api = inject(PainelApi);
  private router = inject(Router);

  readonly filtros = FILTROS;
  readonly nomeStatus = STATUS;
  readonly nomeEstado = ESTADO;
  readonly moeda = dinheiroCurto;

  readonly lista = signal<NotebookResumo[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal('');
  readonly busca = signal('');
  readonly vendendo = signal<NotebookResumo | null>(null);

  readonly filtro = computed<Status | 'TODOS'>(() => {
    const s = this.status() as Status | undefined;
    return s && FILTROS.includes(s) ? s : 'TODOS';
  });

  readonly contagem = computed(() => {
    const c: Record<string, number> = { TODOS: this.lista().length };
    for (const f of FILTROS.slice(1)) c[f] = this.lista().filter(n => n.status === f).length;
    return c;
  });

  readonly visiveis = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    return this.lista()
      .filter(n => this.filtro() === 'TODOS' || n.status === this.filtro())
      .filter(n => !termo || `${n.codigo} ${n.marca} ${n.modelo}`.toLowerCase().includes(termo));
  });

  constructor() {
    this.carregar();
  }

  filtrar(f: Status | 'TODOS'): void {
    this.router.navigate([], { queryParams: { status: f === 'TODOS' ? null : f }, queryParamsHandling: 'merge' });
  }

  aoVender(): void {
    this.vendendo.set(null);
    this.carregar();
  }

  private carregar(): void {
    this.api.notebooks().subscribe({
      next: l => { this.lista.set(l); this.carregando.set(false); },
      error: e => { this.erro.set(mensagemDeErro(e)); this.carregando.set(false); },
    });
  }
}
