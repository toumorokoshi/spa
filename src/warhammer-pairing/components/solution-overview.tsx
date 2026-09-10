import { useState } from 'preact/hooks';
import type { FunctionalComponent } from 'preact';
import type { Solution } from '../lib/types';

const PERCENT_MULTIPLIER = 100;
const DECIMAL_PLACES = 1;
const SCORE_PLACES = 2;
const MIN_DISPLAY_PROB = 0.001;
const POINTS_PER_MATCH = 20;

interface StatCardProps {
  readonly title: string;
  readonly value: string;
  readonly subtitle?: string;
  readonly badgeClass?: string;
}

const StatCard: FunctionalComponent<StatCardProps> = ({
  title,
  value,
  subtitle,
  badgeClass
}) => (
  <div className={`stat-card ${badgeClass ?? ''}`}>
    <div className="stat-title">{title}</div>
    <div className="stat-value">{value}</div>
    {subtitle && <div className="stat-subtitle">{subtitle}</div>}
  </div>
);

interface StrategyTableProps {
  readonly title: string;
  readonly strategies: readonly (readonly [string, number])[];
}

const StrategyTable: FunctionalComponent<StrategyTableProps> = ({
  title,
  strategies
}) => (
  <div className="strategy-panel">
    <h4>{title}</h4>
    <div className="strategy-list">
      {strategies
        .filter(([, prob]) => prob >= MIN_DISPLAY_PROB)
        .map(([name, prob]) => {
          const pct = (prob * PERCENT_MULTIPLIER).toFixed(DECIMAL_PLACES);
          return (
            <div key={name} className="strategy-row">
              <span className="strategy-name">{name}</span>
              <div className="strategy-bar-wrap">
                <div
                  className="strategy-bar-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="strategy-pct">{pct}%</span>
            </div>
          );
        })}
    </div>
  </div>
);

interface AttackerOffersProps {
  readonly solution: Solution;
  readonly selectedDefenderIdx: number;
}

const AttackerOffersTable: FunctionalComponent<AttackerOffersProps> = ({
  solution,
  selectedDefenderIdx
}) => {
  const { round1, namesA, namesB } = solution;
  const defCols = round1.defender.cols as readonly number[];

  return (
    <div className="table-responsive">
      <table className="analysis-table">
        <thead>
          <tr>
            <th>Opponent Defender</th>
            <th>Our Recommended Attacker Pair</th>
            <th>Guaranteed Subgame Value</th>
          </tr>
        </thead>
        <tbody>
          {defCols.map((dB) => {
            const atkGame = round1.attacker[`${selectedDefenderIdx},${dB}`];
            if (!atkGame) return null;
            const purePair = atkGame.rows[atkGame.aPureIdx] as readonly [
              number,
              number
            ];
            const pairText = `${namesA[purePair[0]]} & ${namesA[purePair[1]]}`;
            return (
              <tr key={dB}>
                <td className="font-semibold">{namesB[dB]}</td>
                <td>
                  <span className="attacker-chip">{pairText}</span>
                </td>
                <td className="font-mono">
                  {atkGame.aPureValue.toFixed(SCORE_PLACES)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const SolutionStatsGrid: FunctionalComponent<{
  readonly solution: Solution;
}> = ({ solution }) => {
  const totalPossible = solution.namesA.length * POINTS_PER_MATCH;
  const gapClass =
    solution.exploitabilityGap > 1 ? 'stat-warning' : 'stat-neutral';
  return (
    <div className="stats-grid">
      <StatCard
        title="Game Expected Total"
        value={`${solution.value.toFixed(SCORE_PLACES)} / ${totalPossible}`}
        subtitle="Minimax Nash equilibrium score"
        badgeClass="stat-primary"
      />
      <StatCard
        title="Best Pure Defender"
        value={solution.bestPureDefenderA.name}
        subtitle={`Guaranteed ${solution.bestPureDefenderA.value.toFixed(SCORE_PLACES)} pts`}
        badgeClass="stat-success"
      />
      <StatCard
        title="Exploitability Gap"
        value={`${solution.exploitabilityGap.toFixed(SCORE_PLACES)} pts`}
        subtitle="Cost of playing pure vs mixed"
        badgeClass={gapClass}
      />
    </div>
  );
};

interface SolutionOverviewProps {
  readonly solution: Solution;
  readonly onGoToDraft: () => void;
}

export const SolutionOverview: FunctionalComponent<SolutionOverviewProps> = ({
  solution,
  onGoToDraft
}) => {
  const [selectedDefenderIdx, setSelectedDefenderIdx] = useState<number>(
    solution.bestPureDefenderA.index
  );

  return (
    <div className="solution-container">
      <SolutionStatsGrid solution={solution} />
      <div className="strategies-container">
        <StrategyTable
          title="Our Round 1 Defender Mixed Strategy"
          strategies={solution.defenderStrategyA}
        />
        <StrategyTable
          title="Their Predicted Round 1 Defender Strategy"
          strategies={solution.defenderStrategyB}
        />
      </div>

      <div className="conditional-attacker-section">
        <div className="section-header-flex">
          <div>
            <h3>Conditional Attacker Pairs</h3>
            <p className="section-desc">
              If Team A nominates defender:{' '}
              <select
                className="select-defender"
                value={selectedDefenderIdx}
                onChange={(e): void =>
                  setSelectedDefenderIdx(
                    Number((e.target as HTMLSelectElement).value)
                  )
                }
              >
                {solution.namesA.map((name, i) => (
                  <option key={i} value={i}>
                    {name}
                  </option>
                ))}
              </select>
            </p>
          </div>
          <button className="btn btn-primary" onClick={onGoToDraft}>
            Go to Live Draft Assistant →
          </button>
        </div>
        <AttackerOffersTable
          solution={solution}
          selectedDefenderIdx={selectedDefenderIdx}
        />
      </div>
    </div>
  );
};
