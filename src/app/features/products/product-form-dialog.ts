import { Component, effect, inject, input, model, output, signal } from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { finalize } from 'rxjs';
import {
  CategoryResponse,
  ProductRequest,
  ProductResponse,
  ProductService,
} from '../../core/api/generated';
import { ignoreNotifiedErrors } from '../../core/http/error.interceptor';

@Component({
  selector: 'app-product-form-dialog',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    SelectModule,
  ],
  templateUrl: './product-form-dialog.html',
})
export class ProductFormDialog {
  private readonly api = inject(ProductService);
  private readonly messages = inject(MessageService);

  readonly visible = model(false);
  /** Produto em edição; `null` cria um novo. */
  readonly product = input<ProductResponse | null>(null);
  readonly categories = input<CategoryResponse[]>([]);
  readonly saved = output<void>();

  protected readonly saving = signal(false);
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    categoryId: new FormControl<number | null>(null),
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const product = this.product();
        this.form.reset({
          name: product?.name ?? '',
          price: product?.price ?? null,
          categoryId: product?.categoryId ?? null,
        });
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, price, categoryId } = this.form.getRawValue();
    // `weight` existe no contrato mas o seggi-app ainda não persiste; por isso não é enviado.
    const request: ProductRequest = {
      name: name.trim(),
      price: price!,
      categoryId: categoryId ?? undefined,
    };
    const id = this.product()?.idProduct;
    const save$ =
      id == null ? this.api.createProduct(request) : this.api.updateProductById(id, request);

    this.saving.set(true);
    save$
      .pipe(
        finalize(() => this.saving.set(false)),
        ignoreNotifiedErrors(),
      )
      .subscribe(() => {
        this.messages.add({
          severity: 'success',
          summary: id == null ? 'Produto criado' : 'Produto atualizado',
          detail: request.name,
        });
        this.visible.set(false);
        this.saved.emit();
      });
  }
}
