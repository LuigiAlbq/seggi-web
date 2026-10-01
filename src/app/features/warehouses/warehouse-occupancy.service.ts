import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { StockService, WarehouseResponse, WarehouseService } from '../../core/api/generated';
import { totalQuantity } from '../../shared/utils/occupancy';

export interface WarehouseWithUsage extends WarehouseResponse {
  /** Soma das quantidades de todos os produtos estocados no armazém. */
  used: number;
}

/**
 * Lista os armazéns com a ocupação de cada um.
 * O seggi-app não tem endpoint agregado, então busca o estoque de cada armazém (1 + N chamadas).
 */
@Injectable({ providedIn: 'root' })
export class WarehouseOccupancyService {
  private readonly warehouseApi = inject(WarehouseService);
  private readonly stockApi = inject(StockService);

  list(): Observable<WarehouseWithUsage[]> {
    return this.warehouseApi
      .listWarehouses()
      .pipe(
        switchMap((warehouses) =>
          warehouses.length === 0
            ? of([])
            : forkJoin(
                warehouses.map((warehouse) =>
                  this.stockApi
                    .listWarehouseStock(warehouse.idWarehouse!)
                    .pipe(map((stock) => ({ ...warehouse, used: totalQuantity(stock) }))),
                ),
              ),
        ),
      );
  }
}
