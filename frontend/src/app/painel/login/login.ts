import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { mensagemDeErro } from '../core/autenticacao';
import { PainelApi } from '../core/painel-api.service';
import { SessaoService } from '../core/sessao.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="tela">
      <form class="cartao" (ngSubmit)="entrar()" #f="ngForm">
        <a routerLink="/" class="logo"><img src="img/logo-novodenovo.png" alt="" width="60" height="40" /><span>NovoDeNovo</span></a>
        <div>
          <h1>Painel do revendedor</h1>
          <p class="suave">Entre para cadastrar notebooks, registrar vendas e acompanhar as garantias.</p>
        </div>
        @if (modoTeste) {
          <div class="p-aviso aviso">
            <strong>Modo de teste</strong>
            O painel precisa do backend (Java + MySQL). Rode o sistema completo para entrar.
          </div>
        }
        <label class="p-campo">
          <span>E-mail</span>
          <input type="email" name="email" [(ngModel)]="email" required autocomplete="username" />
        </label>
        <label class="p-campo">
          <span>Senha</span>
          <input type="password" name="senha" [(ngModel)]="senha" required autocomplete="current-password" />
        </label>
        @if (erro()) { <div class="p-aviso erro" role="alert">{{ erro() }}</div> }
        <button type="submit" class="btn btn-primario btn-bloco" [disabled]="enviando() || !f.valid">
          {{ enviando() ? 'Entrando…' : 'Entrar' }}
        </button>
        <a routerLink="/" class="voltar">← Voltar para a vitrine</a>
      </form>
    </div>
  `,
  styles: `
    .tela {
      min-height: 100vh; display: grid; place-items: center; padding: 24px;
      background: radial-gradient(circle at 1px 1px, #3A3C42 1px, transparent 1.5px) 0 0 / 28px 28px, var(--escuro);
    }
    .cartao {
      width: min(420px, 100%); background: var(--branco); border-radius: 16px; padding: 36px 32px;
      display: flex; flex-direction: column; gap: 18px;
      h1 { font-size: 26px; margin-bottom: 6px; }
      .suave { font-size: 14px; }
    }
    .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; font: 500 20px var(--fonte-titulo); img { height: 40px; width: auto; } }
    .voltar { font-size: 14px; color: var(--texto-suave); text-align: center; text-decoration: none; }
  `,
})
export class Login {
  readonly voltar = input<string>();
  private api = inject(PainelApi);
  private sessao = inject(SessaoService);
  private router = inject(Router);

  readonly modoTeste = environment.mock;
  email = '';
  senha = '';
  readonly erro = signal('');
  readonly enviando = signal(false);

  entrar(): void {
    this.erro.set('');
    this.enviando.set(true);
    this.api.entrar(this.email, this.senha).subscribe({
      next: s => {
        this.sessao.entrar(s);
        const destino = this.voltar();
        this.router.navigateByUrl(destino && destino.startsWith('/painel') ? destino : '/painel');
      },
      error: e => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(e, 'Não foi possível entrar.'));
      },
    });
  }
}
