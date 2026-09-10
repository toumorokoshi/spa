import type { PureStrategy, ZeroSumSolution } from './types';

const NEGATIVE_ONE = -1;
const EPSILON = 1e-9;
const PIVOT_EPSILON = 1e-12;
const ZERO_EPSILON = 1e-15;
const MAX_SIMPLEX_ITERATIONS = 500;

export const pureMaximin = (
  matrix: readonly (readonly number[])[]
): PureStrategy => {
  const rowMins = matrix.map((row) => Math.min(...row));
  const bestVal = Math.max(...rowMins);
  const bestIdx = rowMins.indexOf(bestVal);
  return { value: bestVal, index: bestIdx };
};

const findSaddlePoint = (
  matrix: readonly (readonly number[])[]
): ZeroSumSolution | null => {
  const m = matrix.length;
  const n = matrix[0].length;
  const rowMins = matrix.map((row) => Math.min(...row));
  const colMaxs = Array.from({ length: n }, (_, j) =>
    Math.max(...matrix.map((row) => row[j]))
  );
  const maximin = Math.max(...rowMins);
  const minimax = Math.min(...colMaxs);

  if (Math.abs(maximin - minimax) > EPSILON) {
    return null;
  }
  const bestI = rowMins.indexOf(maximin);
  const bestJ = colMaxs.indexOf(minimax);
  const aStrategy = Array.from({ length: m }, (_, i) => (i === bestI ? 1 : 0));
  const bStrategy = Array.from({ length: n }, (_, j) => (j === bestJ ? 1 : 0));
  return { value: maximin, aStrategy, bStrategy };
};

const isInUnitInterval = (val: number): boolean =>
  val >= -EPSILON && val <= 1 + EPSILON;

const solve2x2Mixed = (
  matrix: readonly (readonly number[])[]
): ZeroSumSolution | null => {
  const a = matrix[0][0];
  const b = matrix[0][1];
  const c = matrix[1][0];
  const d = matrix[1][1];
  const denom = a + d - (b + c);
  if (Math.abs(denom) <= PIVOT_EPSILON) {
    return null;
  }
  const x1 = (d - c) / denom;
  const y1 = (d - b) / denom;
  if (!isInUnitInterval(x1) || !isInUnitInterval(y1)) {
    return null;
  }
  const clamp = (val: number): number => Math.max(0, Math.min(1, val));
  return {
    value: (a * d - b * c) / denom,
    aStrategy: [clamp(x1), clamp(1 - x1)],
    bStrategy: [clamp(y1), clamp(1 - y1)]
  };
};

const findPivotCol = (objRow: Float64Array, totalVars: number): number => {
  return Array.from({ length: totalVars }, (_, j) => j).reduce(
    (bestCol, j) =>
      objRow[j] < -PIVOT_EPSILON &&
      (bestCol === NEGATIVE_ONE || objRow[j] < objRow[bestCol])
        ? j
        : bestCol,
    NEGATIVE_ONE
  );
};

const findPivotRow = (
  tableau: Float64Array[],
  pivotCol: number,
  m: number,
  rhsCol: number
): number => {
  const candidates = Array.from({ length: m }, (_, i) => i).filter(
    (i) => tableau[i][pivotCol] > PIVOT_EPSILON
  );
  if (candidates.length === 0) {
    return NEGATIVE_ONE;
  }
  return candidates.reduce((bestRow, i) => {
    const ratioI = tableau[i][rhsCol] / tableau[i][pivotCol];
    const bestRatio = tableau[bestRow][rhsCol] / tableau[bestRow][pivotCol];
    return ratioI < bestRatio - PIVOT_EPSILON ? i : bestRow;
  }, candidates[0]);
};

const pivotTableau = (
  tableau: Float64Array[],
  basis: Int32Array,
  pivotRow: number,
  pivotCol: number,
  totalCols: number,
  m: number
): void => {
  const pivotVal = tableau[pivotRow][pivotCol];
  Array.from({ length: totalCols }, (_, j) => j).forEach((j) => {
    tableau[pivotRow][j] /= pivotVal;
  });
  Array.from({ length: m + 1 }, (_, i) => i)
    .filter((i) => i !== pivotRow)
    .forEach((i) => {
      const factor = tableau[i][pivotCol];
      if (Math.abs(factor) > ZERO_EPSILON) {
        Array.from({ length: totalCols }, (_, j) => j).forEach((j) => {
          tableau[i][j] -= factor * tableau[pivotRow][j];
        });
      }
    });
  basis[pivotRow] = pivotCol;
};

const runSimplexLoop = (
  tableau: Float64Array[],
  basis: Int32Array,
  m: number,
  n: number,
  iter: number
): void => {
  if (iter >= MAX_SIMPLEX_ITERATIONS) return;
  const pivotCol = findPivotCol(tableau[m], n + m);
  if (pivotCol === NEGATIVE_ONE) return;
  const pivotRow = findPivotRow(tableau, pivotCol, m, n + m);
  if (pivotRow === NEGATIVE_ONE) return;
  pivotTableau(tableau, basis, pivotRow, pivotCol, n + m + 1, m);
  runSimplexLoop(tableau, basis, m, n, iter + 1);
};

const createInitialTableau = (
  matrix: readonly (readonly number[])[],
  shiftC: number,
  m: number,
  n: number
): { readonly tableau: Float64Array[]; readonly basis: Int32Array } => {
  const tableau = Array.from(
    { length: m + 1 },
    () => new Float64Array(n + m + 1)
  );
  Array.from({ length: m }, (_, i) => i).forEach((i) => {
    Array.from({ length: n }, (_, j) => j).forEach((j) => {
      tableau[i][j] = matrix[i][j] + shiftC;
    });
    tableau[i][n + i] = 1;
    tableau[i][n + m] = 1;
  });
  Array.from({ length: n }, (_, j) => j).forEach((j) => {
    tableau[m][j] = NEGATIVE_ONE;
  });
  const basis = new Int32Array(Array.from({ length: m }, (_, i) => n + i));
  return { tableau, basis };
};

const solveSimplex = (
  matrix: readonly (readonly number[])[]
): ZeroSumSolution => {
  const m = matrix.length;
  const n = matrix[0].length;
  const minVal = Math.min(...matrix.map((row) => Math.min(...row)));
  const shiftC = minVal <= 0 ? 1 - minVal : 0;
  const { tableau, basis } = createInitialTableau(matrix, shiftC, m, n);

  runSimplexLoop(tableau, basis, m, n, 0);

  const sumWeights = tableau[m][n + m];
  const vPrime = 1 / sumWeights;
  const value = vPrime - shiftC;

  const bStrategy = Array.from({ length: n }, (_, j) => {
    const basisRow = Array.from({ length: m }, (_, i) => i).find(
      (i) => basis[i] === j
    );
    return basisRow !== undefined
      ? Math.max(0, tableau[basisRow][n + m] * vPrime)
      : 0;
  });

  const aStrategy = Array.from({ length: m }, (_, i) =>
    Math.max(0, tableau[m][n + i] * vPrime)
  );

  return { value, aStrategy, bStrategy };
};

export const solveZeroSum = (
  matrix: readonly (readonly number[])[]
): ZeroSumSolution => {
  const saddle = findSaddlePoint(matrix);
  if (saddle) {
    return saddle;
  }
  if (matrix.length === 2 && matrix[0].length === 2) {
    const mixed2x2 = solve2x2Mixed(matrix);
    if (mixed2x2) {
      return mixed2x2;
    }
  }
  return solveSimplex(matrix);
};
