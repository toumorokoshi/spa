import { isKanji } from '../character-data';
import { SentencePrompt } from '../types';

interface SentenceDisplayProps {
  readonly sentence: SentencePrompt;
  readonly currentCharIndex: number;
  readonly isSentenceComplete: boolean;
}

const computeTileClass = (isDone: boolean, isActive: boolean): string => {
  if (isDone) {
    return 'char-tile done';
  }
  if (isActive) {
    return 'char-tile active';
  }
  return 'char-tile pending';
};

const computeTileDisplay = (char: string, isDone: boolean): string => {
  if (isKanji(char) && !isDone) {
    return '?';
  }
  return char;
};

export const SentenceDisplay = ({
  sentence,
  currentCharIndex,
  isSentenceComplete
}: SentenceDisplayProps) => {
  const characters = Array.from(sentence.text);

  return (
    <section className="sentence-display" aria-label="Sentence Prompt">
      <div className="sentence-header">
        <p className="sentence-kana">{sentence.kana}</p>
        <p className="sentence-english">{sentence.english}</p>
      </div>

      <div className="character-tiles" aria-label="Sentence characters">
        {characters.map((char, idx) => {
          const isDone = isSentenceComplete || idx < currentCharIndex;
          const isActive = !isSentenceComplete && idx === currentCharIndex;
          const statusClass = computeTileClass(isDone, isActive);
          const displayChar = computeTileDisplay(char, isDone);

          return (
            <div
              key={`${char}-${idx}`}
              className={statusClass}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="tile-char">{displayChar}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
