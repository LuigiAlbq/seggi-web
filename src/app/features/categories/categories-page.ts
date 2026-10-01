import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CategoryResponse, CategoryService } from '../../core/api/generated';
import { ignoreNotifiedErrors } from '../../core/http/error.interceptor';
import { EmptyState } from '../../shared/components/empty-state';
import { LoadError } from '../../shared/components/load-error';
import { PageHeader } from '../../shared/components/page-header';
import { valueOr } from '../../shared/utils/resource';
import { CategoryFormDialog } from './category-form-dialog';

@Component({
  selector: 'app-categories-page',
  imports: [
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TableModule,
    TooltipModule,
    CategoryFormDialog,
    EmptyState,
    LoadError,
    PageHeader,
  ],
  templateUrl: './categories-page.html',
})
export class CategoriesPage {
  private readonly api = inject(CategoryService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  protected readonly categories = rxResource({ stream: () => this.api.listCategories() });
  protected readonly rows = computed(() => valueOr(this.categories, []));

  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<CategoryResponse | null>(null);

  protected openCreate(): void {
    this.editing.set(null);
    this.dialogOpen.set(true);
  }

  protected openEdit(category: CategoryResponse): void {
    this.editing.set(category);
    this.dialogOpen.set(true);
  }

  protected confirmDelete(category: CategoryResponse): void {
    this.confirmation.confirm({
      header: 'Excluir categoria',
      message: `Excluir a categoria "${category.name}"? Categorias com produtos vinculados não podem ser excluídas.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Excluir', severity: 'danger' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', text: true },
      accept: () => {
        this.api
          .deleteCategoryById(category.idCategory!)
          .pipe(ignoreNotifiedErrors())
          .subscribe(() => {
            this.messages.add({
              severity: 'success',
              summary: 'Categoria excluída',
              detail: category.name,
            });
            this.categories.reload();
          });
      },
    });
  }
}
