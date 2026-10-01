import { HttpErrorResponse } from '@angular/common/http';

/**
 * Traduz um erro HTTP do seggi-app em mensagem para o usuário.
 *
 * O backend responde erros de negócio em text/plain ("Error creating category: ..."),
 * erros de validação no JSON padrão do Spring e alguns 404 com corpo vazio.
 */
export function apiErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Não foi possível conectar ao servidor. Verifique se o seggi-app está em execução.';
  }

  const body: unknown = error.error;
  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }
  if (isSpringError(body) && body.message) {
    return body.message;
  }

  switch (error.status) {
    case 400:
      return 'Dados inválidos. Revise os campos e tente novamente.';
    case 404:
      return 'Registro não encontrado.';
    case 409:
      return 'O registro está em uso e não pode ser alterado.';
    default:
      return error.status >= 500
        ? 'Erro interno no servidor. Tente novamente em instantes.'
        : `Erro inesperado (${error.status}).`;
  }
}

interface SpringError {
  message?: string;
}

function isSpringError(body: unknown): body is SpringError {
  return typeof body === 'object' && body !== null && 'status' in body;
}
