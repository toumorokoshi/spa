import { getCharacterData } from './character-data';
import {
  ALL_TARGETS_BONUS_POINTS,
  DEFAULT_CHALLENGE_KANJI,
  DEFAULT_SELECTED_YEAR,
  FIRST_INDEX,
  GRID_COLUMNS,
  GRID_ROWS,
  HALF_FACTOR,
  KANJI_YEAR_OPTIONS,
  POINTS_PER_TARGET_KANJI,
  TARGET_KANJI_COUNT
} from './constants';
import { createDefaultConfig } from './config-storage';
import {
  GameState,
  GridCell,
  KanjiConfig,
  KanjiYearOption,
  SentenceSubmissionResult,
  StrokeMatchResult,
  TargetKanjiPrompt
} from './types';

export const initGridCells = (
  columns = GRID_COLUMNS,
  rows = GRID_ROWS
): readonly GridCell[] => {
  const total = columns * rows;
  return Array.from({ length: total }, (_, index) => ({
    index,
    column: Math.floor(index / rows),
    row: index % rows,
    char: null,
    isTargetKanji: false
  }));
};

export const buildTargetKanjiPrompts = (
  chars: readonly string[]
): readonly TargetKanjiPrompt[] =>
  chars.map((char) => {
    const data = getCharacterData(char);
    return {
      char,
      reading: data.reading ?? char,
      meaning: data.meaning
    };
  });

const resolveInitialConfig = (
  param?: KanjiConfig | readonly string[]
): KanjiConfig => {
  if (!param) return createDefaultConfig();
  if (Array.isArray(param)) {
    return {
      selectedYear: DEFAULT_SELECTED_YEAR,
      selectedKanji: param
    };
  }
  return param;
};

export const createInitialGameState = (
  initialParam?: KanjiConfig | readonly string[],
  isConfiguring = true
): GameState => {
  const config = resolveInitialConfig(initialParam);
  const targetKanji = buildTargetKanjiPrompts(config.selectedKanji);
  const firstChar =
    targetKanji[FIRST_INDEX]?.char ?? DEFAULT_CHALLENGE_KANJI[FIRST_INDEX];

  return {
    activeTab: 'practice',
    isConfiguring,
    config,
    targetKanji,
    gridCells: initGridCells(),
    activeCellIndex: FIRST_INDEX,
    selectedChar: firstChar,
    completedStrokeIndices: [],
    feedback: {
      type: 'info',
      message:
        'Choose a target kanji or kana, then write it in the active grid cell.'
    },
    showGuide: false,
    submissionResult: null
  };
};

export const switchTab = (
  state: GameState,
  tab: 'practice' | 'shop'
): GameState => ({
  ...state,
  activeTab: tab
});

export const selectCell = (state: GameState, cellIndex: number): GameState => ({
  ...state,
  activeCellIndex: cellIndex,
  completedStrokeIndices: [],
  feedback: {
    type: 'info',
    message: `Cell ${cellIndex + 1} selected.`
  }
});

export const setSelectedChar = (state: GameState, char: string): GameState => ({
  ...state,
  selectedChar: char,
  completedStrokeIndices: [],
  feedback: {
    type: 'info',
    message: `Selected "${char}". Draw its strokes on the canvas.`
  }
});

const updateGridCell = (
  cells: readonly GridCell[],
  targetIndex: number,
  char: string | null,
  isTargetKanji: boolean
): readonly GridCell[] =>
  cells.map((cell) =>
    cell.index === targetIndex ? { ...cell, char, isTargetKanji } : cell
  );

export const clearCell = (state: GameState, cellIndex: number): GameState => ({
  ...state,
  gridCells: updateGridCell(state.gridCells, cellIndex, null, false),
  completedStrokeIndices: [],
  feedback: {
    type: 'info',
    message: `Cell ${cellIndex + 1} cleared.`
  }
});

const handleCompletedCharacter = (state: GameState): GameState => {
  const isTarget = state.targetKanji.some((t) => t.char === state.selectedChar);
  const updatedCells = updateGridCell(
    state.gridCells,
    state.activeCellIndex,
    state.selectedChar,
    isTarget
  );
  const nextCellIndex = Math.min(
    state.gridCells.length - 1,
    state.activeCellIndex + 1
  );

  return {
    ...state,
    gridCells: updatedCells,
    activeCellIndex: nextCellIndex,
    completedStrokeIndices: [],
    feedback: {
      type: 'success',
      message: `Completed "${state.selectedChar}"! Onto next cell.`
    }
  };
};

const handleCorrectStroke = (
  state: GameState,
  strokeIndex: number,
  totalStrokes: number
): GameState => {
  const nextCompleted = [...state.completedStrokeIndices, strokeIndex];
  if (nextCompleted.length >= totalStrokes) {
    return handleCompletedCharacter(state);
  }

  const nextStrokeNum = strokeIndex + 2;
  return {
    ...state,
    completedStrokeIndices: nextCompleted,
    feedback: {
      type: 'success',
      message: `Stroke accepted. Ready for stroke ${nextStrokeNum}.`
    }
  };
};

export const resetCurrentCharacter = (state: GameState): GameState => ({
  ...state,
  completedStrokeIndices: [],
  feedback: {
    type: 'info',
    message: 'Current character strokes cleared. Draw again from stroke 1.'
  }
});

export const toggleGuide = (state: GameState): GameState => ({
  ...state,
  showGuide: !state.showGuide
});

const formatOrderError = (result: StrokeMatchResult): string => {
  const expectedNum = (result.expectedIndex ?? 0) + 1;
  const drawnNum = (result.matchedIndex ?? 0) + 1;
  return `Incorrect stroke order: draw stroke ${expectedNum} before stroke ${drawnNum}.`;
};

