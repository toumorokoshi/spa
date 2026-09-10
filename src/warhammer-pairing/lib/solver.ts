import { pureMaximin, solveZeroSum } from './matrix-game';
import type { RoundSolution, Solution, StageGame } from './types';

const ROUND_3_COUNT = 4;
const MASK_SHIFT = 12;
const MAX_PLAYERS = 8;

export const getIndicesFromMask = (
  mask: number,
  maxCount: number = MAX_PLAYERS
): readonly number[] => {
  return Array.from({ length: maxCount }, (_, i) => i).filter(
    (i) => (mask & (1 << i)) !== 0
  );
};

export const getPairs = (
  items: readonly number[]
): readonly (readonly [number, number])[] => {
  return items.flatMap((itemA, i) =>
    items.slice(i + 1).map((itemB) => [itemA, itemB] as const)
  );
};

interface PickContext {
  readonly scores: readonly (readonly number[])[];
  readonly maskA: number;
  readonly maskB: number;
  readonly dA: number;
  readonly dB: number;
  readonly pa: readonly [number, number];
  readonly pb: readonly [number, number];
  readonly restA: readonly number[];
  readonly restB: readonly number[];
  readonly isRound3: boolean;
  readonly getValue: (maskA: number, maskB: number) => number;
}

const computeFuturePayoff = (
  ctx: PickContext,
  bChosen: number,
  aChosen: number,
  r: number,
  c: number
): number => {
  if (ctx.isRound3) {
    const aRej = ctx.pa[1 - c];
    const bRej = ctx.pb[1 - r];
    const aHold = ctx.restA.find((x) => x !== ctx.pa[0] && x !== ctx.pa[1]);
    const bHold = ctx.restB.find((x) => x !== ctx.pb[0] && x !== ctx.pb[1]);
    const holdA = aHold !== undefined ? aHold : aRej;
    const holdB = bHold !== undefined ? bHold : bRej;
    return ctx.scores[aRej][holdB] + ctx.scores[holdA][bRej];
  }
  const nextMaskA = ctx.maskA & ~((1 << ctx.dA) | (1 << aChosen));
  const nextMaskB = ctx.maskB & ~((1 << ctx.dB) | (1 << bChosen));
  return ctx.getValue(nextMaskA, nextMaskB);
};

export const computePickMatrix = (
  ctx: PickContext
): readonly (readonly number[])[] => {
  return [0, 1].map((r) => {
    const bChosen = ctx.pb[r];
    return [0, 1].map((c) => {
      const aChosen = ctx.pa[c];
      const immediate =
        ctx.scores[ctx.dA][bChosen] + ctx.scores[aChosen][ctx.dB];
      const future = computeFuturePayoff(ctx, bChosen, aChosen, r, c);
      return immediate + future;
    });
  });
};

interface DefenderPairContext {
  readonly scores: readonly (readonly number[])[];
  readonly maskA: number;
  readonly maskB: number;
  readonly dA: number;
  readonly dB: number;
  readonly aList: readonly number[];
  readonly bList: readonly number[];
  readonly isRound3: boolean;
  readonly keepSubstages: boolean;
  readonly getValue: (maskA: number, maskB: number) => number;
}

const solveDefenderPair = (
  ctx: DefenderPairContext
): {
  readonly v2: number;
  readonly stageGame?: StageGame;
} => {
  const restA = ctx.aList.filter((x) => x !== ctx.dA);
  const restB = ctx.bList.filter((x) => x !== ctx.dB);
  const pairsA = getPairs(restA);
  const pairsB = getPairs(restB);

  const atkPayoff = pairsA.map((pa) =>
    pairsB.map((pb) => {
      const pickP = computePickMatrix({
        scores: ctx.scores,
        maskA: ctx.maskA,
        maskB: ctx.maskB,
        dA: ctx.dA,
        dB: ctx.dB,
        pa,
        pb,
        restA,
        restB,
        isRound3: ctx.isRound3,
        getValue: ctx.getValue
      });
      return solveZeroSum(pickP).value;
    })
  );

  const sol2 = solveZeroSum(atkPayoff);
  if (!ctx.keepSubstages) {
    return { v2: sol2.value };
  }
  const pm = pureMaximin(atkPayoff);
  const stageGame: StageGame = {
    rows: pairsA,
    cols: pairsB,
    payoff: atkPayoff,
    value: sol2.value,
    aStrategy: sol2.aStrategy,
    bStrategy: sol2.bStrategy,
    aPureValue: pm.value,
    aPureIdx: pm.index
  };
  return { v2: sol2.value, stageGame };
};

