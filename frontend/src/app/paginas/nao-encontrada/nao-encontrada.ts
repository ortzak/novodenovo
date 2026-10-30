import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nao-encontrada',
  imports: [RouterLink],
  template: `
    <section class="container caixa">
      <p class="spec codigo">ERRO 404</p>
      <h1>Essa página foi desmontada.</h1>
      <p class="suave">O endereço não existe ou mudou de lugar. Os notebooks continuam na vitrine.</p>
      <div class="acoes">
        <a class="btn btn-primario" routerLink="/">Ver catálogo</a>
        <a class="btn btn-secundario" routerLink="/servicos">Serviços</a>
      </div>
    </section>
  `,
  styles: `
    .caixa { padding-top: 96px; padding-bottom: 48px; display: flex; flex-direction: column; gap: 14px; align-items: flex-start; }
    .codigo { color: var(--destaque); }
    .acoes { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }
  `,
})
export class NaoEncontrada {}
