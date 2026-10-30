import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Abertura } from './layout/abertura';
import { Cabecalho } from './layout/cabecalho';
import { Rodape } from './layout/rodape';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Abertura, Cabecalho, Rodape],
  template: `
    <app-abertura />
    <app-cabecalho />
    <main><router-outlet /></main>
    <app-rodape />
  `,
  styles: `main { min-height: 60vh; }`,
})
export class App {}
