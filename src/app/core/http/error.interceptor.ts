import {
  HttpContext,
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { EMPTY, MonoTypeOperatorFunction, catchError, throwError } from 'rxjs';
import { apiErrorMessage } from './api-error';

/** Desliga o toast automático para uma requisição que trata o próprio erro (ex.: 404 numa tela de detalhe). */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

/** Opções para os services gerados: `api.getProductById(id, 'body', false, withoutErrorToast())`. */
export function withoutErrorToast(): { context: HttpContext } {
  return { context: new HttpContext().set(SKIP_ERROR_TOAST, true) };
}

/**
 * Encerra o fluxo em erros HTTP, que o interceptor já mostrou ao usuário, para não virarem
 * "Unhandled error". Use nas mutações (`api.deleteX(id).pipe(ignoreNotifiedErrors())`).
 */
export function ignoreNotifiedErrors<T>(): MonoTypeOperatorFunction<T> {
  return catchError((error: unknown) =>
    error instanceof HttpErrorResponse ? EMPTY : throwError(() => error),
  );
}

/** Mostra um toast para qualquer erro HTTP e repassa o erro para quem chamou. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messages = inject(MessageService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && !req.context.get(SKIP_ERROR_TOAST)) {
        messages.add({
          severity: 'error',
          summary: 'Não foi possível concluir a operação',
          detail: apiErrorMessage(error),
          life: 6000,
        });
      }
      return throwError(() => error);
    }),
  );
};
