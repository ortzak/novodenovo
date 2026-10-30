import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, map, of, startWith, switchMap } from 'rxjs';
import { Estado, FiltroCatalogo, NotebookCard } from '../../core/modelos';
import { ESTADO } from '../../core/textos';
import { VitrineService } from '../../core/vitrine.service';
import { CardNotebook } from '../../shared/card-notebook';

type Resultado = { estado: 'carregando' } | { estado: 'ok'; itens: NotebookCard[] } | { estado: 'erro' };

const FILTRO_INICIAL: FiltroCatalogo = {
  marcas: [], estados: [], usos: [], precoMin: null, precoMax: null, ordenar: 'menor_preco',
};

@Component({
  selector: 'app-catalogo',
  imports: [FormsModule, RouterLink, CardNotebook],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss',
})
export class Catalogo {
  private vitrine = inject(VitrineService);

  readonly rotuloEstado = ESTADO;
  readonly filtro = signal<FiltroCatalogo>({ ...FILTRO_INICIAL });
  readonly filtrosAbertos = signal(false);

  readonly opcoes = toSignal(this.vitrine.filtros().pipe(catchError(() => of(null))));

  readonly resultado = toSignal(
    toObservable(this.filtro).pipe(
      debounceTime(250),
      switchMap(f => this.vitrine.listar(f).pipe(
        map(itens => ({ estado: 'ok', itens }) as Resultado),
        catchError(() => of({ estado: 'erro' } as Resultado)),
        startWith({ estado: 'carregando' } as Resultado),
      )),
    ),
    { initialValue: { estado: 'carregando' } as Resultado },
  );

  readonly quantidade = computed(() => {
    const r = this.resultado();
    return r.estado === 'ok' ? r.itens.length : 0;
  });

  readonly temFiltro = computed(() => {
    const f = this.filtro();
    return f.marcas.length + f.estados.length + f.usos.length > 0 || f.precoMin != null || f.precoMax != null;
  });

  alternar(campo: 'marcas' | 'usos', valor: string): void;
  alternar(campo: 'estados', valor: Estado): void;
  alternar(campo: 'marcas' | 'usos' | 'estados', valor: string): void {
    this.filtro.update(f => {
      const lista = f[campo] as string[];
      const nova = lista.includes(valor) ? lista.filter(v => v !== valor) : [...lista, valor];
      return { ...f, [campo]: nova };
    });
  }

  preco(campo: 'precoMin' | 'precoMax', valor: string | number | null): void {
    const n = valor === null || valor === '' ? null : Number(valor);
    this.filtro.update(f => ({ ...f, [campo]: Number.isFinite(n) ? n : null }));
  }

  ordenar(valor: FiltroCatalogo['ordenar']): void {
    this.filtro.update(f => ({ ...f, ordenar: valor }));
  }

  limpar(): void {
    this.filtro.set({ ...FILTRO_INICIAL });
  }

  marcado(campo: 'marcas' | 'usos' | 'estados', valor: string): boolean {
    return (this.filtro()[campo] as string[]).includes(valor);
  }
}
