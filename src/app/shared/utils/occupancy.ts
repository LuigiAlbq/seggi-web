/** Percentual (0–100, inteiro) de ocupação de um armazém. Capacidade zero ou inválida conta como 0%. */
export function occupancyPercent(used: number, capacity: number | undefined): number {
  if (!capacity || capacity <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((used / capacity) * 100));
}

export type OccupancyLevel = 'ok' | 'warn' | 'full';

export function occupancyLevel(percent: number): OccupancyLevel {
  if (percent >= 100) {
    return 'full';
  }
  return percent >= 80 ? 'warn' : 'ok';
}

/** Soma as quantidades de uma lista de itens de estoque. */
export function totalQuantity(items: readonly { quantity?: number }[]): number {
  return items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
}
