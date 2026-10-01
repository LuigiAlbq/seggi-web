import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProductService, StockService } from '../../core/api/generated';
import { withoutErrorToast } from '../../core/http/error.interceptor';
import { EmptyState } from '../../shared/components/empty-state';
import { LoadError } from '../../shared/components/load-error';
import { PageHeader } from '../../shared/components/page-header';
import { totalQuantity } from '../../shared/utils/occupancy';
import { httpStatus, valueOr } from '../../shared/utils/resource';

@Component({
  selector: 'app-product-detail-page',
  imports: [
    CurrencyPipe,
    DecimalPipe,
    RouterLink,
    ButtonModule,
    SkeletonModule,
    TableModule,
    TagModule,
    EmptyState,
    LoadError,
    PageHeader,
  ],
  templateUrl: './product-detail-page.html',
})
export class ProductDetailPage {
  private readonly api = inject(ProductService);
  private readonly stockApi = inject(StockService);

  /** Parâmetro `:id` da rota (via withComponentInputBinding). */
  readonly id = input.required<string>();
  private readonly productId = computed(() => Number(this.id()));

  protected readonly product = rxResource({
    params: () => this.productId(),
    stream: ({ params: id }) => this.api.getProductById(id, 'body', false, withoutErrorToast()),
  });
  protected readonly notFound = computed(() => httpStatus(this.product.error()) === 404);

  protected readonly stock = rxResource({
    params: () => this.productId(),
    stream: ({ params: id }) =>
      this.stockApi.listProductStock(id, 'body', false, withoutErrorToast()),
  });
  protected readonly stockRows = computed(() => valueOr(this.stock, []));
  protected readonly totalUnits = computed(() => totalQuantity(this.stockRows()));
}
