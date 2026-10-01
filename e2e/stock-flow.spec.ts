import { expect, test } from '@playwright/test';
import { installFakeApi } from './fake-api';

test.beforeEach(async ({ page }) => {
  if (!process.env['E2E_REAL_API']) {
    await installFakeApi(page);
  }
});

test('cadastra categoria, produto e armazém e controla o estoque', async ({ page }) => {
  const suffix = Date.now().toString().slice(-6);
  const category = `Bebidas ${suffix}`;
  const product = `Café ${suffix}`;
  const warehouse = `Central ${suffix}`;

  // Categoria
  await page.goto('/categorias');
  await page.getByRole('button', { name: 'Nova categoria' }).click();
  await page.getByLabel('Nome').fill(category);
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText('Categoria criada')).toBeVisible();
  await expect(page.getByRole('cell', { name: category })).toBeVisible();

  // Produto vinculado à categoria
  await page.getByRole('link', { name: 'Produtos' }).click();
  await page.getByRole('button', { name: 'Novo produto' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nome').fill(product);
  await dialog.getByLabel('Preço').pressSequentially('25,90');
  await dialog.getByLabel('Categoria').click();
  await page.getByRole('option', { name: category }).click();
  await dialog.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText('Produto criado')).toBeVisible();
  const productRow = page.getByRole('row', { name: new RegExp(product) });
  await expect(productRow).toContainText(category);
  await expect(productRow).toContainText('R$ 25,90');

  // Armazém com capacidade 10
  await page.getByRole('link', { name: 'Armazéns' }).click();
  await page.getByRole('button', { name: 'Novo armazém' }).click();
  await page.getByRole('dialog').getByLabel('Nome').fill(warehouse);
  await page.getByLabel('Capacidade (unidades)').pressSequentially('10');
  await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText('Armazém criado')).toBeVisible();

  // Estoque: 8 cabe na capacidade
  await page.getByRole('link', { name: warehouse }).click();
  await page.getByRole('button', { name: 'Definir quantidade' }).click();
  await page.getByLabel('Produto').click();
  await page.getByRole('option', { name: product }).click();
  await page.getByRole('spinbutton', { name: 'Quantidade' }).pressSequentially('8');
  await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText('Estoque atualizado')).toBeVisible();
  await expect(page.getByRole('row', { name: new RegExp(product) })).toContainText('8');
  await expect(page.getByText('8 / 10 un. (80%)')).toBeVisible();

  // 12 excede a capacidade: o formulário bloqueia antes de chamar a API
  await page.getByRole('button', { name: 'Alterar quantidade' }).click();
  const quantity = page.getByRole('spinbutton', { name: 'Quantidade' });
  await quantity.selectText();
  await quantity.pressSequentially('12');
  await expect(page.getByText('Excede a capacidade do armazém (máximo 10 un.)')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click();

  // O detalhe do produto mostra o estoque por armazém
  await page.getByRole('link', { name: product }).click();
  await expect(page.getByRole('heading', { name: product })).toBeVisible();
  await expect(page.getByRole('row', { name: new RegExp(warehouse) })).toContainText('8');

  // Categoria em uso não pode ser excluída: o erro do backend aparece em toast
  await page.getByRole('link', { name: 'Categorias' }).click();
  await page
    .getByRole('row', { name: new RegExp(category) })
    .getByRole('button', { name: 'Excluir' })
    .click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Excluir' }).click();
  await expect(page.getByText('Não foi possível concluir a operação')).toBeVisible();
  await expect(page.getByText(/still in use by products/)).toBeVisible();
});
