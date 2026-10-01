import { Page, Route } from '@playwright/test';

/**
 * API em memória que imita o seggi-app (mesmos paths, text/plain nas mutações,
 * regras de capacidade e de exclusão). Permite rodar o e2e sem backend/Postgres.
 * Para testar contra o backend real: E2E_REAL_API=1 npx playwright test
 */
export async function installFakeApi(page: Page): Promise<void> {
  const db = {
    seq: 1,
    categories: [] as { idCategory: number; name: string; description?: string }[],
    products: [] as { idProduct: number; name: string; price: number; categoryId?: number }[],
    warehouses: [] as { idWarehouse: number; name: string; address?: string; capacity: number }[],
    stock: [] as { idStock: number; productId: number; warehouseId: number; quantity: number }[],
  };

  const productView = (p: (typeof db.products)[number]) => ({
    ...p,
    categoryName: db.categories.find((c) => c.idCategory === p.categoryId)?.name,
  });
  const stockView = (s: (typeof db.stock)[number]) => ({
    ...s,
    productName: db.products.find((p) => p.idProduct === s.productId)?.name,
    warehouseName: db.warehouses.find((w) => w.idWarehouse === s.warehouseId)?.name,
  });

  const json = (route: Route, body: unknown) => route.fulfill({ json: body });
  const text = (route: Route, body: string, status = 200) =>
    route.fulfill({ status, contentType: 'text/plain', body });

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const method = request.method();
    const path = new URL(request.url()).pathname;
    const body = request.postDataJSON?.() ?? {};
    let m: RegExpMatchArray | null;

    // Categorias
    if (path === '/api/category') {
      if (method === 'GET') return json(route, db.categories);
      if (db.categories.some((c) => c.name === body.name)) {
        return text(route, 'Error creating category: Category already exists', 400);
      }
      db.categories.push({ idCategory: db.seq++, ...body });
      return text(route, 'Category created with success', 201);
    }
    if ((m = path.match(/^\/api\/category\/(\d+)$/))) {
      const id = Number(m[1]);
      if (method === 'DELETE') {
        if (db.products.some((p) => p.categoryId === id)) {
          return text(route, 'Error deleting category: Category is still in use by products', 404);
        }
        db.categories = db.categories.filter((c) => c.idCategory !== id);
        return text(route, 'Category deleted with success');
      }
    }

    // Produtos
    if (path === '/api/product') {
      if (method === 'GET') return json(route, db.products.map(productView));
      db.products.push({ idProduct: db.seq++, ...body });
      return text(route, 'Product created with success', 201);
    }
    if ((m = path.match(/^\/api\/product\/(\d+)$/)) && method === 'GET') {
      const product = db.products.find((p) => p.idProduct === Number(m![1]));
      return product ? json(route, productView(product)) : route.fulfill({ status: 404 });
    }
    if ((m = path.match(/^\/api\/product\/(\d+)\/stock$/))) {
      const id = Number(m[1]);
      return json(route, db.stock.filter((s) => s.productId === id).map(stockView));
    }

    // Armazéns e estoque
    if (path === '/api/warehouse') {
      if (method === 'GET') return json(route, db.warehouses);
      db.warehouses.push({ idWarehouse: db.seq++, ...body });
      return text(route, 'Warehouse created with success', 201);
    }
    if ((m = path.match(/^\/api\/warehouse\/(\d+)$/)) && method === 'GET') {
      const warehouse = db.warehouses.find((w) => w.idWarehouse === Number(m![1]));
      return warehouse ? json(route, warehouse) : route.fulfill({ status: 404 });
    }
    if ((m = path.match(/^\/api\/warehouse\/(\d+)\/stock$/))) {
      const id = Number(m[1]);
      return json(route, db.stock.filter((s) => s.warehouseId === id).map(stockView));
    }
    if ((m = path.match(/^\/api\/warehouse\/(\d+)\/stock\/(\d+)$/))) {
      const warehouseId = Number(m[1]);
      const productId = Number(m[2]);
      const existing = db.stock.find(
        (s) => s.warehouseId === warehouseId && s.productId === productId,
      );
      if (method === 'DELETE') {
        db.stock = db.stock.filter((s) => s !== existing);
        return text(route, 'Stock removed with success');
      }
      const warehouse = db.warehouses.find((w) => w.idWarehouse === warehouseId)!;
      const others = db.stock
        .filter((s) => s.warehouseId === warehouseId && s !== existing)
        .reduce((sum, s) => sum + s.quantity, 0);
      if (others + body.quantity > warehouse.capacity) {
        return text(route, 'Error setting stock: Warehouse capacity exceeded', 400);
      }
      if (existing) {
        existing.quantity = body.quantity;
      } else {
        db.stock.push({ idStock: db.seq++, warehouseId, productId, quantity: body.quantity });
      }
      return text(route, 'Stock updated with success');
    }

    return route.fulfill({ status: 501, contentType: 'text/plain', body: `Fake API: ${method} ${path}` });
  });
}
