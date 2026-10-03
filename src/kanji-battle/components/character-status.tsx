import { isKanji } from '../character-data';
import { CharacterData } from '../types';

interface CharacterStatusProps {
  readonly mode: 'freeform' | 'kanji';
  readonly activeCellIndex: number;
  readonly character?: CharacterData | null;
  readonly completedCount: number;
  readonly totalStrokes: number;
  readonly freeformStrokesCount: number;
  readonly showGuide: boolean;
  readonly isCompleted?: boolean;
  readonly onClearCharacter: () => void;
  readonly onToggleGuide: () => void;
  readonly onSubmitCell: () => void;
  readonly onSwitchToFreeform: () => void;
}

const computeDisplayChar = (char: string, isCompleted: boolean): string => {
  if (isKanji(char) && !isCompleted) {
    return '?';
  }
  return char;
};

const formatMeaningText = (
  reading: string | undefined,
  meaning: string
): string => {
  if (reading) {
    return `[${reading}] ${meaning}`;
  }
  return meaning;
};

interface KanjiBadgeProps {
  readonly character: CharacterData;
  readonly isCharDone: boolean;
  readonly currentStroke: number;
  readonly totalStrokes: number;
}

const KanjiBadge = ({
  character,
  isCharDone,
  currentStroke,
  totalStrokes
}: KanjiBadgeProps) => (
  <div className="char-badge">
    <span className="big-char" aria-label={`Target: ${character.char}`}>
      {computeDisplayChar(character.char, isCharDone)}
    </span>
    <div className="char-meta">
      <p className="char-meaning">
        {formatMeaningText(character.reading, character.meaning)}
      </p>
      <p className="stroke-counter">
        {isCharDone ? 'Complete' : `Stroke ${currentStroke} of ${totalStrokes}`}
      </p>
    </div>
  </div>
);

interface FreeformBadgeProps {
  readonly cellNum: number;
  readonly strokesCount: number;
}

const FreeformBadge = ({ cellNum, strokesCount }: FreeformBadgeProps) => (
  <div className="char-badge">
    <span className="big-char" aria-label="Freeform Hiragana">
      ✏️
    </span>
    <div className="char-meta">
      <p className="char-meaning">Cell {cellNum}: Write Hiragana</p>
      <p className="stroke-counter">
        {strokesCount > 0
          ? `${strokesCount} strokes drawn`
          : 'Write character freely on canvas'}
      </p>
    </div>
  </div>
);

interface KanjiActionsProps {
  readonly showGuide: boolean;
  readonly completedCount: number;
  readonly isCharDone: boolean;
  readonly onToggleGuide: () => void;
  readonly onClearCharacter: () => void;
  readonly onSwitchToFreeform: () => void;
}

const KanjiActions = ({
  showGuide,
  completedCount,
  isCharDone,
  onToggleGuide,
  onClearCharacter,
  onSwitchToFreeform
}: KanjiActionsProps) => (
  <>
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={onToggleGuide}
    >
      {showGuide ? 'Hide Hint' : 'Show Hint'}
    </button>
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={onClearCharacter}
      disabled={completedCount === 0 || isCharDone}
    >
      Clear Ink
    </button>
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={onSwitchToFreeform}
    >
      Cancel Kanji
    </button>
  </>
);

interface FreeformActionsProps {
  readonly freeformStrokesCount: number;
  readonly onClearCharacter: () => void;
  readonly onSubmitCell: () => void;
}

const FreeformActions = ({
  freeformStrokesCount,
  onClearCharacter,
  onSubmitCell
}: FreeformActionsProps) => (
  <>
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={onClearCharacter}
      disabled={freeformStrokesCount === 0}
    >
      Clear Ink
    </button>
    <button
      type="button"
      className="btn btn-primary btn-sm"
      onClick={onSubmitCell}
      disabled={freeformStrokesCount === 0}
    >
      Submit Character ▶
    </button>
  </>
);

interface StatusBadgeProps {
  readonly mode: 'freeform' | 'kanji';
  readonly activeCellIndex: number;
  readonly character?: CharacterData | null;
  readonly completedCount: number;
  readonly totalStrokes: number;
  readonly freeformStrokesCount: number;
  readonly isCharDone: boolean;
}

const CharacterStatusBadge = ({
  mode,
  activeCellIndex,
  character,
  completedCount,
  totalStrokes,
  freeformStrokesCount,
  isCharDone
}: StatusBadgeProps) => {
  if (mode === 'kanji' && character) {
    const currentStroke = Math.min(totalStrokes, completedCount + 1);
    return (
      <KanjiBadge
        character={character}
        isCharDone={isCharDone}
        currentStroke={currentStroke}
        totalStrokes={totalStrokes}
      />
    );
  }
  return (
    <FreeformBadge
      cellNum={activeCellIndex + 1}
      strokesCount={freeformStrokesCount}
    />
  );
};

interface StatusActionsProps {
  readonly mode: 'freeform' | 'kanji';
  readonly showGuide: boolean;
  readonly completedCount: number;
  readonly freeformStrokesCount: number;
  readonly isCharDone: boolean;
  readonly onClearCharacter: () => void;
  readonly onToggleGuide: () => void;
  readonly onSubmitCell: () => void;
  readonly onSwitchToFreeform: () => void;
}

const CharacterStatusActions = ({
  mode,
  showGuide,
  completedCount,
  freeformStrokesCount,
  isCharDone,
  onClearCharacter,
  onToggleGuide,
  onSubmitCell,
  onSwitchToFreeform
}: StatusActionsProps) => {
  if (mode === 'kanji') {
    return (
      <KanjiActions
        showGuide={showGuide}
        completedCount={completedCount}
        isCharDone={isCharDone}
        onToggleGuide={onToggleGuide}
        onClearCharacter={onClearCharacter}
        onSwitchToFreeform={onSwitchToFreeform}
      />
    );
  }
  return (
    <FreeformActions
      freeformStrokesCount={freeformStrokesCount}
      onClearCharacter={onClearCharacter}
      onSubmitCell={onSubmitCell}
    />
  );
};

export const CharacterStatus = ({
  mode,
  activeCellIndex,
  character,
  completedCount,
  totalStrokes,
  freeformStrokesCount,
  showGuide,
  isCompleted = false,
  onClearCharacter,
  onToggleGuide,
  onSubmitCell,
  onSwitchToFreeform
}: CharacterStatusProps) => {
  const isCharDone = isCompleted || completedCount >= totalStrokes;

  return (
    <div className="character-status">
      <CharacterStatusBadge
        mode={mode}
        activeCellIndex={activeCellIndex}
        character={character}
        completedCount={completedCount}
        totalStrokes={totalStrokes}
        freeformStrokesCount={freeformStrokesCount}
        isCharDone={isCharDone}
      />

      <div className="char-actions">
        <CharacterStatusActions
          mode={mode}
          showGuide={showGuide}
          completedCount={completedCount}
          freeformStrokesCount={freeformStrokesCount}
          isCharDone={isCharDone}
          onClearCharacter={onClearCharacter}
          onToggleGuide={onToggleGuide}
          onSubmitCell={onSubmitCell}
          onSwitchToFreeform={onSwitchToFreeform}
        />
      </div>
    </div>
  );
};
