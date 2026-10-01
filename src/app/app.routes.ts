import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Início · Seggi',
    loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage),
  },
  {
    path: 'categorias',
    title: 'Categorias · Seggi',
    loadComponent: () =>
      import('./features/categories/categories-page').then((m) => m.CategoriesPage),
  },
  {
    path: 'produtos',
    title: 'Produtos · Seggi',
    loadComponent: () => import('./features/products/products-page').then((m) => m.ProductsPage),
  },
  {
    path: 'produtos/:id',
    title: 'Produto · Seggi',
    loadComponent: () =>
      import('./features/products/product-detail-page').then((m) => m.ProductDetailPage),
  },
  {
    path: 'armazens',
    title: 'Armazéns · Seggi',
    loadComponent: () =>
      import('./features/warehouses/warehouses-page').then((m) => m.WarehousesPage),
  },
  {
    path: 'armazens/:id',
    title: 'Armazém · Seggi',
    loadComponent: () =>
      import('./features/warehouses/warehouse-detail-page').then((m) => m.WarehouseDetailPage),
  },
  {
    path: '**',
    title: 'Página não encontrada · Seggi',
    loadComponent: () => import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
