import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { errorInterceptor, withoutErrorToast } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let messages: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        MessageService,
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    messages = TestBed.inject(MessageService);
    vi.spyOn(messages, 'add');
  });

  afterEach(() => backend.verify());

  it('mostra um toast com a mensagem do backend e repassa o erro', () => {
    const onError = vi.fn();
    http.delete('/api/category/1', { responseType: 'text' }).subscribe({ error: onError });

    backend
      .expectOne('/api/category/1')
      .flush('Error deleting category: still in use by products', {
        status: 404,
        statusText: 'Not Found',
      });

    expect(messages.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        detail: 'Error deleting category: still in use by products',
      }),
    );
    expect(onError).toHaveBeenCalledOnce();
  });

  it('não mostra toast quando a requisição pede withoutErrorToast()', () => {
    const onError = vi.fn();
    http.get('/api/product/99', withoutErrorToast()).subscribe({ error: onError });

    backend.expectOne('/api/product/99').flush(null, { status: 404, statusText: 'Not Found' });

    expect(messages.add).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledOnce();
  });
});
