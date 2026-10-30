import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Componente, TipoComponente } from '../../core/modelos';
import { VistaProduto } from '../../vista3d/vista-produto';
import { mensagemDeErro } from '../core/autenticacao';
import { NOME_COMPONENTE, TIPOS_COMPONENTE } from '../core/formatos';
import { ComponenteAdmin, Foto } from '../core/modelos';
import { PainelApi } from '../core/painel-api.service';

interface Edicao { id: number | null; tipo: TipoComponente; nome: string; especificacao: string; quantidade: number; camada: number | null; }

@Component({
  selector: 'app-aba-componentes',
  imports: [FormsModule, VistaProduto],
  template: `
    <div class="cabeca">
      <p class="suave">Peças exibidas na vista explodida da vitrine. A camada define a ordem, de baixo (1) para cima.</p>
      <button type="button" class="btn btn-secundario btn-pequeno" (click)="novo()">+ Adicionar peça</button>
    </div>

    @if (erro()) { <div class="p-aviso erro">{{ erro() }}</div> }

    @if (edicao(); as e) {
      <form class="p-cartao edicao" (ngSubmit)="salvar()" #f="ngForm">
        <h3>{{ e.id ? 'Editar peça' : 'Nova peça' }}</h3>
        <div class="p-grade">
          <label class="p-campo"><span>Tipo</span>
            <select name="tipo" [(ngModel)]="e.tipo" (ngModelChange)="sugerirNome($event)" required>
              @for (t of tipos; track t.valor) { <option [value]="t.valor">{{ t.rotulo }}</option> }
            </select></label>
          <label class="p-campo"><span>Nome</span><input name="nome" [(ngModel)]="e.nome" required maxlength="80" /></label>
          <label class="p-campo"><span>Quantidade</span><input name="qtd" type="number" min="1" max="4" [(ngModel)]="e.quantidade" required /></label>
          <label class="p-campo"><span>Camada <span class="ajuda">(vazio = no topo)</span></span>
            <input name="camada" type="number" min="1" max="20" [(ngModel)]="e.camada" /></label>
          <label class="p-campo inteiro"><span>Especificação</span>
            <input name="espec" [(ngModel)]="e.especificacao" required maxlength="200" placeholder="ex.: 16 GB DDR4 3200 MHz · trocada em 10/2026" /></label>
        </div>
        <div class="botoes">
          <button type="button" class="btn btn-secundario btn-pequeno" (click)="edicao.set(null)">Cancelar</button>
          <button type="submit" class="btn btn-primario btn-pequeno" [disabled]="salvando() || !f.valid">Salvar peça</button>
        </div>
      </form>
    }

    <section class="p-cartao sem-borda-interna">
      @if (ordenadas().length) {
        <div class="p-tabela-rolagem">
          <table class="p-tabela">
            <thead><tr><th>Camada</th><th>Tipo</th><th>Nome</th><th>Especificação</th><th>Ações</th></tr></thead>
            <tbody>
              @for (c of ordenadas(); track c.id) {
                <tr>
                  <td><span class="camada">{{ c.camada }}</span></td>
                  <td class="num tipo">{{ nomeTipo[c.tipo] }}</td>
                  <td class="forte">{{ c.nome }}{{ c.quantidade > 1 ? ' (' + c.quantidade + 'x)' : '' }}</td>
                  <td class="quebra">{{ c.especificacao }}</td>
                  <td><div class="p-acoes">
                    <button type="button" class="p-link" (click)="editar(c)">Editar</button>
                    <button type="button" class="p-link vermelho" (click)="excluir(c)">Remover</button>
                  </div></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="p-vazio">Nenhuma peça ainda. Sem peças, o botão "Ver por dentro (3D)" não aparece na vitrine.</div>
      }
    </section>

    @if (componentes().length) {
      <section class="previa">
        <h3>Prévia na vitrine</h3>
        <app-vista-produto [fotos]="urlsFotos()" [componentes]="paraVitrine()" [titulo]="titulo()" />
      </section>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 16px; }
    .cabeca { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; .suave { font-size: 14px; } }
    .edicao { display: flex; flex-direction: column; gap: 14px; }
    .botoes { display: flex; justify-content: flex-end; gap: 10px; }
    .camada {
      display: inline-grid; place-items: center; width: 24px; height: 22px; border-radius: 4px;
      background: var(--escuro); color: var(--destaque); font: 600 12px var(--fonte-spec);
    }
    .tipo { font-size: 12px; color: var(--texto-suave); text-transform: uppercase; }
    .previa { display: flex; flex-direction: column; gap: 12px; max-width: 800px; }
  `,
})
export class AbaComponentes {
  readonly idNotebook = input.required<number>();
  readonly componentes = input.required<ComponenteAdmin[]>();
  readonly fotos = input<Foto[]>([]);
  readonly titulo = input('');
  readonly mudou = output<ComponenteAdmin[]>();

  private api = inject(PainelApi);
  readonly tipos = TIPOS_COMPONENTE;
  readonly nomeTipo = NOME_COMPONENTE;
  readonly edicao = signal<Edicao | null>(null);
  readonly salvando = signal(false);
  readonly erro = signal('');

  readonly ordenadas = computed(() => [...this.componentes()].sort((a, b) => b.camada - a.camada));
  readonly urlsFotos = computed(() => this.fotos().map(f => f.url));
  readonly paraVitrine = computed<Componente[]>(() =>
    this.componentes().map(c => ({ ...c, imagemUrl: null })));

  novo(): void {
    this.erro.set('');
    this.edicao.set({ id: null, tipo: 'MEMORIA_RAM', nome: 'Memória RAM', especificacao: '', quantidade: 1, camada: null });
  }

  editar(c: ComponenteAdmin): void {
    this.erro.set('');
    this.edicao.set({ ...c });
  }

  sugerirNome(tipo: TipoComponente): void {
    const e = this.edicao();
    if (e && (!e.nome || TIPOS_COMPONENTE.some(t => t.rotulo === e.nome))) e.nome = NOME_COMPONENTE[tipo];
  }

  salvar(): void {
    const e = this.edicao();
    if (!e) return;
    this.salvando.set(true);
    const dados = { tipo: e.tipo, nome: e.nome, especificacao: e.especificacao, quantidade: Number(e.quantidade),
      camada: e.camada ? Number(e.camada) : null } as unknown as Omit<ComponenteAdmin, 'id'>;
    const pedido = e.id ? this.api.atualizarComponente(e.id, dados) : this.api.adicionarComponente(this.idNotebook(), dados);
    pedido.subscribe({
      next: l => { this.salvando.set(false); this.edicao.set(null); this.mudou.emit(l); },
      error: err => { this.salvando.set(false); this.erro.set(mensagemDeErro(err)); },
    });
  }

  excluir(c: ComponenteAdmin): void {
    if (!confirm(`Remover "${c.nome}" da vista 3D?`)) return;
    this.api.excluirComponente(c.id).subscribe({ next: l => this.mudou.emit(l), error: e => this.erro.set(mensagemDeErro(e)) });
  }
}
