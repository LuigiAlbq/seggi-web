import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Ponto de extensão para autenticação. O seggi-app ainda não tem login;
 * quando tiver (Spring Security + JWT), este interceptor adiciona o header Authorization.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => next(req);
