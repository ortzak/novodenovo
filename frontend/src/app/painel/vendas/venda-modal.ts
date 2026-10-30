import { Component, HostListener, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mensagemDeErro } from '../core/autenticacao';
import { data, dinheiro, dinheiroCurto, FORMAS_PAGAMENTO } from '../core/formatos';
import { Canal, FormaPagamento, Venda } from '../core/modelos';
import { PainelApi } from '../core/painel-api.service';

@Component({
  selector: 'app-venda-modal',
  imports: [FormsModule],
  template: `
    <div class="fundo" (click)="fechar.emit()">
      <form class="janela" role="dialog" aria-modal="true" aria-labelledby="titulo-venda"
            (click)="$event.stopPropagation()" (ngSubmit)="confirmar()" #f="ngForm">
        <h2 id="titulo-venda">Registrar venda</h2>
        <p class="spec suave">{{ titulo() }} · anunciado por {{ curto(precoVenda()) }}</p>

        <h3>Cliente</h3>
        <div class="p-grade duas">
          <label class="p-campo"><span>Nome</span>
            <input name="nome" [(ngModel)]="clienteNome" required maxlength="100" autocomplete="off" /></label>
          <label class="p-campo"><span>Telefone (WhatsApp)</span>
            <input name="telefone" [(ngModel)]="clienteTelefone" required inputmode="tel" placeholder="(11) 91234-5678" /></label>
          <label class="p-campo inteiro"><span>E-mail <span class="ajuda">(opcional)</span></span>
            <input name="email" type="email" [(ngModel)]="clienteEmail" maxlength="120" /></label>
        </div>

        <h3>Pagamento</h3>
        <div class="p-grade duas">
          <label class="p-campo"><span>Valor final (R$)</span>
            <input name="valor" type="number" min="0.01" step="0.01" [ngModel]="valorFinal()" (ngModelChange)="valorFinal.set($event)" required /></label>
          <label class="p-campo"><span>Forma de pagamento</span>
            <select name="forma" [ngModel]="forma()" (ngModelChange)="mudarForma($event)">
              @for (fp of formas; track fp.valor) { <option [value]="fp.valor">{{ fp.rotulo }}</option> }
            </select></label>
          <label class="p-campo"><span>Parcelas</span>
            <input name="parcelas" type="number" min="1" max="24" [(ngModel)]="parcelas" [disabled]="forma() !== 'CARTAO_CREDITO'" /></label>
          <label class="p-campo"><span>Garantia (dias)</span>
            <input name="garantia" type="number" min="0" max="365" [ngModel]="garantiaDias()" (ngModelChange)="garantiaDias.set($event)" required />
            <span class="ajuda">vence em {{ fimGarantia() }}</span></label>
        </div>

        <h3>Canal da venda</h3>
        <div class="canal" role="group" aria-label="Canal da venda">
          <button type="button" [class.ativo]="canal() === 'WHATSAPP'" (click)="canal.set('WHATSAPP')">WhatsApp</button>
          <button type="button" [class.ativo]="canal() === 'PRESENCIAL'" (click)="canal.set('PRESENCIAL')">Presencial</button>
        </div>

        <label class="p-campo"><span>Observação <span class="ajuda">(opcional)</span></span>
          <input name="obs" [(ngModel)]="observacao" maxlength="255" /></label>

        <div class="resultado" [class.negativo]="lucro() < 0">
          <span>Custo total {{ curto(custoTotal()) }}</span>
          <strong>{{ lucro() < 0 ? 'Prejuízo' : 'Lucro' }} desta venda: {{ moeda(lucro()) }}</strong>
        </div>
        <p class="suave nota">Ao confirmar, o notebook passa para Vendido, sai da vitrine e a garantia é criada.</p>

        @if (erro()) { <div class="p-aviso erro" role="alert">{{ erro() }}</div> }

        <div class="botoes">
          <button type="button" class="btn btn-secundario" (click)="fechar.emit()">Cancelar</button>
          <button type="submit" class="btn btn-primario" [disabled]="enviando() || !f.valid">
            {{ enviando() ? 'Registrando…' : 'Confirmar venda' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .fundo { position: fixed; inset: 0; z-index: 50; background: rgb(22 23 26 / .55); display: grid; place-items: center; padding: 16px; overflow-y: auto; }
    .janela {
      width: min(560px, 100%); max-height: calc(100vh - 32px); overflow-y: auto;
      background: var(--branco); border-radius: 16px; padding: 28px; display: flex; flex-direction: column; gap: 14px;
      box-shadow: 0 24px 64px rgb(0 0 0 / .25);
      > * { flex-shrink: 0; }
      h2 { font-size: 26px; }
      h3 { font-size: 16px; font-weight: 600; margin-top: 6px; }
      .spec { font-size: 13px; }
    }
    .canal {
      display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--borda); border-radius: 8px; overflow: hidden;
      button { padding: 11px; border: 0; background: var(--branco); font: 600 15px var(--fonte-texto); cursor: pointer; }
      button.ativo { background: var(--escuro); color: var(--branco); }
    }
    .resultado {
      display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;
      padding: 14px 16px; border-radius: 10px; background: var(--sucesso-claro); font-size: 14px;
      strong { color: var(--sucesso); font-size: 16px; }
      &.negativo { background: var(--erro-claro); strong { color: var(--erro); } }
    }
    .nota { font-size: 13px; }
    .botoes { display: flex; justify-content: flex-end; gap: 12px; margin-top: 4px; }
  `,
})
export class VendaModal implements OnInit {
  readonly idNotebook = input.required<number>();
  readonly titulo = input('');
  readonly precoVenda = input(0);
  readonly custoTotal = input(0);
  readonly fechar = output<void>();
  readonly vendido = output<Venda>();

