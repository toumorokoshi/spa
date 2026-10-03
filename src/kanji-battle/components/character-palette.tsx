import { AVAILABLE_KANA } from '../constants';
import { TargetKanjiPrompt } from '../types';

interface CharacterPaletteProps {
  readonly targetKanji: readonly TargetKanjiPrompt[];
  readonly selectedChar: string;
  readonly onSelectChar: (char: string) => void;
}

export const CharacterPalette = ({
  targetKanji,
  selectedChar,
  onSelectChar
}: CharacterPaletteProps) => (
  <section className="character-palette" aria-label="Character Selection">
    <div className="palette-header">
      <span className="palette-title">Select Character to Write</span>
    </div>

    <div className="palette-groups">
      <div className="palette-group">
        <span className="group-label">Target Kanji (Readings):</span>
        <div className="palette-chips">
          {targetKanji.map((item) => {
            const isSelected = selectedChar === item.char;
            return (
              <button
                type="button"
                key={item.char}
                className={`palette-chip target-chip ${
                  isSelected ? 'selected' : ''
                }`}
                onClick={() => onSelectChar(item.char)}
                aria-label={`Select target kanji reading: ${item.reading}`}
              >
                {item.reading}
              </button>
            );
          })}
        </div>
      </div>

      <div className="palette-group">
        <span className="group-label">Connecting Kana:</span>
        <div className="palette-chips">
          {AVAILABLE_KANA.map((kana) => {
            const isSelected = selectedChar === kana;
            return (
              <button
                type="button"
                key={kana}
                className={`palette-chip kana-chip ${
                  isSelected ? 'selected' : ''
                }`}
                onClick={() => onSelectChar(kana)}
                aria-label={`Select kana ${kana}`}
              >
                {kana}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);
