import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mensagemDeErro } from '../core/autenticacao';
import { dinheiroCurto, telefone } from '../core/formatos';
import { LojaForm, ServicoAdmin } from '../core/modelos';
import { PainelApi } from '../core/painel-api.service';

@Component({
  selector: 'app-configuracoes',
  imports: [FormsModule],
  template: `
    <div class="p-pagina">
      <header class="p-topo"><div><h1>Configurações</h1><p class="suave">Dados que aparecem na vitrine e acesso ao painel.</p></div></header>

      <form class="p-cartao bloco" (ngSubmit)="salvarLoja()" #fl="ngForm">
        <h2>Loja e atendimento</h2>
        @if (loja(); as l) {
          <div class="p-grade">
            <label class="p-campo"><span>Nome</span><input name="nome" [(ngModel)]="l.nome" required maxlength="100" /></label>
            <label class="p-campo"><span>WhatsApp</span><input name="whatsapp" [(ngModel)]="l.whatsapp" required inputmode="tel" /></label>
            <label class="p-campo"><span>Instagram <span class="ajuda">(opcional)</span></span><input name="instagram" [(ngModel)]="l.instagram" maxlength="60" /></label>
            <label class="p-campo"><span>Região de atendimento</span><input name="area" [(ngModel)]="l.areaAtendimento" required maxlength="120" /></label>
            <label class="p-campo"><span>Horário</span><input name="horario" [(ngModel)]="l.horarioAtendimento" required maxlength="120" /></label>
            <label class="p-campo"><span>Garantia padrão (dias)</span><input name="garantia" type="number" min="0" max="365" [(ngModel)]="l.garantiaPadraoDias" required /></label>
          </div>
          @if (msgLoja(); as m) { <div class="p-aviso" [class]="'p-aviso ' + m.tipo">{{ m.texto }}</div> }
          <div class="botoes"><button type="submit" class="btn btn-primario btn-pequeno" [disabled]="!fl.valid">Salvar dados da loja</button></div>
        } @else {
          <p class="suave">Carregando…</p>
        }
      </form>

      <section class="p-cartao bloco">
        <div class="cabeca">
          <h2>Serviços técnicos</h2>
          <button type="button" class="btn btn-secundario btn-pequeno" (click)="novoServico()">+ Novo serviço</button>
        </div>
        <p class="suave pequeno">Aparecem na página "Serviços" da vitrine. Deixe o preço vazio para mostrar "sob orçamento".</p>

        @if (edicao(); as s) {
          <form class="edicao" (ngSubmit)="salvarServico()" #fs="ngForm">
            <div class="p-grade">
              <label class="p-campo"><span>Nome</span><input name="snome" [(ngModel)]="s.nome" required maxlength="80" /></label>
              <label class="p-campo"><span>Preço a partir de (R$)</span><input name="spreco" type="number" min="0" step="0.01" [(ngModel)]="s.precoAPartir" /></label>
              <label class="p-campo"><span>Prazo <span class="ajuda">(ex.: no mesmo dia)</span></span><input name="sprazo" [(ngModel)]="s.prazo" maxlength="60" /></label>
              <label class="p-campo"><span>Ordem</span><input name="sordem" type="number" min="1" [(ngModel)]="s.ordem" /></label>
              <label class="p-campo inteiro"><span>Descrição</span><textarea name="sdesc" [(ngModel)]="s.descricao" required maxlength="300"></textarea></label>
              <label class="check"><input type="checkbox" name="sativo" [(ngModel)]="s.ativo" /> Mostrar na vitrine</label>
            </div>
            <div class="botoes">
              <button type="button" class="btn btn-secundario btn-pequeno" (click)="edicao.set(null)">Cancelar</button>
              <button type="submit" class="btn btn-primario btn-pequeno" [disabled]="!fs.valid">Salvar serviço</button>
            </div>
          </form>
        }
        @if (msgServico()) { <div class="p-aviso erro">{{ msgServico() }}</div> }

        <div class="p-tabela-rolagem">
          <table class="p-tabela">
            <thead><tr><th>Ordem</th><th>Serviço</th><th>Preço</th><th>Prazo</th><th>Na vitrine</th><th>Ações</th></tr></thead>
            <tbody>
              @for (s of servicos(); track s.id) {
                <tr>
                  <td class="num">{{ s.ordem }}</td>
                  <td class="quebra"><strong>{{ s.nome }}</strong><span class="desc">{{ s.descricao }}</span></td>
                  <td class="num">{{ s.precoAPartir != null ? 'a partir de ' + moeda(s.precoAPartir) : 'sob orçamento' }}</td>
                  <td>{{ s.prazo || '—' }}</td>
                  <td>{{ s.ativo ? 'Sim' : 'Não' }}</td>
                  <td><div class="p-acoes">
                    <button type="button" class="p-link" (click)="editarServico(s)">Editar</button>
                    <button type="button" class="p-link vermelho" (click)="excluirServico(s)">Excluir</button>
                  </div></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <form class="p-cartao bloco senha" (ngSubmit)="trocarSenha()" #fp="ngForm">
        <h2>Trocar senha</h2>
        <p class="suave pequeno">Use pelo menos 8 caracteres. Troque a senha inicial antes de apresentar o sistema.</p>
        <div class="p-grade">
          <label class="p-campo"><span>Senha atual</span><input name="atual" type="password" [(ngModel)]="senhaAtual" required autocomplete="current-password" /></label>
          <label class="p-campo"><span>Nova senha</span><input name="nova" type="password" [(ngModel)]="novaSenha" required minlength="8" autocomplete="new-password" /></label>
          <label class="p-campo"><span>Repita a nova senha</span><input name="repita" type="password" [(ngModel)]="repita" required autocomplete="new-password" /></label>
        </div>
        @if (msgSenha(); as m) { <div class="p-aviso" [class]="'p-aviso ' + m.tipo">{{ m.texto }}</div> }
        <div class="botoes"><button type="submit" class="btn btn-primario btn-pequeno" [disabled]="!fp.valid">Trocar senha</button></div>
      </form>
    </div>
  `,
  styles: `
    .bloco { display: flex; flex-direction: column; gap: 16px; }
    .cabeca { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .pequeno { font-size: 13px; margin-top: -8px; }
    .botoes { display: flex; justify-content: flex-end; gap: 10px; }
    .edicao { display: flex; flex-direction: column; gap: 12px; padding: 16px; border-radius: 10px; background: var(--fundo); }
    .check { display: flex; align-items: center; gap: 8px; font-size: 14px; input { width: 18px; height: 18px; accent-color: var(--escuro); } }
    .desc { display: block; font-size: 12.5px; color: var(--texto-suave); max-width: 60ch; }
    .p-tabela-rolagem { border: 1px solid var(--superficie); border-radius: 10px; }
  `,
})
export class Configuracoes {
  private api = inject(PainelApi);
  readonly moeda = dinheiroCurto;

