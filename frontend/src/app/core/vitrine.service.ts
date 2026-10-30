import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  FiltroCatalogo, Filtros, Loja, NotebookCard, NotebookDetalhe, Estado, Servico,
} from './modelos';

interface DadosMock {
  loja: Loja;
  servicos: Servico[];
  marcas: string[];
  usos: string[];
  notebooks: (NotebookDetalhe & { dataCadastro: string })[];
}

@Injectable({ providedIn: 'root' })
export class VitrineService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/vitrine`;

  private loja$ = environment.mock
    ? this.mock().pipe(map(d => d.loja), shareReplay(1))
    : this.http.get<Loja>(`${this.api}/loja`).pipe(shareReplay(1));

  private mock$?: Observable<DadosMock>;

  listar(f: FiltroCatalogo): Observable<NotebookCard[]> {
    if (environment.mock) return this.mock().pipe(map(d => filtrarMock(d, f)));

    let params = new HttpParams().set('ordenar', f.ordenar);
    f.marcas.forEach(m => (params = params.append('marca', m)));
    f.estados.forEach(e => (params = params.append('estado', e)));
    f.usos.forEach(u => (params = params.append('uso', u)));
    if (f.precoMin != null) params = params.set('precoMin', f.precoMin);
    if (f.precoMax != null) params = params.set('precoMax', f.precoMax);
    return this.http.get<NotebookCard[]>(`${this.api}/notebooks`, { params });
  }

  detalhe(codigo: string): Observable<NotebookDetalhe> {
    if (environment.mock) {
      return this.mock().pipe(map(d => {
        const n = d.notebooks.find(x => x.codigo === codigo && visivel(x.status));
        if (!n) throw new Error('Notebook não encontrado');
        return n;
      }));
    }
    return this.http.get<NotebookDetalhe>(`${this.api}/notebooks/${encodeURIComponent(codigo)}`);
  }

  filtros(): Observable<Filtros> {
    if (environment.mock) {
      return this.mock().pipe(map(d => {
        const precos = d.notebooks.filter(n => visivel(n.status)).map(n => n.precoVenda);
        return {
          marcas: d.marcas, usos: d.usos,
          estados: ['NOVO', 'SEMINOVO', 'RECONDICIONADO'] as Estado[],
          precoMinimo: Math.min(...precos), precoMaximo: Math.max(...precos),
        };
      }));
    }
    return this.http.get<Filtros>(`${this.api}/filtros`);
  }

  loja(): Observable<Loja> {
    return this.loja$;
  }

  servicos(): Observable<Servico[]> {
    if (environment.mock) return this.mock().pipe(map(d => d.servicos));
    return this.http.get<Servico[]>(`${this.api}/servicos`);
  }

  private mock(): Observable<DadosMock> {
    this.mock$ ??= this.http.get<DadosMock>('mock/vitrine.json').pipe(shareReplay(1));
    return this.mock$;
  }
}

const visivel = (s: string) => s === 'DISPONIVEL' || s === 'RESERVADO';

function filtrarMock(d: DadosMock, f: FiltroCatalogo): NotebookCard[] {
  const lista = d.notebooks
    .filter(n => visivel(n.status))
    .filter(n => !f.marcas.length || f.marcas.includes(n.marca))
    .filter(n => !f.estados.length || f.estados.includes(n.estado))
    .filter(n => !f.usos.length || n.usos.some(u => f.usos.includes(u)))
    .filter(n => f.precoMin == null || n.precoVenda >= f.precoMin)
    .filter(n => f.precoMax == null || n.precoVenda <= f.precoMax);

  lista.sort((a, b) =>
    f.ordenar === 'maior_preco' ? b.precoVenda - a.precoVenda
      : f.ordenar === 'recentes' ? b.dataCadastro.localeCompare(a.dataCadastro)
        : a.precoVenda - b.precoVenda);

  return lista.map(n => ({
    codigo: n.codigo, marca: n.marca, modelo: n.modelo, processador: n.processador,
    memoriaRamGb: n.memoriaRamGb, armazenamentoGb: n.armazenamentoGb,
    tipoArmazenamento: n.tipoArmazenamento, placaVideo: n.placaVideo, estado: n.estado,
    saudeBateria: n.saudeBateria, precoVenda: n.precoVenda, status: n.status,
    fotoPrincipal: n.fotos[0] ?? null, usos: n.usos,
  }));
}
