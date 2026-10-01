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
import { finalize } from 'rxjs';
import { WarehouseRequest, WarehouseResponse, WarehouseService } from '../../core/api/generated';
import { ignoreNotifiedErrors } from '../../core/http/error.interceptor';

@Component({
  selector: 'app-warehouse-form-dialog',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
  ],
  templateUrl: './warehouse-form-dialog.html',
})
export class WarehouseFormDialog {
  private readonly api = inject(WarehouseService);
  private readonly messages = inject(MessageService);

  readonly visible = model(false);
  /** Armazém em edição; `null` cria um novo. */
  readonly warehouse = input<WarehouseResponse | null>(null);
  readonly saved = output<void>();

  protected readonly saving = signal(false);
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    address: [''],
    capacity: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const warehouse = this.warehouse();
        this.form.reset({
          name: warehouse?.name ?? '',
          address: warehouse?.address ?? '',
          capacity: warehouse?.capacity ?? null,
        });
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, address, capacity } = this.form.getRawValue();
    const request: WarehouseRequest = {
      name: name.trim(),
      address: address.trim() || undefined,
      capacity: capacity!,
    };
    const id = this.warehouse()?.idWarehouse;
    const save$ =
      id == null ? this.api.createWarehouse(request) : this.api.updateWarehouseById(id, request);

    this.saving.set(true);
    save$
      .pipe(
        finalize(() => this.saving.set(false)),
        ignoreNotifiedErrors(),
      )
      .subscribe(() => {
        this.messages.add({
          severity: 'success',
          summary: id == null ? 'Armazém criado' : 'Armazém atualizado',
          detail: request.name,
        });
        this.visible.set(false);
        this.saved.emit();
      });
  }
}
