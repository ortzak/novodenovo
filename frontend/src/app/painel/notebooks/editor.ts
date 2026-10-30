import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Estado, Status } from '../../core/modelos';
import { STATUS } from '../../core/textos';
import { SeloStatus } from '../../shared/selo-status';
import { codigoDeErro, mensagemDeErro } from '../core/autenticacao';
import { ARMAZENAMENTOS, data, dataHora, dinheiro, hojeIso, NOME_CANAL, NOME_PAGAMENTO, telefone } from '../core/formatos';
import { NotebookAdmin, NotebookForm, Opcoes } from '../core/modelos';
import { PainelApi } from '../core/painel-api.service';
import { VendaModal } from '../vendas/venda-modal';
import { AbaComponentes } from './aba-componentes';
import { AbaCustos } from './aba-custos';
import { AbaFotos } from './aba-fotos';

type Aba = 'dados' | 'fotos' | 'componentes' | 'custos';

function vazio(): NotebookForm {
  return {
    marca: '', modelo: '', numeroSerie: '', processador: '', memoriaRamGb: null, armazenamentoGb: null,
    tipoArmazenamento: 'SSD_NVME', telaPolegadas: null, placaVideo: null, sistemaOperacional: 'Windows 11',
    estado: 'SEMINOVO', saudeBateria: null, marcasUso: null, descricao: null, valorCompra: null,
    dataCompra: hojeIso(), fornecedor: null, precoVenda: null, status: 'EM_PREPARACAO', reservadoAte: null, usos: [],
  };
}

@Component({
  selector: 'app-editor-notebook',
  imports: [FormsModule, RouterLink, SeloStatus, AbaFotos, AbaComponentes, AbaCustos, VendaModal],
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
})
export class EditorNotebook {
  readonly id = input<string>();
  private api = inject(PainelApi);
  private router = inject(Router);

  readonly armazenamentos = ARMAZENAMENTOS;
  readonly nomeStatus = STATUS;
  readonly statusEditaveis: Status[] = ['EM_PREPARACAO', 'DISPONIVEL', 'RESERVADO'];
  readonly estados: { valor: Estado; rotulo: string }[] = [
    { valor: 'NOVO', rotulo: 'Novo' }, { valor: 'SEMINOVO', rotulo: 'Seminovo' }, { valor: 'RECONDICIONADO', rotulo: 'Recondicionado' },
  ];
  readonly moeda = dinheiro;
  readonly dia = data;
  readonly diaHora = dataHora;
  readonly fone = telefone;
  readonly canal = NOME_CANAL;
  readonly pagamento = NOME_PAGAMENTO;

  readonly notebook = signal<NotebookAdmin | null>(null);
  readonly opcoes = signal<Opcoes>({ marcas: [], usos: [], garantiaPadraoDias: 90 });
  readonly aba = signal<Aba>('dados');
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly erro = signal('');
  readonly sucesso = signal('');
  readonly vendendo = signal(false);
  f: NotebookForm = vazio();

  readonly novo = computed(() => !this.id());
  readonly vendido = computed(() => this.notebook()?.status === 'VENDIDO');

  constructor() {
    this.api.opcoes().subscribe({ next: o => this.opcoes.set(o) });
    effect(() => {
      const id = this.id();
      this.aba.set('dados');
      this.erro.set('');
      this.sucesso.set('');
      if (id) this.carregar(Number(id));
      else { this.notebook.set(null); this.f = vazio(); }
    });
  }

  get custosAdicionais(): number { return this.notebook()?.custosAdicionais ?? 0; }
  get custoTotal(): number { return (Number(this.f.valorCompra) || 0) + this.custosAdicionais; }
  get lucroPrevisto(): number { return (Number(this.f.precoVenda) || 0) - this.custoTotal; }
  get abaixoDoCusto(): boolean { return !!this.f.precoVenda && this.lucroPrevisto < 0; }

  usoMarcado(u: string): boolean { return this.f.usos.includes(u); }

  alternarUso(u: string): void {
    this.f.usos = this.usoMarcado(u) ? this.f.usos.filter(x => x !== u) : [...this.f.usos, u];
  }

