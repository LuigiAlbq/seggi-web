import { DecimalPipe } from '@angular/common';
import { Component, Resource, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { CategoryService, ProductService } from '../../core/api/generated';
import { CapacityBar } from '../../shared/components/capacity-bar';
import { EmptyState } from '../../shared/components/empty-state';
import { LoadError } from '../../shared/components/load-error';
import { PageHeader } from '../../shared/components/page-header';
import { occupancyPercent } from '../../shared/utils/occupancy';
import { valueOr } from '../../shared/utils/resource';
import { WarehouseOccupancyService } from '../warehouses/warehouse-occupancy.service';

interface SummaryCard {
  label: string;
  icon: string;
  route: string;
  /** `undefined` enquanto carrega, `null` se o carregamento falhou. */
  value: number | null | undefined;
}

function summarize<T>(resource: Resource<T | undefined>, fn: (value: T) => number) {
  if (resource.hasValue()) {
    return fn(resource.value());
  }
  return resource.error() ? null : undefined;
}

@Component({
  selector: 'app-home-page',
  imports: [
    DecimalPipe,
    RouterLink,
    ButtonModule,
    SkeletonModule,
    CapacityBar,
    EmptyState,
    LoadError,
    PageHeader,
  ],
  templateUrl: './home-page.html',
})
export class HomePage {
  private readonly categoryApi = inject(CategoryService);
  private readonly productApi = inject(ProductService);
  private readonly occupancy = inject(WarehouseOccupancyService);

  private readonly categories = rxResource({ stream: () => this.categoryApi.listCategories() });
  private readonly products = rxResource({ stream: () => this.productApi.listProducts() });
  protected readonly warehouses = rxResource({ stream: () => this.occupancy.list() });

  /** Armazéns do mais ocupado para o menos ocupado. */
  protected readonly warehouseRows = computed(() =>
    [...valueOr(this.warehouses, [])].sort(
      (a, b) => occupancyPercent(b.used, b.capacity) - occupancyPercent(a.used, a.capacity),
    ),
  );

  protected readonly hasError = computed(
    () => !!(this.categories.error() || this.products.error() || this.warehouses.error()),
  );

  protected readonly cards = computed<SummaryCard[]>(() => [
    {
      label: 'Categorias',
      icon: 'pi pi-tags',
      route: '/categorias',
      value: summarize(this.categories, (items) => items.length),
    },
    {
      label: 'Produtos',
      icon: 'pi pi-box',
      route: '/produtos',
      value: summarize(this.products, (items) => items.length),
    },
    {
      label: 'Armazéns',
      icon: 'pi pi-warehouse',
      route: '/armazens',
      value: summarize(this.warehouses, (items) => items.length),
    },
    {
      label: 'Unidades em estoque',
      icon: 'pi pi-chart-bar',
      route: '/armazens',
      value: summarize(this.warehouses, (items) => items.reduce((sum, w) => sum + w.used, 0)),
    },
  ]);

  protected reloadAll(): void {
    this.categories.reload();
    this.products.reload();
    this.warehouses.reload();
  }
}
