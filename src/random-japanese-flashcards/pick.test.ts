import { describe, it, expect } from 'vitest';
import { initialIndex, nextIndex } from './pick';

describe('initialIndex', () => {
  it('returns 0 when length is 0', () => {
    expect(initialIndex(0, () => 0.5)).toBe(0);
  });

  it('maps rng to index range', () => {
    expect(initialIndex(10, () => 0)).toBe(0);
    expect(initialIndex(10, () => 0.999)).toBe(9);
  });
});

describe('nextIndex', () => {
  it('returns 0 when length is at most 1', () => {
    expect(nextIndex(0, 0, () => 0.5)).toBe(0);
    expect(nextIndex(1, 0, () => 0.5)).toBe(0);
  });

  it('never returns current for length greater than 1', () => {
    [2, 3, 5, 12].forEach((length) => {
      Array.from({ length }, (_, current) => {
        Array.from({ length: 200 }, () => {
          const picked = nextIndex(length, current, Math.random);
          expect(picked).not.toBe(current);
          expect(picked).toBeGreaterThanOrEqual(0);
          expect(picked).toBeLessThan(length);
        });
      });
    });
  });

  it('is deterministic for fixed rng', () => {
    expect(nextIndex(3, 0, () => 0)).toBe(1);
    expect(nextIndex(3, 1, () => 0)).toBe(0);
    expect(nextIndex(3, 2, () => 0)).toBe(0);
    expect(nextIndex(3, 0, () => 0.99)).toBe(2);
  });
});
