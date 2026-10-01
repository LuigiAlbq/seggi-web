import { Component, effect, inject, input, model, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { finalize } from 'rxjs';
import { CategoryRequest, CategoryResponse, CategoryService } from '../../core/api/generated';
import { ignoreNotifiedErrors } from '../../core/http/error.interceptor';

@Component({
  selector: 'app-category-form-dialog',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    MessageModule,
    TextareaModule,
  ],
  templateUrl: './category-form-dialog.html',
})
export class CategoryFormDialog {
  private readonly api = inject(CategoryService);
  private readonly messages = inject(MessageService);

  readonly visible = model(false);
  /** Categoria em edição; `null` cria uma nova. */
  readonly category = input<CategoryResponse | null>(null);
  readonly saved = output<void>();

  protected readonly saving = signal(false);
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(255)],
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const category = this.category();
        this.form.reset({
          name: category?.name ?? '',
          description: category?.description ?? '',
        });
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, description } = this.form.getRawValue();
    const request: CategoryRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
    };
    const id = this.category()?.idCategory;
    const save$ =
      id == null ? this.api.createCategory(request) : this.api.updateCategoryById(id, request);

    this.saving.set(true);
    save$
      .pipe(
        finalize(() => this.saving.set(false)),
        ignoreNotifiedErrors(),
      )
      .subscribe(() => {
        this.messages.add({
          severity: 'success',
          summary: id == null ? 'Categoria criada' : 'Categoria atualizada',
          detail: request.name,
        });
        this.visible.set(false);
        this.saved.emit();
      });
  }
}
