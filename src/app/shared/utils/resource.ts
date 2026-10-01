import { HttpErrorResponse } from '@angular/common/http';
import { Resource } from '@angular/core';

/**
 * Lê o valor de um resource sem lançar exceção: no estado de erro, `value()` lança
 * ResourceValueError, então devolvemos o fallback (o erro já foi notificado pelo interceptor).
 */
export function valueOr<T>(resource: Resource<T | undefined>, fallback: T): T {
  return resource.hasValue() ? resource.value() : fallback;
}

/** Status HTTP do erro de um resource, ou `undefined` se não for um erro HTTP. */
export function httpStatus(error: Error | undefined): number | undefined {
  const httpError = error instanceof HttpErrorResponse ? error : error?.cause;
  return httpError instanceof HttpErrorResponse ? httpError.status : undefined;
}
