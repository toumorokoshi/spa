import { useState } from 'preact/hooks';
import type { FunctionalComponent } from 'preact';
import type { ScoreMatrix } from '../lib/types';
import { createSolver, getIndicesFromMask } from '../lib/solver';

const MAX_DRAFT_ROUNDS = 3;
const TOTAL_MATCHUPS = 8;
const SCORE_PLACES = 2;
const ID_R4_1 = 7;
const ID_R4_2 = 8;

interface RoundPickRecord {
  readonly round: number;
  readonly ourDef: number;
  readonly theirDef: number;
  readonly ourAtk: readonly [number, number];
  readonly theirAtk: readonly [number, number];
  readonly theyPicked: number;
  readonly wePicked: number;
}

interface MatchupItem {
  readonly id: number;
  readonly teamA: string;
  readonly teamB: string;
  readonly score: number;
}

const computeRound4Matchups = (
  r3: RoundPickRecord,
  history: readonly RoundPickRecord[],
  matrix: ScoreMatrix
): readonly MatchupItem[] => {
  const ourRej = r3.ourAtk[0] === r3.theyPicked ? r3.ourAtk[1] : r3.ourAtk[0];
  const theirRej =
    r3.theirAtk[0] === r3.wePicked ? r3.theirAtk[1] : r3.theirAtk[0];

  const usedA = new Set(history.flatMap((r) => [r.ourDef, r.theyPicked]));
  const usedB = new Set(history.flatMap((r) => [r.theirDef, r.wePicked]));
  const ourHold =
    matrix.namesA.map((_, i) => i).find((i) => !usedA.has(i) && i !== ourRej) ??
    ourRej;
  const theirHold =
    matrix.namesB
      .map((_, j) => j)
      .find((j) => !usedB.has(j) && j !== theirRej) ?? theirRej;

  return [
    {
      id: ID_R4_1,
      teamA: matrix.namesA[ourRej],
      teamB: matrix.namesB[theirHold],
      score: matrix.scores[ourRej][theirHold]
    },
    {
      id: ID_R4_2,
      teamA: matrix.namesA[ourHold],
      teamB: matrix.namesB[theirRej],
      score: matrix.scores[ourHold][theirRej]
    }
  ];
};

const computeLockedMatchups = (
  history: readonly RoundPickRecord[],
  matrix: ScoreMatrix
): readonly MatchupItem[] => {
  const regular = history.flatMap((rec, idx) => {
    const baseId = idx * 2 + 1;
    return [
      {
        id: baseId,
        teamA: matrix.namesA[rec.ourDef],
        teamB: matrix.namesB[rec.wePicked],
        score: matrix.scores[rec.ourDef][rec.wePicked]
      },
      {
        id: baseId + 1,
        teamA: matrix.namesA[rec.theyPicked],
        teamB: matrix.namesB[rec.theirDef],
        score: matrix.scores[rec.theyPicked][rec.theirDef]
      }
    ];
  });

  if (history.length !== MAX_DRAFT_ROUNDS) {
    return regular;
  }
  return [
    ...regular,
    ...computeRound4Matchups(history[MAX_DRAFT_ROUNDS - 1], history, matrix)
  ];
};

interface ScoreboardProps {
  readonly lockedScore: number;
  readonly remainingEV: number;
  readonly isComplete: boolean;
}

