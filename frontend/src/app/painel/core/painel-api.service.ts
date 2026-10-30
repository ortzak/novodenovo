import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Loja } from '../../core/modelos';
import {
  ComponenteAdmin, Custo, Dashboard, Foto, Garantia, LojaForm, NotebookAdmin, NotebookForm,
  NotebookResumo, Opcoes, ServicoAdmin, Sessao, Venda, VendaForm,
} from './modelos';

@Injectable({ providedIn: 'root' })
export class PainelApi {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/admin`;

  entrar(email: string, senha: string): Observable<Sessao> {
    return this.http.post<Sessao>(`${environment.apiUrl}/auth/login`, { email, senha });
  }

  dashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.api}/dashboard`);
  }

  opcoes(): Observable<Opcoes> {
    return this.http.get<Opcoes>(`${this.api}/opcoes`);
  }

  notebooks(): Observable<NotebookResumo[]> {
    return this.http.get<NotebookResumo[]>(`${this.api}/notebooks`);
  }

  notebook(id: number): Observable<NotebookAdmin> {
    return this.http.get<NotebookAdmin>(`${this.api}/notebooks/${id}`);
  }

  criar(dados: NotebookForm): Observable<NotebookAdmin> {
    return this.http.post<NotebookAdmin>(`${this.api}/notebooks`, dados);
  }

  atualizar(id: number, dados: NotebookForm): Observable<NotebookAdmin> {
    return this.http.put<NotebookAdmin>(`${this.api}/notebooks/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/notebooks/${id}`);
  }

  enviarFotos(id: number, arquivos: File[]): Observable<Foto[]> {
    const corpo = new FormData();
    arquivos.forEach(a => corpo.append('arquivos', a, a.name));
    return this.http.post<Foto[]>(`${this.api}/notebooks/${id}/fotos`, corpo);
  }

  fotoPrincipal(idFoto: number): Observable<Foto[]> {
    return this.http.put<Foto[]>(`${this.api}/fotos/${idFoto}/principal`, {});
  }

  excluirFoto(idFoto: number): Observable<Foto[]> {
    return this.http.delete<Foto[]>(`${this.api}/fotos/${idFoto}`);
  }

  adicionarComponente(id: number, dados: Omit<ComponenteAdmin, 'id'>): Observable<ComponenteAdmin[]> {
    return this.http.post<ComponenteAdmin[]>(`${this.api}/notebooks/${id}/componentes`, dados);
  }

  atualizarComponente(idComponente: number, dados: Omit<ComponenteAdmin, 'id'>): Observable<ComponenteAdmin[]> {
    return this.http.put<ComponenteAdmin[]>(`${this.api}/componentes/${idComponente}`, dados);
  }

  excluirComponente(idComponente: number): Observable<ComponenteAdmin[]> {
    return this.http.delete<ComponenteAdmin[]>(`${this.api}/componentes/${idComponente}`);
  }

  adicionarCusto(id: number, dados: Omit<Custo, 'id'>): Observable<Custo[]> {
    return this.http.post<Custo[]>(`${this.api}/notebooks/${id}/custos`, dados);
  }

  excluirCusto(idCusto: number): Observable<Custo[]> {
    return this.http.delete<Custo[]>(`${this.api}/custos/${idCusto}`);
  }

  registrarVenda(id: number, dados: VendaForm): Observable<Venda> {
    return this.http.post<Venda>(`${this.api}/notebooks/${id}/venda`, dados);
  }

  vendas(): Observable<Venda[]> {
    return this.http.get<Venda[]>(`${this.api}/vendas`);
  }

  desfazerVenda(idVenda: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/vendas/${idVenda}`);
  }

  garantias(): Observable<Garantia[]> {
    return this.http.get<Garantia[]>(`${this.api}/garantias`);
  }

  loja(): Observable<Loja> {
    return this.http.get<Loja>(`${this.api}/loja`);
  }

  salvarLoja(dados: LojaForm): Observable<Loja> {
    return this.http.put<Loja>(`${this.api}/loja`, dados);
  }

  servicos(): Observable<ServicoAdmin[]> {
    return this.http.get<ServicoAdmin[]>(`${this.api}/servicos`);
  }

  salvarServico(dados: ServicoAdmin): Observable<ServicoAdmin[]> {
    return dados.id
      ? this.http.put<ServicoAdmin[]>(`${this.api}/servicos/${dados.id}`, dados)
      : this.http.post<ServicoAdmin[]>(`${this.api}/servicos`, dados);
  }

  excluirServico(id: number): Observable<ServicoAdmin[]> {
    return this.http.delete<ServicoAdmin[]>(`${this.api}/servicos/${id}`);
  }

  trocarSenha(senhaAtual: string, novaSenha: string): Observable<void> {
    return this.http.put<void>(`${this.api}/senha`, { senhaAtual, novaSenha });
  }
}
