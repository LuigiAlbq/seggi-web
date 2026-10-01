import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import {
  ProductService,
  StockResponse,
  StockService,
  WarehouseService,
} from '../../core/api/generated';
import { ignoreNotifiedErrors, withoutErrorToast } from '../../core/http/error.interceptor';
import { CapacityBar } from '../../shared/components/capacity-bar';
import { EmptyState } from '../../shared/components/empty-state';
import { LoadError } from '../../shared/components/load-error';
import { PageHeader } from '../../shared/components/page-header';
import { totalQuantity } from '../../shared/utils/occupancy';
import { httpStatus, valueOr } from '../../shared/utils/resource';
import { StockFormDialog } from './stock-form-dialog';

@Component({
  selector: 'app-warehouse-detail-page',
  imports: [
    DecimalPipe,
    RouterLink,
    ButtonModule,
    SkeletonModule,
    TableModule,
    TooltipModule,
    CapacityBar,
    EmptyState,
    LoadError,
    PageHeader,
    StockFormDialog,
  ],
  templateUrl: './warehouse-detail-page.html',
})
export class WarehouseDetailPage {
  private readonly api = inject(WarehouseService);
  private readonly stockApi = inject(StockService);
  private readonly productApi = inject(ProductService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  /** Parâmetro `:id` da rota (via withComponentInputBinding). */
  readonly id = input.required<string>();
  private readonly warehouseId = computed(() => Number(this.id()));

  protected readonly warehouse = rxResource({
    params: () => this.warehouseId(),
    stream: ({ params: id }) => this.api.getWarehouseById(id, 'body', false, withoutErrorToast()),
  });
  protected readonly notFound = computed(() => httpStatus(this.warehouse.error()) === 404);

  protected readonly stock = rxResource({
    params: () => this.warehouseId(),
    stream: ({ params: id }) =>
      this.stockApi.listWarehouseStock(id, 'body', false, withoutErrorToast()),
  });
  protected readonly stockRows = computed(() => valueOr(this.stock, []));
  protected readonly used = computed(() => totalQuantity(this.stockRows()));

  private readonly productsResource = rxResource({ stream: () => this.productApi.listProducts() });
  protected readonly products = computed(() => valueOr(this.productsResource, []));

  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<StockResponse | null>(null);

  protected openSet(item: StockResponse | null): void {
    this.editing.set(item);
    this.dialogOpen.set(true);
  }

  protected confirmRemove(item: StockResponse): void {
    this.confirmation.confirm({
      header: 'Remover do armazém',
      message: `Remover "${item.productName}" deste armazém? As ${item.quantity} unidades deixam de constar no estoque.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Remover', severity: 'danger' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', text: true },
      accept: () => {
        this.stockApi
          .deleteStock(this.warehouseId(), item.productId!)
          .pipe(ignoreNotifiedErrors())
          .subscribe(() => {
            this.messages.add({
              severity: 'success',
              summary: 'Produto removido do armazém',
              detail: item.productName,
            });
            this.stock.reload();
          });
      },
    });
  }
}