  salvar(confirmado = false): void {
    this.erro.set('');
    this.sucesso.set('');
    this.salvando.set(true);
    const dados: NotebookForm = {
      ...this.f,
      reservadoAte: this.f.status === 'RESERVADO' ? this.f.reservadoAte : null,
      confirmarPrecoAbaixoDoCusto: confirmado,
    };
    const atual = this.notebook();
    const pedido = atual ? this.api.atualizar(atual.id, dados) : this.api.criar(dados);
    pedido.subscribe({
      next: n => {
        this.salvando.set(false);
        if (!atual) {
          this.router.navigate(['/painel/notebooks', n.id], { state: { criado: true } });
          return;
        }
        this.aplicar(n);
        this.sucesso.set('Alterações salvas.');
      },
      error: e => {
        this.salvando.set(false);
        if (codigoDeErro(e) === 'PRECO_ABAIXO_DO_CUSTO'
          && confirm(`O preço de venda (${dinheiro(Number(this.f.precoVenda))}) está abaixo do custo total (${dinheiro(this.custoTotal)}).\n\nSalvar mesmo assim?`)) {
          this.salvar(true);
          return;
        }
        this.erro.set(mensagemDeErro(e));
      },
    });
  }

  excluir(): void {
    const n = this.notebook();
    if (!n || !confirm(`Excluir ${n.codigo} · ${n.marca} ${n.modelo}? As fotos, peças e custos também serão apagados.`)) return;
    this.api.excluir(n.id).subscribe({
      next: () => this.router.navigate(['/painel/notebooks']),
      error: e => this.erro.set(mensagemDeErro(e)),
    });
  }

  desfazerVenda(): void {
    const v = this.notebook()?.venda;
    if (!v || !confirm('Desfazer esta venda? O notebook volta para Disponível e a garantia é apagada.')) return;
    this.api.desfazerVenda(v.id).subscribe({
      next: () => this.carregar(v.idNotebook),
      error: e => this.erro.set(mensagemDeErro(e)),
    });
  }

  aoVender(): void {
    this.vendendo.set(false);
    this.sucesso.set('Venda registrada. O notebook saiu da vitrine e a garantia foi criada.');
    const n = this.notebook();
    if (n) this.carregar(n.id);
  }

  atualizarLista<K extends 'fotos' | 'componentes' | 'custos'>(campo: K, lista: NotebookAdmin[K]): void {
    const n = this.notebook();
    if (!n) return;
    const novo = { ...n, [campo]: lista } as NotebookAdmin;
    if (campo === 'custos') {
      novo.custosAdicionais = (lista as NotebookAdmin['custos']).reduce((s, c) => s + c.valor, 0);
      novo.custoTotal = novo.valorCompra! + novo.custosAdicionais;
      novo.lucroPrevisto = novo.precoVenda! - novo.custoTotal;
    }
    this.notebook.set(novo);
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.api.notebook(id).subscribe({
      next: n => {
        this.aplicar(n);
        this.carregando.set(false);
        if (history.state?.criado) {
          this.sucesso.set('Notebook cadastrado. Agora adicione as fotos e as peças da vista 3D.');
          history.replaceState({ ...history.state, criado: false }, '');
        }
      },
      error: e => { this.carregando.set(false); this.erro.set(mensagemDeErro(e)); },
    });
  }

  private aplicar(n: NotebookAdmin): void {
    this.notebook.set(n);
    this.f = {
      marca: n.marca, modelo: n.modelo, numeroSerie: n.numeroSerie, processador: n.processador,
      memoriaRamGb: n.memoriaRamGb, armazenamentoGb: n.armazenamentoGb, tipoArmazenamento: n.tipoArmazenamento,
      telaPolegadas: n.telaPolegadas, placaVideo: n.placaVideo, sistemaOperacional: n.sistemaOperacional,
      estado: n.estado, saudeBateria: n.saudeBateria, marcasUso: n.marcasUso, descricao: n.descricao,
      valorCompra: n.valorCompra, dataCompra: n.dataCompra, fornecedor: n.fornecedor, precoVenda: n.precoVenda,
      status: n.status, reservadoAte: n.reservadoAte ? n.reservadoAte.slice(0, 16) : null, usos: [...n.usos],
    };
  }
}
