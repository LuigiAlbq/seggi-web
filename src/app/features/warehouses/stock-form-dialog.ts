import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { finalize } from 'rxjs';
import {
  ProductResponse,
  StockResponse,
  StockService,
  WarehouseResponse,
} from '../../core/api/generated';
import { ignoreNotifiedErrors } from '../../core/http/error.interceptor';
import { totalQuantity } from '../../shared/utils/occupancy';

/** Define (cria ou substitui) a quantidade de um produto em um armazém. */
@Component({
  selector: 'app-stock-form-dialog',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    MessageModule,
    SelectModule,
  ],
  templateUrl: './stock-form-dialog.html',
})
export class StockFormDialog {
  private readonly api = inject(StockService);
  private readonly messages = inject(MessageService);

  readonly visible = model(false);
  readonly warehouse = input.required<WarehouseResponse>();
  /** Estoque atual do armazém, usado para calcular a capacidade livre. */
  readonly stock = input<StockResponse[]>([]);
  readonly products = input<ProductResponse[]>([]);
  /** Item em edição; `null` permite escolher o produto. */
  readonly item = input<StockResponse | null>(null);
  readonly saved = output<void>();

  protected readonly saving = signal(false);
  protected readonly form = new FormGroup({
    productId: new FormControl<number | null>(null, Validators.required),
    quantity: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
      (control: AbstractControl) => this.withinCapacity(control),
    ]),
  });

  private readonly productId = toSignal(this.form.controls.productId.valueChanges, {
    initialValue: null,
  });

  /** Quantidade atual do produto selecionado neste armazém. */
  protected readonly currentQuantity = computed(() => {
    const productId = this.productId();
    return this.stock().find((s) => s.productId === productId)?.quantity ?? 0;
  });

  /** Máximo que o produto selecionado pode ter sem exceder a capacidade do armazém. */
  protected readonly maxQuantity = computed(() => {
    const othersUsed = totalQuantity(this.stock()) - this.currentQuantity();
    return Math.max(0, (this.warehouse().capacity ?? 0) - othersUsed);
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const item = this.item();
        this.form.reset({
          productId: item?.productId ?? null,
          quantity: item?.quantity ?? null,
        });
        if (item) {
          this.form.controls.productId.disable();
        } else {
          this.form.controls.productId.enable();
        }
      }
    });

    // Trocar o produto muda a capacidade livre; revalida a quantidade.
    this.form.controls.productId.valueChanges.subscribe(() =>
      this.form.controls.quantity.updateValueAndValidity(),
    );
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { productId, quantity } = this.form.getRawValue();
    const warehouseId = this.warehouse().idWarehouse!;
    const productName = this.products().find((p) => p.idProduct === productId)?.name;

    this.saving.set(true);
    this.api
      .setStock(warehouseId, productId!, { quantity: quantity! })
      .pipe(
        finalize(() => this.saving.set(false)),
        ignoreNotifiedErrors(),
      )
      .subscribe(() => {
        this.messages.add({
          severity: 'success',
          summary: 'Estoque atualizado',
          detail: `${productName ?? 'Produto'}: ${quantity} un.`,
        });
        this.visible.set(false);
        this.saved.emit();
      });
  }

  private withinCapacity(control: AbstractControl): ValidationErrors | null {
    const value = control.value as number | null;
    // O validator roda na construção do form, antes de os inputs existirem.
    if (value == null || !this.form) {
      return null;
    }
    const max = this.maxQuantity();
    return value > max ? { capacity: { max } } : null;
  }
}