const solveRoundInternal = (
  scores: readonly (readonly number[])[],
  totalPlayers: number,
  maskA: number,
  maskB: number,
  keepSubstages: boolean,
  stateValue: (maskA: number, maskB: number) => number
): RoundSolution => {
  const aList = getIndicesFromMask(maskA, totalPlayers);
  const bList = getIndicesFromMask(maskB, totalPlayers);
  const isRound3 = aList.length === ROUND_3_COUNT;

  const attackerGames: Record<string, StageGame> = {};
  const defPayoff = aList.map((dA) =>
    bList.map((dB) => {
      const { v2, stageGame } = solveDefenderPair({
        scores,
        maskA,
        maskB,
        dA,
        dB,
        aList,
        bList,
        isRound3,
        keepSubstages,
        getValue: stateValue
      });
      if (stageGame) {
        attackerGames[`${dA},${dB}`] = stageGame;
      }
      return v2;
    })
  );

  const sol1 = solveZeroSum(defPayoff);
  const pm1 = pureMaximin(defPayoff);
  return {
    defender: {
      rows: aList,
      cols: bList,
      payoff: defPayoff,
      value: sol1.value,
      aStrategy: sol1.aStrategy,
      bStrategy: sol1.bStrategy,
      aPureValue: pm1.value,
      aPureIdx: pm1.index
    },
    attacker: attackerGames
  };
};

const buildSolutionResult = (
  round1: RoundSolution,
  totalPlayers: number,
  namesA?: readonly string[],
  namesB?: readonly string[]
): Solution => {
  const defaultA = Array.from({ length: totalPlayers }, (_, i) => `A${i + 1}`);
  const defaultB = Array.from({ length: totalPlayers }, (_, j) => `B${j + 1}`);
  const resolvedA = namesA ?? defaultA;
  const resolvedB = namesB ?? defaultB;
  const defGame = round1.defender;
  const pureDefAIdx = defGame.rows[defGame.aPureIdx] as number;

  const defenderStrategyA = (defGame.rows as readonly number[])
    .map((idx, i) => [resolvedA[idx], defGame.aStrategy[i]] as const)
    .sort((first, second) => second[1] - first[1]);

  const defenderStrategyB = (defGame.cols as readonly number[])
    .map((idx, j) => [resolvedB[idx], defGame.bStrategy[j]] as const)
    .sort((first, second) => second[1] - first[1]);

  return {
    value: defGame.value,
    round1,
    namesA: resolvedA,
    namesB: resolvedB,
    bestPureDefenderA: {
      name: resolvedA[pureDefAIdx],
      index: pureDefAIdx,
      value: defGame.aPureValue
    },
    exploitabilityGap: defGame.value - defGame.aPureValue,
    defenderStrategyA,
    defenderStrategyB
  };
};

export interface SolverInstance {
  readonly solve: (
    namesA?: readonly string[],
    namesB?: readonly string[]
  ) => Solution;
  readonly stateValue: (maskA: number, maskB: number) => number;
  readonly solveRound: (
    maskA: number,
    maskB: number,
    keepSubstages?: boolean
  ) => RoundSolution;
  readonly bestPick: (
    maskA: number,
    maskB: number,
    dA: number,
    dB: number,
    pa: readonly [number, number],
    pb: readonly [number, number]
  ) => { readonly pick: number; readonly value: number };
}

const computeBestPick = (
  scores: readonly (readonly number[])[],
  totalPlayers: number,
  maskA: number,
  maskB: number,
  dA: number,
  dB: number,
  pa: readonly [number, number],
  pb: readonly [number, number],
  stateValue: (maskA: number, maskB: number) => number
): { readonly pick: number; readonly value: number } => {
  const aList = getIndicesFromMask(maskA, totalPlayers);
  const bList = getIndicesFromMask(maskB, totalPlayers);
  const pickP = computePickMatrix({
    scores,
    maskA,
    maskB,
    dA,
    dB,
    pa,
    pb,
    restA: aList.filter((x) => x !== dA),
    restB: bList.filter((x) => x !== dB),
    isRound3: aList.length === ROUND_3_COUNT,
    getValue: stateValue
  });
  const pm = pureMaximin(pickP);
  return { pick: pb[pm.index], value: pm.value };
};

export const createSolver = (
  scores: readonly (readonly number[])[]
): SolverInstance => {
  const cache = new Map<number, number>();
  const totalPlayers = scores.length;

  const stateValue = (maskA: number, maskB: number): number => {
    const key = (maskA << MASK_SHIFT) | maskB;
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    const computed = solveRoundInternal(
      scores,
      totalPlayers,
      maskA,
      maskB,
      false,
      stateValue
    ).defender.value;
    cache.set(key, computed);
    return computed;
  };

  const solveRound = (
    maskA: number,
    maskB: number,
    keepSubstages = true
  ): RoundSolution =>
    solveRoundInternal(
      scores,
      totalPlayers,
      maskA,
      maskB,
      keepSubstages,
      stateValue
    );

  const bestPick = (
    maskA: number,
    maskB: number,
    dA: number,
    dB: number,
    pa: readonly [number, number],
    pb: readonly [number, number]
  ): { readonly pick: number; readonly value: number } =>
    computeBestPick(
      scores,
      totalPlayers,
      maskA,
      maskB,
      dA,
      dB,
      pa,
      pb,
      stateValue
    );

  const solve = (
    namesA?: readonly string[],
    namesB?: readonly string[]
  ): Solution => {
    const fullMask = (1 << totalPlayers) - 1;
    const round1 = solveRound(fullMask, fullMask, true);
    return buildSolutionResult(round1, totalPlayers, namesA, namesB);
  };

  return { solve, stateValue, solveRound, bestPick };
};
