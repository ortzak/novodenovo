import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { Abertura } from './layout/abertura';
import { Cabecalho } from './layout/cabecalho';
import { Rodape } from './layout/rodape';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Abertura, Cabecalho, Rodape],
  template: `
    @if (painel()) {
      <router-outlet />
    } @else {
      <app-abertura />
      <app-cabecalho />
      <main><router-outlet /></main>
      <app-rodape />
    }
  `,
  styles: `main { min-height: 60vh; }`,
})
export class App {
  private router = inject(Router);
  readonly painel = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects.startsWith('/painel')),
    ),
    { initialValue: location.pathname.startsWith('/painel') },
  );
}
