import { getCharacterData } from '../character-data';
import {
  FIRST_INDEX,
  KANJI_YEAR_OPTIONS,
  TARGET_KANJI_COUNT
} from '../constants';
import { KanjiConfig, KanjiYearOption } from '../types';

interface YearButtonProps {
  readonly option: KanjiYearOption;
  readonly isSelected: boolean;
  readonly onSelect: (year: number) => void;
}

const YearButton = ({ option, isSelected, onSelect }: YearButtonProps) => (
  <button
    type="button"
    className={`year-tab-btn ${isSelected ? 'active' : ''}`}
    onClick={() => onSelect(option.year)}
    aria-pressed={isSelected}
  >
    <span className="year-title">{option.label}</span>
    <span className="year-desc">{option.description}</span>
  </button>
);

interface StepYearProps {
  readonly selectedYear: number;
  readonly onSelectYear: (year: number) => void;
}

const StepYearSelector = ({ selectedYear, onSelectYear }: StepYearProps) => (
  <section
    className="config-step-card"
    aria-label="Step 1: Select Year of Kanji"
  >
    <header className="step-header">
      <span className="step-badge">Step 1</span>
      <h3>Select Year of Kanji</h3>
    </header>
    <div className="year-options-list">
      {KANJI_YEAR_OPTIONS.map((opt) => (
        <YearButton
          key={opt.year}
          option={opt}
          isSelected={opt.year === selectedYear}
          onSelect={onSelectYear}
        />
      ))}
    </div>
  </section>
);

interface KanjiCardProps {
  readonly char: string;
  readonly isSelected: boolean;
  readonly onToggle: (char: string) => void;
}

const KanjiCard = ({ char, isSelected, onToggle }: KanjiCardProps) => {
  const data = getCharacterData(char);
  return (
    <button
      type="button"
      className={`config-kanji-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onToggle(char)}
      aria-pressed={isSelected}
      aria-label={`Select ${char}, reading ${data.reading ?? char}, meaning ${data.meaning}`}
    >
      <span className="card-check">{isSelected ? '✓' : '+'}</span>
      <span className="card-char">{char}</span>
      <span className="card-reading">{data.reading ?? ''}</span>
      <span className="card-meaning">{data.meaning}</span>
    </button>
  );
};

interface StepKanjiProps {
  readonly currentOption: KanjiYearOption;
  readonly selectedKanji: readonly string[];
  readonly onToggleKanji: (char: string) => void;
  readonly onPickRandom: () => void;
  readonly onSelectFirst: () => void;
}

const StepKanjiPicker = ({
  currentOption,
  selectedKanji,
  onToggleKanji,
  onPickRandom,
  onSelectFirst
}: StepKanjiProps) => (
  <section
    className="config-step-card"
    aria-label="Step 2: Select Kanji to Practice"
  >
    <header className="step-header step-header-row">
      <div>
        <span className="step-badge">Step 2</span>
        <h3>Select Kanji to Practice</h3>
      </div>
      <div className="step-actions">
        <span className="selection-counter" aria-live="polite">
          {selectedKanji.length} / {TARGET_KANJI_COUNT} selected
        </span>
        <button
          type="button"
          className="btn-text-action"
          onClick={onPickRandom}
        >
          🎲 Pick 5 Random
        </button>
        <button
          type="button"
          className="btn-text-action"
          onClick={onSelectFirst}
        >
          🔄 Select First 5
        </button>
      </div>
    </header>
    <div className="kanji-selection-grid">
      {currentOption.kanji.map((char) => (
        <KanjiCard
          key={char}
          char={char}
          isSelected={selectedKanji.includes(char)}
          onToggle={onToggleKanji}
        />
      ))}
    </div>
  </section>
);

interface StepStartProps {
  readonly isReady: boolean;
  readonly count: number;
  readonly onStartGame: () => void;
  readonly onCancel?: () => void;
}

const StepStartGame = ({
  isReady,
  count,
  onStartGame,
  onCancel
}: StepStartProps) => (
  <section
    className="config-step-card step-start-section"
    aria-label="Step 3: Start the Game"
  >
    <header className="step-header">
      <span className="step-badge">Step 3</span>
      <h3>Start the Game</h3>
    </header>
    <div className="start-controls">
      <button
        type="button"
        className="btn-start-game"
        disabled={!isReady}
        onClick={onStartGame}
      >
        {isReady
          ? '▶ Start Game'
          : `Select ${TARGET_KANJI_COUNT - count} more kanji to start`}
      </button>
      {onCancel ? (
        <button type="button" className="btn-cancel-config" onClick={onCancel}>
          Cancel & Return to Game
        </button>
      ) : null}
    </div>
  </section>
);

export interface KanjiConfigViewProps {
  readonly config: KanjiConfig;
  readonly onSelectYear: (year: number) => void;
  readonly onToggleKanji: (char: string) => void;
  readonly onPickRandom: () => void;
  readonly onSelectFirst: () => void;
  readonly onStartGame: () => void;
  readonly onCancel?: () => void;
}

export const KanjiConfigView = ({
  config,
  onSelectYear,
  onToggleKanji,
  onPickRandom,
  onSelectFirst,
  onStartGame,
  onCancel
}: KanjiConfigViewProps) => {
  const currentOption =
    KANJI_YEAR_OPTIONS.find((opt) => opt.year === config.selectedYear) ??
    KANJI_YEAR_OPTIONS[FIRST_INDEX];
  const isReady = config.selectedKanji.length === TARGET_KANJI_COUNT;

  return (
    <div className="kanji-config-container" aria-label="Game Configuration">
      <div className="config-banner">
        <h2>Practice Configuration</h2>
        <p>
          Configure the year level and target kanji for your sentence writing
          session.
        </p>
      </div>

      <StepYearSelector
        selectedYear={config.selectedYear}
        onSelectYear={onSelectYear}
      />

      <StepKanjiPicker
        currentOption={currentOption}
        selectedKanji={config.selectedKanji}
        onToggleKanji={onToggleKanji}
        onPickRandom={onPickRandom}
        onSelectFirst={onSelectFirst}
      />

      <StepStartGame
        isReady={isReady}
        count={config.selectedKanji.length}
        onStartGame={onStartGame}
        onCancel={onCancel}
      />
    </div>
  );
};
