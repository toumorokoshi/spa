import { describe, it, expect } from 'vitest';
import { initialIndexFromPool, nextIndexInPool, poolIndices } from './pool';
import { KANA_WORDS } from './words';

describe('poolIndices', () => {
  it('returns all indices when not starred-only', () => {
    const pool = poolIndices(KANA_WORDS, new Set(['x']), false);
    expect(pool.length).toBe(KANA_WORDS.length);
    expect(pool[0]).toBe(0);
    expect(pool[pool.length - 1]).toBe(KANA_WORDS.length - 1);
  });

  it('returns only starred word indices when starred-only', () => {
    const w0 = KANA_WORDS[0];
    const w2 = KANA_WORDS[2];
    const pool = poolIndices(KANA_WORDS, new Set([w0, w2]), true);
    expect(pool).toEqual([0, 2]);
  });
});

describe('initialIndexFromPool', () => {
  it('returns 0 for empty pool', () => {
    expect(initialIndexFromPool([], () => 0.5)).toBe(0);
  });

  it('picks from pool', () => {
    expect(initialIndexFromPool([1, 2, 3], () => 0)).toBe(1);
    expect(initialIndexFromPool([1, 2, 3], () => 0.99)).toBe(3);
  });
});

describe('nextIndexInPool', () => {
  it('handles empty pool', () => {
    expect(nextIndexInPool([], 0, () => 0.5)).toBe(0);
  });

  it('never returns current when pool has more than one', () => {
    const pool = [2, 3, 5, 12];
    pool.forEach((current) => {
      Array.from({ length: 200 }, () => {
        const picked = nextIndexInPool(pool, current, Math.random);
        expect(picked).not.toBe(current);
        expect(pool.includes(picked)).toBe(true);
      });
    });
  });

  it('is deterministic for fixed rng', () => {
    expect(nextIndexInPool([0, 1], 0, () => 0)).toBe(1);
    expect(nextIndexInPool([0, 1, 2], 1, () => 0)).toBe(0);
  });
});
