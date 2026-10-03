import { GridCell, TargetKanjiPrompt } from '../types';

interface TargetKanjiBannerProps {
  readonly targetKanji: readonly TargetKanjiPrompt[];
  readonly gridCells: readonly GridCell[];
  readonly selectedChar: string;
  readonly onSelectTarget: (char: string) => void;
}

export const TargetKanjiBanner = ({
  targetKanji,
  gridCells,
  selectedChar,
  onSelectTarget
}: TargetKanjiBannerProps) => {
  const writtenChars = gridCells
    .map((c) => c.char)
    .filter((c): c is string => c !== null);

  return (
    <section className="target-kanji-banner" aria-label="Required Target Kanji">
      <div className="target-banner-header">
        <h2>Target Kanji Challenge</h2>
        <p className="target-banner-sub">
          Compose your own sentence using these 5 kanji. Write them from memory!
        </p>
      </div>

      <div className="target-cards-row" role="list">
        {targetKanji.map((item) => {
          const isUsed = writtenChars.includes(item.char);
          const isSelected = selectedChar === item.char;

          return (
            <button
              type="button"
              key={item.char}
              className={`target-card ${isUsed ? 'used' : ''} ${
                isSelected ? 'selected' : ''
              }`}
              onClick={() => onSelectTarget(item.char)}
              aria-label={`Target: reading ${item.reading}, meaning ${item.meaning}${
                isUsed ? ', used in sentence' : ''
              }`}
            >
              <span className="target-reading">{item.reading}</span>
              <span className="target-meaning">{item.meaning}</span>
              {isUsed ? (
                <span className="target-used-tag">✓ Used</span>
              ) : (
                <span className="target-pending-tag">To Write</span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