  readonly loja = signal<LojaForm | null>(null);
  readonly servicos = signal<ServicoAdmin[]>([]);
  readonly edicao = signal<ServicoAdmin | null>(null);
  readonly msgLoja = signal<{ tipo: string; texto: string } | null>(null);
  readonly msgServico = signal('');
  readonly msgSenha = signal<{ tipo: string; texto: string } | null>(null);
  senhaAtual = '';
  novaSenha = '';
  repita = '';

  constructor() {
    this.api.loja().subscribe({
      next: l => this.loja.set({ ...l, whatsapp: telefone(l.whatsapp) }),
      error: e => this.msgLoja.set({ tipo: 'erro', texto: mensagemDeErro(e) }),
    });
    this.api.servicos().subscribe({ next: s => this.servicos.set(s), error: e => this.msgServico.set(mensagemDeErro(e)) });
  }

  salvarLoja(): void {
    const l = this.loja();
    if (!l) return;
    this.msgLoja.set(null);
    this.api.salvarLoja(l).subscribe({
      next: r => { this.loja.set({ ...r, whatsapp: telefone(r.whatsapp) }); this.msgLoja.set({ tipo: 'sucesso', texto: 'Dados da loja salvos.' }); },
      error: e => this.msgLoja.set({ tipo: 'erro', texto: mensagemDeErro(e) }),
    });
  }

  editarServico(s: ServicoAdmin): void {
    this.edicao.set({ ...s });
  }

  novoServico(): void {
    this.edicao.set({ id: null, nome: '', descricao: '', precoAPartir: null, prazo: null, ordem: null, ativo: true });
  }

  salvarServico(): void {
    const s = this.edicao();
    if (!s) return;
    this.msgServico.set('');
    const dados = { ...s, precoAPartir: s.precoAPartir === null || (s.precoAPartir as unknown) === '' ? null : Number(s.precoAPartir) };
    this.api.salvarServico(dados).subscribe({
      next: l => { this.servicos.set(l); this.edicao.set(null); },
      error: e => this.msgServico.set(mensagemDeErro(e)),
    });
  }

  excluirServico(s: ServicoAdmin): void {
    if (!s.id || !confirm(`Excluir o serviço "${s.nome}"?`)) return;
    this.api.excluirServico(s.id).subscribe({ next: l => this.servicos.set(l), error: e => this.msgServico.set(mensagemDeErro(e)) });
  }

  trocarSenha(): void {
    this.msgSenha.set(null);
    if (this.novaSenha !== this.repita) { this.msgSenha.set({ tipo: 'erro', texto: 'As duas senhas novas não são iguais.' }); return; }
    this.api.trocarSenha(this.senhaAtual, this.novaSenha).subscribe({
      next: () => { this.senhaAtual = this.novaSenha = this.repita = ''; this.msgSenha.set({ tipo: 'sucesso', texto: 'Senha trocada.' }); },
      error: e => this.msgSenha.set({ tipo: 'erro', texto: mensagemDeErro(e) }),
    });
  }
}