const handleStrokeError = (
  state: GameState,
  result: StrokeMatchResult
): GameState => {
  if (result.status === 'wrong-order') {
    return {
      ...state,
      feedback: {
        type: 'error',
        message: formatOrderError(result)
      }
    };
  }

  if (result.status === 'wrong-direction') {
    return {
      ...state,
      feedback: {
        type: 'warning',
        message:
          'Incorrect stroke direction. Please draw in the standard direction.'
      }
    };
  }

  if (result.status === 'too-short') {
    return {
      ...state,
      feedback: {
        type: 'info',
        message: 'Stroke is too short. Draw firmly across the canvas.'
      }
    };
  }

  return {
    ...state,
    feedback: {
      type: 'warning',
      message: 'Stroke not recognized. Try again or toggle guidelines for help.'
    }
  };
};

export const processStrokeResult = (
  state: GameState,
  result: StrokeMatchResult,
  totalStrokes: number
): GameState => {
  if (result.status === 'correct' && result.expectedIndex !== undefined) {
    return handleCorrectStroke(state, result.expectedIndex, totalStrokes);
  }
  return handleStrokeError(state, result);
};

export const scoreSentenceSubmission = (
  gridCells: readonly GridCell[],
  targetKanji: readonly TargetKanjiPrompt[]
): SentenceSubmissionResult => {
  const writtenChars = gridCells
    .map((c) => c.char)
    .filter((c): c is string => c !== null);
  const targetChars = targetKanji.map((t) => t.char);
  const usedTargetKanji = targetChars.filter((c) => writtenChars.includes(c));
  const unusedTargetKanji = targetChars.filter(
    (c) => !writtenChars.includes(c)
  );
  const bonus =
    usedTargetKanji.length === targetKanji.length
      ? ALL_TARGETS_BONUS_POINTS
      : 0;
  const pointsAwarded =
    usedTargetKanji.length * POINTS_PER_TARGET_KANJI + bonus;

  return {
    usedTargetKanji,
    unusedTargetKanji,
    pointsAwarded,
    sentenceText: writtenChars.join('')
  };
};

export const submitSentence = (state: GameState): GameState => {
  const result = scoreSentenceSubmission(state.gridCells, state.targetKanji);
  return {
    ...state,
    submissionResult: result,
    feedback: {
      type: 'success',
      message: `Sentence submitted! Used ${result.usedTargetKanji.length} of ${state.targetKanji.length} target kanji (+${result.pointsAwarded} pts).`
    }
  };
};

export const getKanjiYearOption = (year: number): KanjiYearOption =>
  KANJI_YEAR_OPTIONS.find((opt) => opt.year === year) ??
  KANJI_YEAR_OPTIONS[FIRST_INDEX];

export const selectYearConfig = (
  config: KanjiConfig,
  nextYear: number
): KanjiConfig => {
  if (config.selectedYear === nextYear) {
    return config;
  }
  const option = getKanjiYearOption(nextYear);
  const preserved = config.selectedKanji.filter((char) =>
    (option.kanji as readonly string[]).includes(char)
  );
  const fillCandidates = option.kanji.filter(
    (char) => !preserved.includes(char)
  );
  const needed = TARGET_KANJI_COUNT - preserved.length;
  const filled = [...preserved, ...fillCandidates.slice(FIRST_INDEX, needed)];
  return {
    selectedYear: nextYear,
    selectedKanji: filled
  };
};

export const toggleKanjiSelection = (
  config: KanjiConfig,
  char: string
): KanjiConfig => {
  if (config.selectedKanji.includes(char)) {
    return {
      ...config,
      selectedKanji: config.selectedKanji.filter((c) => c !== char)
    };
  }
  if (config.selectedKanji.length >= TARGET_KANJI_COUNT) {
    return config;
  }
  return {
    ...config,
    selectedKanji: [...config.selectedKanji, char]
  };
};

export const selectRandomKanjiForYear = (
  year: number,
  count = TARGET_KANJI_COUNT,
  randomFn = Math.random
): readonly string[] => {
  const option = getKanjiYearOption(year);
  const shuffled = [...option.kanji].sort(() => randomFn() - HALF_FACTOR);
  return shuffled.slice(FIRST_INDEX, count);
};

export const isConfigReadyToStart = (config: KanjiConfig): boolean =>
  config.selectedKanji.length === TARGET_KANJI_COUNT;

export const openConfiguration = (state: GameState): GameState => ({
  ...state,
  isConfiguring: true
});

export const closeConfiguration = (state: GameState): GameState => ({
  ...state,
  isConfiguring: false
});

export const updateConfig = (
  state: GameState,
  config: KanjiConfig
): GameState => ({
  ...state,
  config
});

export const startGameWithConfig = (
  state: GameState,
  config: KanjiConfig
): GameState => {
  const targetKanji = buildTargetKanjiPrompts(config.selectedKanji);
  const firstChar =
    targetKanji[FIRST_INDEX]?.char ?? config.selectedKanji[FIRST_INDEX];

  return {
    ...state,
    config,
    isConfiguring: false,
    targetKanji,
    gridCells: initGridCells(),
    activeCellIndex: FIRST_INDEX,
    selectedChar: firstChar,
    completedStrokeIndices: [],
    feedback: {
      type: 'info',
      message:
        'Game started! Write target kanji or connecting kana in the vertical manuscript grid.'
    },
    showGuide: false,
    submissionResult: null
  };
};

export const startNewChallenge = (
  state: GameState,
  newTargetChars?: readonly string[]
): GameState => {
  const chars = newTargetChars ?? state.config.selectedKanji;
  const config: KanjiConfig = {
    ...state.config,
    selectedKanji: chars
  };
  return startGameWithConfig(state, config);
};
