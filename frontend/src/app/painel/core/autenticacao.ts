import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessaoService } from './sessao.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(`${environment.apiUrl}/admin`)) return next(req);
  const sessao = inject(SessaoService);
  const router = inject(Router);
  const token = sessao.token();
  const pedido = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(pedido).pipe(
    catchError((erro: HttpErrorResponse) => {
      if (erro.status === 401) {
        sessao.sair();
        router.navigate(['/painel/entrar'], { queryParams: { voltar: router.url } });
      }
      return throwError(() => erro);
    }),
  );
};

export const somenteLogado: CanActivateFn = (_rota, estado) => {
  const sessao = inject(SessaoService);
  if (sessao.valida()) return true;
  return inject(Router).createUrlTree(['/painel/entrar'], { queryParams: { voltar: estado.url } });
};

export function mensagemDeErro(erro: unknown, padrao = 'Não foi possível concluir. Tente de novo.'): string {
  if (erro instanceof HttpErrorResponse) {
    if (erro.status === 0) return 'Sem conexão com o servidor.';
    const detalhe = (erro.error as { detail?: string } | null)?.detail;
    if (detalhe) return detalhe;
  }
  return padrao;
}

export function codigoDeErro(erro: unknown): string | null {
  return erro instanceof HttpErrorResponse ? ((erro.error as { codigo?: string } | null)?.codigo ?? null) : null;
}
