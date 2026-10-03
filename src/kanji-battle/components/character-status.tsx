import { isKanji } from '../character-data';
import { CharacterData } from '../types';

interface CharacterStatusProps {
  readonly character: CharacterData;
  readonly completedCount: number;
  readonly totalStrokes: number;
  readonly showGuide: boolean;
  readonly isCompleted?: boolean;
  readonly onClearCharacter: () => void;
  readonly onToggleGuide: () => void;
}

const computeDisplayChar = (char: string, isCompleted: boolean): string => {
  if (isKanji(char) && !isCompleted) {
    return '?';
  }
  return char;
};

const formatStrokeCounter = (
  isDone: boolean,
  current: number,
  total: number
): string => {
  if (isDone) {
    return 'Complete';
  }
  return `Stroke ${current} of ${total}`;
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

export const CharacterStatus = ({
  character,
  completedCount,
  totalStrokes,
  showGuide,
  isCompleted = false,
  onClearCharacter,
  onToggleGuide
}: CharacterStatusProps) => {
  const isCharDone = isCompleted || completedCount >= totalStrokes;
  const displayChar = computeDisplayChar(character.char, isCharDone);
  const currentStrokeNumber = Math.min(totalStrokes, completedCount + 1);
  const meaningText = formatMeaningText(character.reading, character.meaning);
  const strokeText = formatStrokeCounter(
    isCompleted,
    currentStrokeNumber,
    totalStrokes
  );

  return (
    <div className="character-status">
      <div className="char-badge">
        <span className="big-char" aria-label={`Target: ${character.char}`}>
          {displayChar}
        </span>
        <div className="char-meta">
          <p className="char-meaning">{meaningText}</p>
          <p className="stroke-counter">{strokeText}</p>
        </div>
      </div>

      <div className="char-actions">
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
          disabled={completedCount === 0 || isSentenceComplete}
        >
          Clear Ink
        </button>
      </div>
    </div>
  );
};
