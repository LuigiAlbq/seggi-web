import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { WarehouseResponse, WarehouseService } from '../../core/api/generated';
import { ignoreNotifiedErrors } from '../../core/http/error.interceptor';
import { CapacityBar } from '../../shared/components/capacity-bar';
import { EmptyState } from '../../shared/components/empty-state';
import { LoadError } from '../../shared/components/load-error';
import { PageHeader } from '../../shared/components/page-header';
import { valueOr } from '../../shared/utils/resource';
import { WarehouseFormDialog } from './warehouse-form-dialog';
import { WarehouseOccupancyService } from './warehouse-occupancy.service';

@Component({
  selector: 'app-warehouses-page',
  imports: [
    DecimalPipe,
    RouterLink,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TableModule,
    TooltipModule,
    CapacityBar,
    EmptyState,
    LoadError,
    PageHeader,
    WarehouseFormDialog,
  ],
  templateUrl: './warehouses-page.html',
})
export class WarehousesPage {
  private readonly api = inject(WarehouseService);
  private readonly occupancy = inject(WarehouseOccupancyService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  protected readonly warehouses = rxResource({ stream: () => this.occupancy.list() });
  protected readonly rows = computed(() => valueOr(this.warehouses, []));

  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<WarehouseResponse | null>(null);

  protected openCreate(): void {
    this.editing.set(null);
    this.dialogOpen.set(true);
  }

  protected openEdit(warehouse: WarehouseResponse): void {
    this.editing.set(warehouse);
    this.dialogOpen.set(true);
  }

  protected confirmDelete(warehouse: WarehouseResponse): void {
    this.confirmation.confirm({
      header: 'Excluir armazém',
      message: `Excluir o armazém "${warehouse.name}"? Armazéns com estoque não podem ser excluídos.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Excluir', severity: 'danger' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', text: true },
      accept: () => {
        this.api
          .deleteWarehouseById(warehouse.idWarehouse!)
          .pipe(ignoreNotifiedErrors())
          .subscribe(() => {
            this.messages.add({
              severity: 'success',
              summary: 'Armazém excluído',
              detail: warehouse.name,
            });
            this.warehouses.reload();
          });
      },
    });
  }
}