  private api = inject(PainelApi);
  readonly formas = FORMAS_PAGAMENTO;
  readonly moeda = dinheiro;
  readonly curto = dinheiroCurto;

  clienteNome = '';
  clienteTelefone = '';
  clienteEmail = '';
  parcelas = 1;
  observacao = '';
  readonly valorFinal = signal<number | null>(null);
  readonly forma = signal<FormaPagamento>('PIX');
  readonly canal = signal<Canal>('WHATSAPP');
  readonly garantiaDias = signal(90);
  readonly enviando = signal(false);
  readonly erro = signal('');

  readonly lucro = computed(() => (Number(this.valorFinal()) || 0) - this.custoTotal());
  readonly fimGarantia = computed(() => {
    const d = new Date();
    d.setDate(d.getDate() + (Number(this.garantiaDias()) || 0));
    return data(d.toISOString());
  });

  ngOnInit(): void {
    this.valorFinal.set(this.precoVenda());
    this.api.opcoes().subscribe({ next: o => this.garantiaDias.set(o.garantiaPadraoDias) });
  }

  @HostListener('document:keydown.escape')
  esc(): void {
    if (!this.enviando()) this.fechar.emit();
  }

  mudarForma(f: FormaPagamento): void {
    this.forma.set(f);
    if (f !== 'CARTAO_CREDITO') this.parcelas = 1;
  }

  confirmar(): void {
    this.erro.set('');
    this.enviando.set(true);
    this.api.registrarVenda(this.idNotebook(), {
      clienteNome: this.clienteNome,
      clienteTelefone: this.clienteTelefone,
      clienteEmail: this.clienteEmail || null,
      valorFinal: Number(this.valorFinal()),
      formaPagamento: this.forma(),
      parcelas: Number(this.parcelas) || 1,
      canal: this.canal(),
      garantiaDias: Number(this.garantiaDias()),
      observacao: this.observacao || null,
    }).subscribe({
      next: v => this.vendido.emit(v),
      error: e => { this.enviando.set(false); this.erro.set(mensagemDeErro(e)); },
    });
  }
}
