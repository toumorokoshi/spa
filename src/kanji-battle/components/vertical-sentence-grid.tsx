import { GRID_COLUMNS, POINTS_PER_TARGET_KANJI } from '../constants';
import { GridCell } from '../types';

interface VerticalSentenceGridProps {
  readonly cells: readonly GridCell[];
  readonly activeCellIndex: number;
  readonly usedCount: number;
  readonly totalTargets: number;
  readonly hasWrittenAny: boolean;
  readonly onSelectCell: (index: number) => void;
  readonly onClearActiveCell: () => void;
  readonly onSubmitSentence: () => void;
}

interface GridCellButtonProps {
  readonly cell: GridCell;
  readonly isActive: boolean;
  readonly onSelect: () => void;
}

const computeCellClass = (
  isActive: boolean,
  isTarget: boolean,
  hasChar: boolean
): string => {
  const activeClass = isActive ? 'active' : '';
  const targetClass = isTarget ? 'target-kanji' : '';
  const filledClass = hasChar ? 'filled' : 'empty';
  return `grid-cell ${activeClass} ${targetClass} ${filledClass}`.trim();
};

const GridCellButton = ({ cell, isActive, onSelect }: GridCellButtonProps) => {
  const hasChar = cell.char !== null;
  const className = computeCellClass(isActive, cell.isTargetKanji, hasChar);

  return (
    <button
      type="button"
      role="gridcell"
      className={className}
      onClick={onSelect}
      aria-label={`Cell ${cell.index + 1}: ${cell.char ?? 'Empty'}${
        isActive ? ', active' : ''
      }`}
    >
      <span className="cell-char">{cell.char ?? ''}</span>
      <span className="cell-num">{cell.index + 1}</span>
    </button>
  );
};

interface GridActionControlsProps {
  readonly hasWrittenAny: boolean;
  readonly usedCount: number;
  readonly onClearActiveCell: () => void;
  readonly onSubmitSentence: () => void;
}

const GridActionControls = ({
  hasWrittenAny,
  usedCount,
  onClearActiveCell,
  onSubmitSentence
}: GridActionControlsProps) => (
  <div className="grid-action-controls">
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={onClearActiveCell}
    >
      Erase Active Cell
    </button>
    <button
      type="button"
      className="btn btn-primary btn-sm"
      disabled={!hasWrittenAny}
      onClick={onSubmitSentence}
    >
      Submit Sentence ({usedCount * POINTS_PER_TARGET_KANJI} pts)
    </button>
  </div>
);

const buildColumnBuckets = (
  cells: readonly GridCell[],
  numColumns: number
): readonly (readonly GridCell[])[] =>
  Array.from({ length: numColumns }, (_, col) =>
    cells.filter((cell) => cell.column === col)
  );

export const VerticalSentenceGrid = ({
  cells,
  activeCellIndex,
  usedCount,
  totalTargets,
  hasWrittenAny,
  onSelectCell,
  onClearActiveCell,
  onSubmitSentence
}: VerticalSentenceGridProps) => {
  const columns = buildColumnBuckets(cells, GRID_COLUMNS);

  return (
    <section
      className="vertical-grid-section"
      aria-label="Japanese Vertical Writing Grid"
    >
      <div className="vertical-grid-header">
        <span className="grid-label">Vertical Manuscript Grid (縦書き)</span>
        <span className="target-score-pill">
          {usedCount} / {totalTargets} Target Kanji Used
        </span>
      </div>

      <div
        className="vertical-grid-paper"
        role="grid"
        aria-label="Manuscript paper (top to bottom, right to left)"
      >
        {columns.map((columnCells, colIdx) => (
          <div
            key={`col-${colIdx}`}
            className="vertical-column"
            role="rowgroup"
            aria-label={`Column ${colIdx + 1}`}
          >
            {columnCells.map((cell) => (
              <GridCellButton
                key={`cell-${cell.index}`}
                cell={cell}
                isActive={cell.index === activeCellIndex}
                onSelect={() => onSelectCell(cell.index)}
              />
            ))}
          </div>
        ))}
      </div>

      <GridActionControls
        hasWrittenAny={hasWrittenAny}
        usedCount={usedCount}
        onClearActiveCell={onClearActiveCell}
        onSubmitSentence={onSubmitSentence}
      />
    </section>
  );
};
