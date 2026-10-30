import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { NotebookDetalhe } from '../../core/modelos';
import { ESTADO, linkCompartilhar, linkWhatsapp, preco } from '../../core/textos';
import { VitrineService } from '../../core/vitrine.service';
import { IconeWhatsapp } from '../../shared/icone-whatsapp';
import { SeloStatus } from '../../shared/selo-status';
import { VistaProduto } from '../../vista3d/vista-produto';

type Estado = { estado: 'carregando' } | { estado: 'ok'; n: NotebookDetalhe } | { estado: 'erro' };

@Component({
  selector: 'app-detalhe',
  imports: [RouterLink, SeloStatus, VistaProduto, IconeWhatsapp],
  templateUrl: './detalhe.html',
  styleUrl: './detalhe.scss',
})
export class Detalhe {
  readonly codigo = input.required<string>();

  private vitrine = inject(VitrineService);
  private loja = toSignal(this.vitrine.loja().pipe(catchError(() => of(undefined))));

  readonly dados = toSignal(
    toObservable(this.codigo).pipe(
      switchMap(c => this.vitrine.detalhe(c).pipe(
        map(n => ({ estado: 'ok', n }) as Estado),
        catchError(() => of({ estado: 'erro' } as Estado)),
        startWith({ estado: 'carregando' } as Estado),
      )),
    ),
    { initialValue: { estado: 'carregando' } as Estado },
  );

  readonly n = computed(() => { const d = this.dados(); return d.estado === 'ok' ? d.n : null; });

  readonly whatsapp = computed(() => linkWhatsapp(this.loja(), this.n() ?? undefined));
  readonly endereco = computed(() => `${location.origin}/notebook/${encodeURIComponent(this.codigo())}`);
  readonly compartilhar = computed(() => (this.n() ? linkCompartilhar(this.n()!, this.endereco()) : '#'));
  readonly copiado = signal(false);

  compartilharNativo(ev: Event): void {
    const n = this.n();
    if (!n || typeof navigator.share !== 'function' || !matchMedia('(pointer: coarse)').matches) return;
    ev.preventDefault();
    navigator.share({ title: `${n.marca} ${n.modelo}`, text: `${n.marca} ${n.modelo} por ${preco(n.precoVenda)} na NovoDeNovo`, url: this.endereco() })
      .catch(() => {  });
  }

  copiarLink(): void {
    navigator.clipboard?.writeText(this.endereco()).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2500);
    });
  }

  readonly valor = computed(() => (this.n() ? preco(this.n()!.precoVenda) : ''));

  readonly ficha = computed(() => {
    const n = this.n();
    if (!n) return [];
    const linhas: [string, string | null][] = [
      ['Processador', n.processador],
      ['Memória', `${n.memoriaRamGb} GB`],
      ['Armazenamento', `${n.armazenamentoGb} GB ${n.tipoArmazenamento.replace('_', ' ')}`],
      ['Tela', `${String(n.telaPolegadas).replace('.', ',')}"`],
      ['Vídeo', n.placaVideo],
      ['Sistema', n.sistemaOperacional],
      ['Bateria', n.saudeBateria != null ? `${n.saudeBateria}% de saúde` : null],
      ['Garantia', `${n.garantiaDias} dias pela loja`],
    ];
    return linhas.filter((l): l is [string, string] => !!l[1]);
  });

  readonly estadoTexto = computed(() => {
    const n = this.n();
    if (!n) return '';
    return [ESTADO[n.estado], n.saudeBateria != null && n.estado !== 'NOVO' ? `bateria ${n.saudeBateria}%` : null, n.marcasUso]
      .filter(Boolean).join(' · ');
  });

  readonly reservaAte = computed(() => {
    const r = this.n()?.reservadoAte;
    if (!r) return null;
    const d = new Date(r);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ', '
      + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(':00', 'h');
  });
}
