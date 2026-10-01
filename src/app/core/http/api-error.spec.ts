import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage } from './api-error';

describe('apiErrorMessage', () => {
  it('usa o texto de negócio retornado pelo seggi-app', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: 'Error setting stock: Warehouse capacity exceeded',
    });
    expect(apiErrorMessage(error)).toBe('Error setting stock: Warehouse capacity exceeded');
  });

  it('avisa quando o servidor está inacessível', () => {
    const error = new HttpErrorResponse({ status: 0 });
    expect(apiErrorMessage(error)).toContain('Não foi possível conectar');
  });

  it('usa a mensagem do JSON de erro do Spring quando existe', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { status: 400, error: 'Bad Request', message: 'name: must not be blank' },
    });
    expect(apiErrorMessage(error)).toBe('name: must not be blank');
  });

  it('cai numa mensagem genérica por status quando o corpo vem vazio', () => {
    expect(apiErrorMessage(new HttpErrorResponse({ status: 404, error: '' }))).toBe(
      'Registro não encontrado.',
    );
    expect(
      apiErrorMessage(
        new HttpErrorResponse({ status: 400, error: { status: 400, error: 'Bad Request' } }),
      ),
    ).toContain('Dados inválidos');
    expect(apiErrorMessage(new HttpErrorResponse({ status: 503 }))).toContain('Erro interno');
  });
});
