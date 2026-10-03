import { AVAILABLE_KANA } from '../constants';

interface CharacterPaletteProps {
  readonly selectedChar: string;
  readonly onSelectChar: (char: string) => void;
}

export const CharacterPalette = ({
  selectedChar,
  onSelectChar
}: CharacterPaletteProps) => (
  <section className="character-palette" aria-label="Character Selection">
    <div className="palette-header">
      <span className="palette-title">Connecting Kana (ひらがな)</span>
    </div>

    <div className="palette-chips">
      {AVAILABLE_KANA.map((kana) => {
        const isSelected = selectedChar === kana;
        return (
          <button
            type="button"
            key={kana}
            className={`palette-chip kana-chip ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectChar(kana)}
            aria-label={`Select kana ${kana}`}
          >
            {kana}
          </button>
        );
      })}
    </div>
  </section>
);
