import { describe, it, expect } from 'vitest';
import { pureMaximin, solveZeroSum } from './matrix-game';

describe('matrix-game basic solutions', () => {
  it('solves pure saddle point', () => {
    const P = [
      [2, 1],
      [3, 4]
    ];
    const sol = solveZeroSum(P);
    expect(sol.value).toBeCloseTo(3, 5);
    expect(sol.aStrategy[1]).toBeCloseTo(1, 5);
    expect(sol.bStrategy[0]).toBeCloseTo(1, 5);
  });

  it('solves matching pennies', () => {
    const P = [
      [1, -1],
      [-1, 1]
    ];
    const sol = solveZeroSum(P);
    expect(sol.value).toBeCloseTo(0, 5);
    expect(sol.aStrategy[0]).toBeCloseTo(0.5, 4);
    expect(sol.aStrategy[1]).toBeCloseTo(0.5, 4);
    expect(sol.bStrategy[0]).toBeCloseTo(0.5, 4);
    expect(sol.bStrategy[1]).toBeCloseTo(0.5, 4);
  });

  it('solves mixed 2x2 via closed form', () => {
    const P = [
      [3, 2],
      [1, 4]
    ];
    const sol = solveZeroSum(P);
    expect(sol.value).toBeCloseTo(2.5, 5);
    expect(sol.aStrategy[0]).toBeCloseTo(0.75, 4);
    expect(sol.aStrategy[1]).toBeCloseTo(0.25, 4);
  });
});

describe('matrix-game general LP solutions', () => {
  it('solves rock paper scissors', () => {
    const P = [
      [0, -1, 1],
      [1, 0, -1],
      [-1, 1, 0]
    ];
    const sol = solveZeroSum(P);
    expect(sol.value).toBeCloseTo(0, 5);
    expect(sol.aStrategy[0]).toBeCloseTo(1 / 3, 3);
    expect(sol.aStrategy[1]).toBeCloseTo(1 / 3, 3);
    expect(sol.aStrategy[2]).toBeCloseTo(1 / 3, 3);
  });

  it('computes pure maximin correctly', () => {
    const P = [
      [3, 2],
      [1, 4]
    ];
    const pm = pureMaximin(P);
    expect(pm.value).toBe(2);
    expect(pm.index).toBe(0);
  });

  it('solves rectangular matrix games', () => {
    const P = [
      [3, 0],
      [0, 2],
      [1, 1]
    ];
    const sol = solveZeroSum(P);
    expect(sol.value).toBeGreaterThan(1);
    const sumA = sol.aStrategy.reduce((acc, x) => acc + x, 0);
    const sumB = sol.bStrategy.reduce((acc, y) => acc + y, 0);
    expect(sumA).toBeCloseTo(1, 4);
    expect(sumB).toBeCloseTo(1, 4);
  });
});
