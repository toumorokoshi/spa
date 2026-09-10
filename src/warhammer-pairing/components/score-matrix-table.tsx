import type { FunctionalComponent } from 'preact';
import type { ScoreMatrix } from '../lib/types';
import { parseScoreMatrix, serializeScoreMatrix } from '../lib/parser';

const BASE_SCORE = 10;
const MAX_SCORE = 20;
const MIN_SCORE = 0;

export const getScoreCellClass = (score: number): string => {
  if (score > BASE_SCORE) return 'score-favorable';
  if (score < BASE_SCORE) return 'score-unfavorable';
  return 'score-neutral';
};

interface MatrixToolbarProps {
  readonly onSolve: () => void;
  readonly onLoad8v8: () => void;
  readonly onLoad4v4: () => void;
  readonly onOpenPaste: () => void;
  readonly onCopyMatrix: () => void;
  readonly isSolving: boolean;
}

export const MatrixToolbar: FunctionalComponent<MatrixToolbarProps> = ({
  onSolve,
  onLoad8v8,
  onLoad4v4,
  onOpenPaste,
  onCopyMatrix,
  isSolving
}) => (
  <div className="matrix-toolbar">
    <div className="toolbar-group">
      <button className="btn btn-secondary" onClick={onLoad8v8}>
        Load 8v8 Sample
      </button>
      <button className="btn btn-secondary" onClick={onLoad4v4}>
        Load 4v4 Sample
      </button>
      <button className="btn btn-secondary" onClick={onOpenPaste}>
        Paste from Spreadsheet
      </button>
      <button className="btn btn-secondary" onClick={onCopyMatrix}>
        Copy for Spreadsheet
      </button>
    </div>
    <div className="toolbar-group">
      <button
        className="btn btn-primary btn-solve"
        onClick={onSolve}
        disabled={isSolving}
      >
        {isSolving ? 'Solving Draft...' : 'Solve Draft'}
      </button>
    </div>
  </div>
);

export const MatrixLegend: FunctionalComponent = () => (
  <div className="matrix-legend">
    <span className="legend-item favorable-badge">≥10.5 Favorable</span>
    <span className="legend-item neutral-badge">10.0 Even</span>
    <span className="legend-item unfavorable-badge">≤9.5 Unfavorable</span>
    <span className="legend-hint">
      Tip: You can paste directly (Ctrl+V / ⌘+V) anywhere on the table.
    </span>
  </div>
);

interface MatrixRowProps {
  readonly rowIndex: number;
  readonly nameA: string;
  readonly scores: readonly number[];
  readonly onNameChange: (index: number, name: string) => void;
  readonly onScoreChange: (row: number, col: number, val: string) => void;
}

const MatrixRow: FunctionalComponent<MatrixRowProps> = ({
  rowIndex,
  nameA,
  scores,
  onNameChange,
  onScoreChange
}) => (
  <tr>
    <th className="header-cell row-header">
      <input
        type="text"
        value={nameA}
        onInput={(e): void =>
          onNameChange(rowIndex, (e.target as HTMLInputElement).value)
        }
        className="name-input row-name"
      />
    </th>
    {scores.map((score, colIndex) => (
      <td key={colIndex} className={`score-cell ${getScoreCellClass(score)}`}>
        <input
          type="number"
          min={MIN_SCORE}
          max={MAX_SCORE}
          step={0.5}
          value={score}
          onInput={(e): void =>
            onScoreChange(
              rowIndex,
              colIndex,
              (e.target as HTMLInputElement).value
            )
          }
          className="score-input"
        />
      </td>
    ))}
  </tr>
);

interface MatrixGridProps {
  readonly matrix: ScoreMatrix;
  readonly onNameAChange: (index: number, name: string) => void;
  readonly onNameBChange: (index: number, name: string) => void;
  readonly onScoreChange: (row: number, col: number, rawVal: string) => void;
}

const MatrixGrid: FunctionalComponent<MatrixGridProps> = ({
  matrix,
  onNameAChange,
  onNameBChange,
  onScoreChange
}) => (
  <div className="table-responsive">
    <table className="matrix-table">
      <thead>
        <tr>
          <th className="corner-cell">A \ B</th>
          {matrix.namesB.map((nameB, j) => (
            <th key={j} className="header-cell col-header">
              <input
                type="text"
                value={nameB}
                onInput={(e): void =>
                  onNameBChange(j, (e.target as HTMLInputElement).value)
                }
                className="name-input col-name"
              />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {matrix.namesA.map((nameA, i) => (
          <MatrixRow
            key={i}
            rowIndex={i}
            nameA={nameA}
            scores={matrix.scores[i]}
            onNameChange={onNameAChange}
            onScoreChange={onScoreChange}
          />
        ))}
      </tbody>
    </table>
  </div>
);

interface ScoreMatrixTableProps {
  readonly matrix: ScoreMatrix;
  readonly onChangeMatrix: (updated: ScoreMatrix) => void;
  readonly onSolve: () => void;
  readonly onLoad8v8: () => void;
  readonly onLoad4v4: () => void;
  readonly onOpenPaste: () => void;
  readonly isSolving: boolean;
}

const updateMatrixScore = (
  matrix: ScoreMatrix,
  row: number,
  col: number,
  rawVal: string
): ScoreMatrix => {
  const num = Number(rawVal);
  if (Number.isNaN(num) || num < MIN_SCORE || num > MAX_SCORE) return matrix;
  const newScores = matrix.scores.map((r, i) =>
    i === row ? r.map((c, j) => (j === col ? num : c)) : r
  );
  return { ...matrix, scores: newScores };
};

export const ScoreMatrixTable: FunctionalComponent<ScoreMatrixTableProps> = ({
  matrix,
  onChangeMatrix,
  onSolve,
  onLoad8v8,
  onLoad4v4,
  onOpenPaste,
  isSolving
}) => {
  const handleScoreChange = (row: number, col: number, rawVal: string): void =>
    onChangeMatrix(updateMatrixScore(matrix, row, col, rawVal));

  const handleNameAChange = (index: number, name: string): void => {
    onChangeMatrix({
      ...matrix,
      namesA: matrix.namesA.map((n, i) => (i === index ? name : n))
    });
  };

  const handleNameBChange = (index: number, name: string): void => {
    onChangeMatrix({
      ...matrix,
      namesB: matrix.namesB.map((n, j) => (j === index ? name : n))
    });
  };

  const handleCopy = (): void => {
    const tsv = serializeScoreMatrix(matrix, '\t');
    navigator.clipboard.writeText(tsv);
  };

  const handlePasteEvent = (e: ClipboardEvent): void => {
    const pastedText = e.clipboardData?.getData('text');
    if (!pastedText) return;
    const res = parseScoreMatrix(pastedText);
    if (res.matrix) {
      e.preventDefault();
      onChangeMatrix(res.matrix);
    }
  };

  return (
    <div className="matrix-container" onPaste={handlePasteEvent}>
      <MatrixToolbar
        onSolve={onSolve}
        onLoad8v8={onLoad8v8}
        onLoad4v4={onLoad4v4}
        onOpenPaste={onOpenPaste}
        onCopyMatrix={handleCopy}
        isSolving={isSolving}
      />
      <MatrixGrid
        matrix={matrix}
        onNameAChange={handleNameAChange}
        onNameBChange={handleNameBChange}
        onScoreChange={handleScoreChange}
      />
      <MatrixLegend />
    </div>
  );
};