const DraftScoreboard: FunctionalComponent<ScoreboardProps> = ({
  lockedScore,
  remainingEV,
  isComplete
}) => {
  const projected = isComplete ? lockedScore : lockedScore + remainingEV;
  return (
    <div className="stats-grid draft-stats-grid">
      <div className="stat-card">
        <div className="stat-title">Locked-in Score</div>
        <div className="stat-value">{lockedScore.toFixed(SCORE_PLACES)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-title">Remaining EV</div>
        <div className="stat-value">
          {isComplete ? '0.00' : remainingEV.toFixed(SCORE_PLACES)}
        </div>
      </div>
      <div className="stat-card stat-primary">
        <div className="stat-title">Projected Total</div>
        <div className="stat-value font-bold">
          {projected.toFixed(SCORE_PLACES)}
        </div>
      </div>
    </div>
  );
};

interface MatchupTableProps {
  readonly matchups: readonly MatchupItem[];
}

const MatchupTable: FunctionalComponent<MatchupTableProps> = ({ matchups }) => (
  <div className="table-responsive">
    <table className="analysis-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Our Player (Team A)</th>
          <th>Opponent (Team B)</th>
          <th>Expected Score</th>
        </tr>
      </thead>
      <tbody>
        {matchups.map((m) => (
          <tr key={m.id}>
            <td>{m.id}</td>
            <td className="font-semibold">{m.teamA}</td>
            <td className="font-semibold">{m.teamB}</td>
            <td className="font-mono">{m.score.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface DefendersStepProps {
  readonly availA: readonly number[];
  readonly availB: readonly number[];
  readonly namesA: readonly string[];
  readonly namesB: readonly string[];
  readonly ourDef: number;
  readonly theirDef: number;
  readonly bestPureDefA: number;
  readonly onSetOurDef: (id: number) => void;
  readonly onSetTheirDef: (id: number) => void;
}

const DefendersStep: FunctionalComponent<DefendersStepProps> = ({
  availA,
  availB,
  namesA,
  namesB,
  ourDef,
  theirDef,
  bestPureDefA,
  onSetOurDef,
  onSetTheirDef
}) => (
  <div className="step-box">
    <h4>1. Defenders</h4>
    <label>
      Our Defender:
      <select
        value={ourDef}
        onChange={(e): void =>
          onSetOurDef(Number((e.target as HTMLSelectElement).value))
        }
      >
        {availA.map((i) => (
          <option key={i} value={i}>
            {namesA[i]} {i === bestPureDefA ? '★ (Rec)' : ''}
          </option>
        ))}
      </select>
    </label>
    <label>
      Their Defender:
      <select
        value={theirDef}
        onChange={(e): void =>
          onSetTheirDef(Number((e.target as HTMLSelectElement).value))
        }
      >
        {availB.map((j) => (
          <option key={j} value={j}>
            {namesB[j]}
          </option>
        ))}
      </select>
    </label>
  </div>
);

interface AttackersRowProps {
  readonly avail: readonly number[];
  readonly names: readonly string[];
  readonly atk1: number;
  readonly atk2: number;
  readonly onSetAtk1: (id: number) => void;
  readonly onSetAtk2: (id: number) => void;
}

const AttackersRow: FunctionalComponent<AttackersRowProps> = ({
  avail,
  names,
  atk1,
  atk2,
  onSetAtk1,
  onSetAtk2
}) => (
  <div className="flex-row">
    <select
      value={atk1}
      onChange={(e): void =>
        onSetAtk1(Number((e.target as HTMLSelectElement).value))
      }
    >
      {avail.map((i) => (
        <option key={i} value={i}>
          {names[i]}
        </option>
      ))}
    </select>
    <select
      value={atk2}
      onChange={(e): void =>
        onSetAtk2(Number((e.target as HTMLSelectElement).value))
      }
    >
      {avail
        .filter((i) => i !== atk1)
        .map((i) => (
          <option key={i} value={i}>
            {names[i]}
          </option>
        ))}
    </select>
  </div>
);

interface AttackersStepProps {
  readonly availA: readonly number[];
  readonly remB: readonly number[];
  readonly namesA: readonly string[];
  readonly namesB: readonly string[];
  readonly ourDef: number;
  readonly theirDef: number;
  readonly ourAtk1: number;
  readonly ourAtk2: number;
  readonly theirAtk1: number;
  readonly theirAtk2: number;
  readonly pureAtkPair: readonly [number, number];
  readonly onSetOurAtk1: (id: number) => void;
  readonly onSetOurAtk2: (id: number) => void;
  readonly onSetTheirAtk1: (id: number) => void;
  readonly onSetTheirAtk2: (id: number) => void;
}

const AttackersStep: FunctionalComponent<AttackersStepProps> = ({
  availA,
  remB,
  namesA,
  namesB,
  ourDef,
  theirDef,
  ourAtk1,
  ourAtk2,
  theirAtk1,
  theirAtk2,
  pureAtkPair,
  onSetOurAtk1,
  onSetOurAtk2,
  onSetTheirAtk1,
  onSetTheirAtk2
}) => (
  <div className="step-box">
    <h4>2. Attackers</h4>
    <div className="sub-label">
      Recommended vs {namesB[theirDef]}:{' '}
      <strong>
        {namesA[pureAtkPair[0]]} &amp; {namesA[pureAtkPair[1]]}
      </strong>
    </div>
    <label>
      Our Attackers:
      <AttackersRow
        avail={availA.filter((i) => i !== ourDef)}
        names={namesA}
        atk1={ourAtk1}
        atk2={ourAtk2}
        onSetAtk1={onSetOurAtk1}
        onSetAtk2={onSetOurAtk2}
      />
    </label>
    <label>
      Their Attackers:
      <AttackersRow
        avail={remB}
        names={namesB}
        atk1={theirAtk1}
        atk2={theirAtk2}
        onSetAtk1={onSetTheirAtk1}
        onSetAtk2={onSetTheirAtk2}
      />
    </label>
  </div>
);

interface FinalPicksStepProps {
  readonly namesA: readonly string[];
  readonly namesB: readonly string[];
  readonly ourDef: number;
  readonly theirAtk1: number;
  readonly theirAtk2: number;
  readonly ourAtk1: number;
  readonly ourAtk2: number;
  readonly bestOurPick: number;
  readonly wePicked: number;
  readonly theyPicked: number;
  readonly onSetWePicked: (id: number) => void;
  readonly onSetTheyPicked: (id: number) => void;
}

const FinalPicksStep: FunctionalComponent<FinalPicksStepProps> = ({
  namesA,
  namesB,
  ourDef,
  theirAtk1,
  theirAtk2,
  ourAtk1,
  ourAtk2,
  bestOurPick,
  wePicked,
  theyPicked,
  onSetWePicked,
  onSetTheyPicked
}) => (
  <div className="step-box">
    <h4>3. Final Picks</h4>
    <div className="sub-label">
      Recommended pick for {namesA[ourDef]}:{' '}
      <strong>{namesB[bestOurPick]}</strong>
    </div>
    <label>
      We Pick (Opponent Attacker):
      <select
        value={wePicked}
        onChange={(e): void =>
          onSetWePicked(Number((e.target as HTMLSelectElement).value))
        }
      >
        <option value={theirAtk1}>{namesB[theirAtk1]}</option>
        <option value={theirAtk2}>{namesB[theirAtk2]}</option>
      </select>
    </label>
    <label>
      They Pick (Our Attacker):
      <select
        value={theyPicked}
        onChange={(e): void =>
          onSetTheyPicked(Number((e.target as HTMLSelectElement).value))
        }
      >
        <option value={ourAtk1}>{namesA[ourAtk1]}</option>
        <option value={ourAtk2}>{namesA[ourAtk2]}</option>
      </select>
    </label>
  </div>
);

interface ActiveRoundProps {
  readonly round: number;
  readonly matrix: ScoreMatrix;
  readonly maskA: number;
  readonly maskB: number;
  readonly solver: ReturnType<typeof createSolver>;
  readonly onFinishRound: (record: RoundPickRecord) => void;
}

interface RoundFormLayoutProps {
  readonly round: number;
  readonly recommendedName: string;
  readonly children: preact.ComponentChildren;
  readonly onConfirm: () => void;
}

const RoundFormLayout: FunctionalComponent<RoundFormLayoutProps> = ({
  round,
  recommendedName,
  children,
  onConfirm
}) => (
  <div className="active-round-card">
    <div className="round-header">
      <h3>Round {round} Setup &amp; Choices</h3>
      <span className="badge">Recommended: {recommendedName}</span>
    </div>
    <div className="round-step-grid">{children}</div>
    <div className="confirm-row">
      <button className="btn btn-primary" onClick={onConfirm}>
        Lock In Round {round} Choices →
      </button>
    </div>
  </div>
);

interface RoundState {
  readonly ourDef: number;
  readonly theirDef: number;
  readonly ourAtk1: number;
  readonly ourAtk2: number;
  readonly theirAtk1: number;
  readonly theirAtk2: number;
  readonly wePicked: number;
  readonly theyPicked: number;
  readonly setOurDef: (id: number) => void;
  readonly setTheirDef: (id: number) => void;
  readonly setOurAtk1: (id: number) => void;
  readonly setOurAtk2: (id: number) => void;
  readonly setTheirAtk1: (id: number) => void;
  readonly setTheirAtk2: (id: number) => void;
  readonly setWePicked: (id: number) => void;
  readonly setTheyPicked: (id: number) => void;
}

const useRoundState = (
  initialOurDef: number,
  initialTheirDef: number,
  pureAtkPair: readonly [number, number],
  remB: readonly number[],
  bestOurPick: number
): RoundState => {
  const [ourDef, setOurDef] = useState<number>(initialOurDef);
  const [theirDef, setTheirDef] = useState<number>(initialTheirDef);
  const [ourAtk1, setOurAtk1] = useState<number>(pureAtkPair[0]);
  const [ourAtk2, setOurAtk2] = useState<number>(pureAtkPair[1]);
  const [theirAtk1, setTheirAtk1] = useState<number>(remB[0]);
  const [theirAtk2, setTheirAtk2] = useState<number>(remB[1]);
  const [wePicked, setWePicked] = useState<number>(bestOurPick);
  const [theyPicked, setTheyPicked] = useState<number>(pureAtkPair[0]);

  return {
    ourDef,
    theirDef,
    ourAtk1,
    ourAtk2,
    theirAtk1,
    theirAtk2,
    wePicked,
    theyPicked,
    setOurDef,
    setTheirDef,
    setOurAtk1,
    setOurAtk2,
    setTheirAtk1,
    setTheirAtk2,
    setWePicked,
    setTheyPicked
  };
};

const computeRoundDefaults = (
  maskA: number,
  maskB: number,
  totalA: number,
  totalB: number,
  solver: ReturnType<typeof createSolver>
): {
  readonly availA: readonly number[];
  readonly availB: readonly number[];
  readonly bestPureDefA: number;
  readonly pureAtkPair: readonly [number, number];
  readonly remB: readonly number[];
  readonly bestOurPick: number;
} => {
  const availA = getIndicesFromMask(maskA, totalA);
  const availB = getIndicesFromMask(maskB, totalB);
  const roundSol = solver.solveRound(maskA, maskB, true);
  const bestPureDefA = roundSol.defender.rows[
    roundSol.defender.aPureIdx
  ] as number;
  const atkSol = roundSol.attacker[`${bestPureDefA},${availB[0]}`];
  const pureAtkPair = atkSol
    ? (atkSol.rows[atkSol.aPureIdx] as readonly [number, number])
    : ([availA[0], availA[1]] as const);
  const remB = availB.filter((b) => b !== availB[0]);
  const bestOurPick = solver.bestPick(
    maskA,
    maskB,
    bestPureDefA,
    availB[0],
    [pureAtkPair[0], pureAtkPair[1]],
    [remB[0], remB[1]]
  ).pick;
  return { availA, availB, bestPureDefA, pureAtkPair, remB, bestOurPick };
};

interface RoundStepGridProps {
  readonly defs: ReturnType<typeof computeRoundDefaults>;
  readonly matrix: ScoreMatrix;
  readonly state: RoundState;
}

const RoundStepGrid: FunctionalComponent<RoundStepGridProps> = ({
  defs,
  matrix,
  state
}) => (
  <div className="round-step-grid">
    <DefendersStep
      availA={defs.availA}
      availB={defs.availB}
      namesA={matrix.namesA}
      namesB={matrix.namesB}
      ourDef={state.ourDef}
      theirDef={state.theirDef}
      bestPureDefA={defs.bestPureDefA}
      onSetOurDef={state.setOurDef}
      onSetTheirDef={state.setTheirDef}
    />
    <AttackersStep
      availA={defs.availA}
      remB={defs.remB}
      namesA={matrix.namesA}
      namesB={matrix.namesB}
      ourDef={state.ourDef}
      theirDef={state.theirDef}
      ourAtk1={state.ourAtk1}
      ourAtk2={state.ourAtk2}
      theirAtk1={state.theirAtk1}
      theirAtk2={state.theirAtk2}
      pureAtkPair={defs.pureAtkPair}
      onSetOurAtk1={state.setOurAtk1}
      onSetOurAtk2={state.setOurAtk2}
      onSetTheirAtk1={state.setTheirAtk1}
      onSetTheirAtk2={state.setTheirAtk2}
    />
    <FinalPicksStep
      namesA={matrix.namesA}
      namesB={matrix.namesB}
      ourDef={state.ourDef}
      theirAtk1={state.theirAtk1}
      theirAtk2={state.theirAtk2}
      ourAtk1={state.ourAtk1}
      ourAtk2={state.ourAtk2}
      bestOurPick={defs.bestOurPick}
      wePicked={state.wePicked}
      theyPicked={state.theyPicked}
      onSetWePicked={state.setWePicked}
      onSetTheyPicked={state.setTheyPicked}
    />
  </div>
);

const ActiveRoundForm: FunctionalComponent<ActiveRoundProps> = ({
  round,
  matrix,
  maskA,
  maskB,
  solver,
  onFinishRound
}) => {
  const defs = computeRoundDefaults(
    maskA,
    maskB,
    matrix.namesA.length,
    matrix.namesB.length,
    solver
  );
  const state = useRoundState(
    defs.bestPureDefA,
    defs.availB[0],
    defs.pureAtkPair,
    defs.remB,
    defs.bestOurPick
  );

  const handleConfirm = (): void => {
    onFinishRound({
      round,
      ourDef: state.ourDef,
      theirDef: state.theirDef,
      ourAtk: [state.ourAtk1, state.ourAtk2],
      theirAtk: [state.theirAtk1, state.theirAtk2],
      theyPicked: state.theyPicked,
      wePicked: state.wePicked
    });
  };

  return (
    <RoundFormLayout
      round={round}
      recommendedName={matrix.namesA[defs.bestPureDefA]}
      onConfirm={handleConfirm}
    >
      <RoundStepGrid defs={defs} matrix={matrix} state={state} />
    </RoundFormLayout>
  );
};

const isDraftComplete = (historyLen: number, totalPlayers: number): boolean =>
  historyLen >= MAX_DRAFT_ROUNDS || totalPlayers < TOTAL_MATCHUPS;

interface MatchupResultsProps {
  readonly matchups: readonly MatchupItem[];
}

const MatchupResultsSection: FunctionalComponent<MatchupResultsProps> = ({
  matchups
}) => (
  <div className="matchup-results-section">
    <h3>
      Formed Matchups ({matchups.length} / {TOTAL_MATCHUPS})
    </h3>
    {matchups.length > 0 ? (
      <MatchupTable matchups={matchups} />
    ) : (
      <p className="empty-hint">
        No matchups locked in yet. Start Round 1 above!
      </p>
    )}
  </div>
);

interface DraftAssistantProps {
  readonly matrix: ScoreMatrix;
}

export const DraftAssistant: FunctionalComponent<DraftAssistantProps> = ({
  matrix
}) => {
  const [history, setHistory] = useState<readonly RoundPickRecord[]>([]);
  const solver = createSolver(matrix.scores);

  const fullMaskA = (1 << matrix.namesA.length) - 1;
  const fullMaskB = (1 << matrix.namesB.length) - 1;

  const currentMaskA = history.reduce(
    (mask, r) => mask & ~((1 << r.ourDef) | (1 << r.theyPicked)),
    fullMaskA
  );
  const currentMaskB = history.reduce(
    (mask, r) => mask & ~((1 << r.theirDef) | (1 << r.wePicked)),
    fullMaskB
  );

  const isComplete = isDraftComplete(history.length, matrix.namesA.length);
  const matchups = computeLockedMatchups(history, matrix);
  const lockedScore = matchups.reduce((sum, m) => sum + m.score, 0);
  const remainingEV = isComplete
    ? 0
    : solver.stateValue(currentMaskA, currentMaskB);

  return (
    <div className="draft-assistant-container">
      <div className="assistant-header-flex">
        <div>
          <h2>At-the-Table Draft Assistant</h2>
          <p className="section-desc">
            Track pairings round-by-round with real-time optimal advice.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={(): void => setHistory([])}
        >
          Reset Draft
        </button>
      </div>
      <DraftScoreboard
        lockedScore={lockedScore}
        remainingEV={remainingEV}
        isComplete={isComplete}
      />
      {!isComplete && (
        <ActiveRoundForm
          key={history.length + 1}
          round={history.length + 1}
          matrix={matrix}
          maskA={currentMaskA}
          maskB={currentMaskB}
          solver={solver}
          onFinishRound={(rec): void => setHistory([...history, rec])}
        />
      )}
      <MatchupResultsSection matchups={matchups} />
    </div>
  );
};
