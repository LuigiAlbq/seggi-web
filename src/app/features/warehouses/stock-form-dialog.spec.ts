import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { provideApi } from '../../core/api/generated';
import { StockFormDialog } from './stock-form-dialog';

describe('StockFormDialog', () => {
  let fixture: ComponentFixture<StockFormDialog>;
  let dialog: StockFormDialog;
  let backend: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockFormDialog],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideApi(''), MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(StockFormDialog);
    dialog = fixture.componentInstance;
    backend = TestBed.inject(HttpTestingController);

    // Armazém com capacidade 100: produto 1 ocupa 30 e produto 2 ocupa 50 → 20 livres.
    fixture.componentRef.setInput('warehouse', { idWarehouse: 7, name: 'Central', capacity: 100 });
    fixture.componentRef.setInput('stock', [
      { productId: 1, productName: 'Arroz', quantity: 30 },
      { productId: 2, productName: 'Feijão', quantity: 50 },
    ]);
    fixture.componentRef.setInput('products', [
      { idProduct: 1, name: 'Arroz' },
      { idProduct: 2, name: 'Feijão' },
      { idProduct: 3, name: 'Café' },
    ]);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
  });

  afterEach(() => backend.verify());

  const form = () => dialog['form'];

  it('permite até a capacidade livre para um produto novo', () => {
    form().setValue({ productId: 3, quantity: 20 });
    expect(form().valid).toBe(true);

    form().controls.quantity.setValue(21);
    expect(form().controls.quantity.hasError('capacity')).toBe(true);
  });

  it('desconta a quantidade atual do próprio produto ao alterar', () => {
    // Produto 1 já tem 30: pode ir até 30 + 20 livres = 50.
    form().setValue({ productId: 1, quantity: 50 });
    expect(form().valid).toBe(true);

    form().controls.quantity.setValue(51);
    expect(form().controls.quantity.hasError('capacity')).toBe(true);
  });

  it('revalida a quantidade ao trocar de produto', () => {
    form().setValue({ productId: 1, quantity: 45 });
    expect(form().valid).toBe(true);

    form().controls.productId.setValue(3);
    expect(form().controls.quantity.hasError('capacity')).toBe(true);
  });

  it('envia PUT /api/warehouse/{id}/stock/{productId} com a quantidade', () => {
    const saved = vi.fn();
    dialog.saved.subscribe(saved);

    form().setValue({ productId: 3, quantity: 12 });
    dialog['submit']();

    const req = backend.expectOne('/api/warehouse/7/stock/3');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ quantity: 12 });
    req.flush('Stock updated with success');

    expect(saved).toHaveBeenCalledOnce();
    expect(dialog.visible()).toBe(false);
  });
});
