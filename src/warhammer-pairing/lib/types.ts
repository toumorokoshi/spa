export interface ScoreMatrix {
  readonly namesA: readonly string[];
  readonly namesB: readonly string[];
  readonly scores: readonly (readonly number[])[];
}

export interface ZeroSumSolution {
  readonly value: number;
  readonly aStrategy: readonly number[];
  readonly bStrategy: readonly number[];
}

export interface PureStrategy {
  readonly value: number;
  readonly index: number;
}

export interface StageGame {
  readonly rows: readonly number[] | readonly (readonly [number, number])[];
  readonly cols: readonly number[] | readonly (readonly [number, number])[];
  readonly payoff: readonly (readonly number[])[];
  readonly value: number;
  readonly aStrategy: readonly number[];
  readonly bStrategy: readonly number[];
  readonly aPureValue: number;
  readonly aPureIdx: number;
}

export interface RoundSolution {
  readonly defender: StageGame;
  readonly attacker: Readonly<Record<string, StageGame>>;
}

export interface Solution {
  readonly value: number;
  readonly round1: RoundSolution;
  readonly namesA: readonly string[];
  readonly namesB: readonly string[];
  readonly bestPureDefenderA: {
    readonly name: string;
    readonly index: number;
    readonly value: number;
  };
  readonly exploitabilityGap: number;
  readonly defenderStrategyA: readonly (readonly [string, number])[];
  readonly defenderStrategyB: readonly (readonly [string, number])[];
}

export interface MatchupRecord {
  readonly id: number;
  readonly round: number;
  readonly teamAPlayer: string;
  readonly teamBPlayer: string;
  readonly score: number;
}

export interface RoundHistory {
  readonly ourDefender: string;
  readonly theirDefender: string;
  readonly ourAtk1: string;
  readonly ourAtk2: string;
  readonly theirAtk1: string;
  readonly theirAtk2: string;
  readonly theyPicked: string;
  readonly wePicked: string;
}
