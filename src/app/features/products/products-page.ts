import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CategoryService, ProductResponse, ProductService } from '../../core/api/generated';
import { ignoreNotifiedErrors } from '../../core/http/error.interceptor';
import { EmptyState } from '../../shared/components/empty-state';
import { LoadError } from '../../shared/components/load-error';
import { PageHeader } from '../../shared/components/page-header';
import { valueOr } from '../../shared/utils/resource';
import { ProductFormDialog } from './product-form-dialog';

@Component({
  selector: 'app-products-page',
  imports: [
    CurrencyPipe,
    RouterLink,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    TooltipModule,
    EmptyState,
    LoadError,
    PageHeader,
    ProductFormDialog,
  ],
  templateUrl: './products-page.html',
})
export class ProductsPage {
  private readonly api = inject(ProductService);
  private readonly categoryApi = inject(CategoryService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  protected readonly products = rxResource({ stream: () => this.api.listProducts() });
  protected readonly rows = computed(() => valueOr(this.products, []));

  private readonly categoriesResource = rxResource({
    stream: () => this.categoryApi.listCategories(),
  });
  protected readonly categories = computed(() => valueOr(this.categoriesResource, []));

  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<ProductResponse | null>(null);

  protected openCreate(): void {
    this.editing.set(null);
    this.dialogOpen.set(true);
  }

  protected openEdit(product: ProductResponse): void {
    this.editing.set(product);
    this.dialogOpen.set(true);
  }

  protected confirmDelete(product: ProductResponse): void {
    this.confirmation.confirm({
      header: 'Excluir produto',
      message: `Excluir o produto "${product.name}"? Produtos com estoque ou em pedidos não podem ser excluídos.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Excluir', severity: 'danger' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', text: true },
      accept: () => {
        this.api
          .deleteProductById(product.idProduct!)
          .pipe(ignoreNotifiedErrors())
          .subscribe(() => {
            this.messages.add({
              severity: 'success',
              summary: 'Produto excluído',
              detail: product.name,
            });
            this.products.reload();
          });
      },
    });
  }
}
