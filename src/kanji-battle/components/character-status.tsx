import { CharacterData } from '../types';

interface CharacterStatusProps {
  readonly character: CharacterData;
  readonly completedCount: number;
  readonly totalStrokes: number;
  readonly showGuide: boolean;
  readonly isSentenceComplete: boolean;
  readonly onClearCharacter: () => void;
  readonly onToggleGuide: () => void;
}

export const CharacterStatus = ({
  character,
  completedCount,
  totalStrokes,
  showGuide,
  isSentenceComplete,
  onClearCharacter,
  onToggleGuide
}: CharacterStatusProps) => {
  const currentStrokeNumber = Math.min(totalStrokes, completedCount + 1);

  return (
    <div className="character-status">
      <div className="char-badge">
        <span className="big-char">{character.char}</span>
        <div className="char-meta">
          <p className="char-meaning">{character.meaning}</p>
          <p className="stroke-counter">
            {isSentenceComplete
              ? 'Complete'
              : `Stroke ${currentStrokeNumber} of ${totalStrokes}`}
          </p>
        </div>
      </div>

      <div className="char-actions">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onToggleGuide}
        >
          {showGuide ? 'Hide Guide' : 'Show Guide'}
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
