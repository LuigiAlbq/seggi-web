import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../../core/api/generated';
import { WarehouseOccupancyService, WarehouseWithUsage } from './warehouse-occupancy.service';

describe('WarehouseOccupancyService', () => {
  let service: WarehouseOccupancyService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideApi('')],
    });
    service = TestBed.inject(WarehouseOccupancyService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('soma o estoque de cada armazém', () => {
    let result: WarehouseWithUsage[] | undefined;
    service.list().subscribe((value) => (result = value));

    backend.expectOne('/api/warehouse').flush([
      { idWarehouse: 1, name: 'Central', capacity: 100 },
      { idWarehouse: 2, name: 'Norte', capacity: 50 },
    ]);
    backend.expectOne('/api/warehouse/1/stock').flush([{ quantity: 30 }, { quantity: 20 }]);
    backend.expectOne('/api/warehouse/2/stock').flush([]);

    expect(result).toEqual([
      { idWarehouse: 1, name: 'Central', capacity: 100, used: 50 },
      { idWarehouse: 2, name: 'Norte', capacity: 50, used: 0 },
    ]);
  });

  it('não busca estoque quando não há armazéns', () => {
    let result: WarehouseWithUsage[] | undefined;
    service.list().subscribe((value) => (result = value));

    backend.expectOne('/api/warehouse').flush([]);

    expect(result).toEqual([]);
  });
});
