import { describe, it, expect } from 'vitest';
import { createSolver } from './solver';
import { SAMPLE_8V8_MATRIX, SAMPLE_4V4_MATRIX } from './sample-data';

describe('pairing solver', () => {
  it('solves 4v4 uniform matrix', () => {
    const scores = Array.from({ length: 4 }, () => new Array(4).fill(10));
    const solver = createSolver(scores);
    const sol = solver.solve();
    expect(sol.value).toBeCloseTo(40, 4);
    expect(sol.exploitabilityGap).toBeCloseTo(0, 4);
  });

  it('solves 6v6 uniform matrix', () => {
    const scores = Array.from({ length: 6 }, () => new Array(6).fill(10));
    const solver = createSolver(scores);
    const sol = solver.solve();
    expect(sol.value).toBeCloseTo(60, 4);
  });

  it('verifies dominant player payoff in 4v4', () => {
    const scores = Array.from({ length: 4 }, () => new Array(4).fill(8));
    scores[0] = new Array(4).fill(18);
    const solver = createSolver(scores);
    const sol = solver.solve();
    expect(sol.value).toBeCloseTo(42, 4);
  });

  it('proves single bad matchup is avoidable in 4v4', () => {
    const scores = Array.from({ length: 4 }, () => new Array(4).fill(10));
    scores[0][0] = 2;
    const solver = createSolver(scores);
    const sol = solver.solve();
    expect(sol.value).toBeCloseTo(40, 4);
  });

  it('satisfies zero-sum invariant in 4v4', () => {
    const sA = createSolver(SAMPLE_4V4_MATRIX.scores).solve().value;
    const transposedInverted = SAMPLE_4V4_MATRIX.scores[0].map((_, colIdx) =>
      SAMPLE_4V4_MATRIX.scores.map((row) => 20 - row[colIdx])
    );
    const sB = createSolver(transposedInverted).solve().value;
    expect(sA + sB).toBeCloseTo(80, 2);
  });

  it('computes 8v8 sample tournament draft correctly', () => {
    const solver = createSolver(SAMPLE_8V8_MATRIX.scores);
    const sol = solver.solve(
      SAMPLE_8V8_MATRIX.namesA,
      SAMPLE_8V8_MATRIX.namesB
    );
    expect(sol.value).toBeCloseTo(83.045, 2);
    expect(sol.bestPureDefenderA.name).toBe('Elke');
    expect(sol.bestPureDefenderA.value).toBeCloseTo(82.626, 2);
    expect(sol.exploitabilityGap).toBeCloseTo(0.419, 2);
  });

  it('determines best defender pick', () => {
    const solver = createSolver(SAMPLE_4V4_MATRIX.scores);
    const fullMask = (1 << 4) - 1;
    const { pick, value } = solver.bestPick(
      fullMask,
      fullMask,
      0,
      0,
      [1, 2],
      [1, 2]
    );
    expect([1, 2]).toContain(pick);
    expect(value).toBeGreaterThan(0);
  });
});
