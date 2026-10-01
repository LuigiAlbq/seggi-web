import { occupancyLevel, occupancyPercent, totalQuantity } from './occupancy';

describe('occupancy', () => {
  it('calcula o percentual arredondado e limitado a 100', () => {
    expect(occupancyPercent(8, 10)).toBe(80);
    expect(occupancyPercent(1, 3)).toBe(33);
    expect(occupancyPercent(15, 10)).toBe(100);
  });

  it('trata capacidade zero ou ausente como 0%', () => {
    expect(occupancyPercent(5, 0)).toBe(0);
    expect(occupancyPercent(5, undefined)).toBe(0);
  });

  it('classifica o nível de ocupação', () => {
    expect(occupancyLevel(79)).toBe('ok');
    expect(occupancyLevel(80)).toBe('warn');
    expect(occupancyLevel(100)).toBe('full');
  });

  it('soma as quantidades ignorando valores ausentes', () => {
    expect(totalQuantity([{ quantity: 3 }, { quantity: 4 }, {}])).toBe(7);
    expect(totalQuantity([])).toBe(0);
  });
});
