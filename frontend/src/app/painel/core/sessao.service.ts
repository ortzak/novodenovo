import { Injectable, computed, signal } from '@angular/core';
import { Sessao } from './modelos';

const CHAVE = 'novodenovo:painel';

function ler(): Sessao | null {
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE) ?? 'null') as Sessao | null;
    return s && new Date(s.expiraEm).getTime() > Date.now() ? s : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class SessaoService {
  private readonly atual = signal<Sessao | null>(ler());

  readonly sessao = this.atual.asReadonly();
  readonly logado = computed(() => !!this.atual());
  readonly token = computed(() => this.atual()?.token ?? null);

  entrar(s: Sessao): void {
    this.atual.set(s);
    try { localStorage.setItem(CHAVE, JSON.stringify(s)); } catch { }
  }

  sair(): void {
    this.atual.set(null);
    try { localStorage.removeItem(CHAVE); } catch { }
  }

  valida(): boolean {
    const s = this.atual();
    if (s && new Date(s.expiraEm).getTime() <= Date.now()) this.sair();
    return this.logado();
  }
}
