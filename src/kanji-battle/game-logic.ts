import { getCharacterData } from './character-data';
import {
  ALL_TARGETS_BONUS_POINTS,
  AVAILABLE_KANA,
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
import { recognizeKanaFromStrokes } from './stroke-matcher';
import {
  CellEvaluation,
  GameState,
  GridCell,
  KanjiConfig,
  KanjiYearOption,
  SentenceSubmissionResult,
  Stroke,
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
  if ('selectedYear' in param && 'selectedKanji' in param) {
    return param;
  }
  return {
    selectedYear: DEFAULT_SELECTED_YEAR,
    selectedKanji: param as readonly string[]
  };
};

export const createInitialGameState = (
  initialParam?: KanjiConfig | readonly string[],
  isConfiguring = true
): GameState => {
  const config = resolveInitialConfig(initialParam);
  const targetKanji = buildTargetKanjiPrompts(config.selectedKanji);

  return {
    activeTab: 'practice',
    isConfiguring,
    config,
    targetKanji,
    gridCells: initGridCells(),
    activeCellIndex: FIRST_INDEX,
    selectedChar: null,
    activeMode: 'freeform',
    freeformStrokes: [],
    completedStrokeIndices: [],
    feedback: {
      type: 'info',
      message:
        'Write hiragana freely in the active cell, or select a target kanji to write it from memory.'
    },
    showGuide: false,
    submissionResult: null
  };
};

export const switchTab = (
  state: GameState,
  tab: 'practice' | 'inventory' | 'shop'
): GameState => ({
  ...state,
  activeTab: tab
});

const getCharReading = (state: GameState, char: string): string => {
  const target = state.targetKanji.find((t) => t.char === char);
  if (target?.reading) {
    return target.reading;
  }
  return getCharacterData(char).reading ?? char;
};

const selectTargetKanjiCell = (
  state: GameState,
  cellIndex: number,
  char: string
): GameState => ({
  ...state,
  activeCellIndex: cellIndex,
  activeMode: 'kanji',
  selectedChar: char,
  freeformStrokes: [],
  completedStrokeIndices: [],
  feedback: {
    type: 'info',
    message: `Cell ${cellIndex + 1} selected with target "${getCharReading(state, char)}".`
  }
});

const selectFreeformCell = (
  state: GameState,
  cellIndex: number,
  cellStrokes: readonly Stroke[] | undefined
): GameState => ({
  ...state,
  activeCellIndex: cellIndex,
  activeMode: 'freeform',
  selectedChar: null,
  freeformStrokes: cellStrokes ?? [],
  completedStrokeIndices: [],
  feedback: {
    type: 'info',
    message: `Cell ${cellIndex + 1} selected.`
  }
});

export const selectCell = (state: GameState, cellIndex: number): GameState => {
  const targetCell = state.gridCells[cellIndex];
  if (targetCell?.isTargetKanji && targetCell.char) {
    return selectTargetKanjiCell(state, cellIndex, targetCell.char);
  }
  return selectFreeformCell(state, cellIndex, targetCell?.strokes);
};

export const setSelectedTargetKanji = (
  state: GameState,
  char: string | null
): GameState => {
  if (!char || (state.activeMode === 'kanji' && state.selectedChar === char)) {
    return {
      ...state,
      activeMode: 'freeform',
      selectedChar: null,
      completedStrokeIndices: [],
      feedback: {
        type: 'info',
        message: 'Freeform mode: write hiragana without specifying character.'
      }
    };
  }
  return {
    ...state,
    activeMode: 'kanji',
    selectedChar: char,
    completedStrokeIndices: [],
    feedback: {
      type: 'info',
      message: `Selected "${getCharReading(state, char)}". Write it from memory on the canvas.`
    }
  };
};

export const setSelectedChar = (state: GameState, char: string): GameState =>
  setSelectedTargetKanji(state, char);

const updateGridCell = (
  cells: readonly GridCell[],
  targetIndex: number,
  char: string | null,
  isTargetKanji: boolean,
  strokes?: readonly Stroke[]
): readonly GridCell[] =>
  cells.map((cell) =>
    cell.index === targetIndex
      ? { ...cell, char, isTargetKanji, strokes }
      : cell
  );

export const addFreeformStroke = (
  state: GameState,
  stroke: Stroke
): GameState => ({
  ...state,
  freeformStrokes: [...state.freeformStrokes, stroke],
  feedback: {
    type: 'info',
    message: 'Stroke added. Draw more or hit Submit Character to advance.'
  }
});

const getNextCellStrokes = (
  cells: readonly GridCell[],
  index: number
): readonly Stroke[] => cells[index]?.strokes ?? [];

const submitFreeformCell = (
  state: GameState,
  nextCellIndex: number
): GameState => {
  const nextStrokes = getNextCellStrokes(state.gridCells, nextCellIndex);
  if (state.freeformStrokes.length === 0) {
    return {
      ...state,
      activeCellIndex: nextCellIndex,
      freeformStrokes: nextStrokes
    };
  }
  const updatedCells = updateGridCell(
    state.gridCells,
    state.activeCellIndex,
    null,
    false,
    state.freeformStrokes
  );
  return {
    ...state,
    gridCells: updatedCells,
    activeCellIndex: nextCellIndex,
    activeMode: 'freeform',
    selectedChar: null,
    freeformStrokes: nextStrokes,
    completedStrokeIndices: [],
    feedback: {
      type: 'success',
      message: `Cell ${state.activeCellIndex + 1} saved! Onto next cell.`
    }
  };
};

const submitKanjiCell = (
  state: GameState,
  char: string,
  nextCellIndex: number
): GameState => {
  const charData = getCharacterData(char);
  const updatedCells = updateGridCell(
    state.gridCells,
    state.activeCellIndex,
    char,
    true,
    charData.strokes
  );
  return {
    ...state,
    gridCells: updatedCells,
    activeCellIndex: nextCellIndex,
    activeMode: 'freeform',
    selectedChar: null,
    freeformStrokes: state.gridCells[nextCellIndex]?.strokes ?? [],
    completedStrokeIndices: [],
    feedback: {
      type: 'success',
      message: `Saved "${char}"! Onto next cell.`
    }
  };
};

export const submitActiveCell = (state: GameState): GameState => {
  const nextCellIndex = Math.min(
    state.gridCells.length - 1,
    state.activeCellIndex + 1
  );
  if (state.activeMode === 'freeform') {
    return submitFreeformCell(state, nextCellIndex);
  }
  if (state.selectedChar) {
    return submitKanjiCell(state, state.selectedChar, nextCellIndex);
  }
  return state;
};

export const clearCell = (state: GameState, cellIndex: number): GameState => {
  const isCurrentActive = cellIndex === state.activeCellIndex;
  return {
    ...state,
    gridCells: updateGridCell(
      state.gridCells,
      cellIndex,
      null,
      false,
      undefined
    ),
    freeformStrokes: isCurrentActive ? [] : state.freeformStrokes,
    completedStrokeIndices: isCurrentActive ? [] : state.completedStrokeIndices,
    feedback: {
      type: 'info',
      message: `Cell ${cellIndex + 1} cleared.`
    }
  };
};

const handleCompletedCharacter = (state: GameState): GameState => {
  if (!state.selectedChar) return state;
  const isTarget = state.targetKanji.some((t) => t.char === state.selectedChar);
  const charData = getCharacterData(state.selectedChar);
  const updatedCells = updateGridCell(
    state.gridCells,
    state.activeCellIndex,
    state.selectedChar,
    isTarget,
    charData.strokes
  );
  const nextCellIndex = Math.min(
    state.gridCells.length - 1,
    state.activeCellIndex + 1
  );

  return {
    ...state,
    gridCells: updatedCells,
    activeCellIndex: nextCellIndex,
    activeMode: 'freeform',
    selectedChar: null,
    freeformStrokes: state.gridCells[nextCellIndex]?.strokes ?? [],
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
  freeformStrokes: [],
  completedStrokeIndices: [],
  feedback: {
    type: 'info',
    message: 'Current character strokes cleared. Draw again.'
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

const evaluateStrokesCell = (
  cellIndex: number,
  strokes: readonly Stroke[],
  candidateKana: readonly {
    readonly char: string;
    readonly strokes: readonly Stroke[];
  }[]
): CellEvaluation => {
  const recognized = recognizeKanaFromStrokes(strokes, candidateKana);
  if (recognized) {
    return {
      cellIndex,
      char: recognized,
      isTargetKanji: false,
      status: 'recognized-kana',
      feedback: `Hiragana "${recognized}" (Recognized)`
    };
  }
  return {
    cellIndex,
    char: null,
    isTargetKanji: false,
    status: 'valid-kana',
    feedback: 'Hiragana (Handwritten, accepted)'
  };
};

const isCellTargetKanji = (
  cell: GridCell,
  targetKanjiChars: readonly string[]
): boolean => {
  if (cell.isTargetKanji) return true;
  if (!cell.char) return false;
  return targetKanjiChars.includes(cell.char);
};

const evaluateSingleCell = (
  cell: GridCell,
  targetKanjiChars: readonly string[],
  candidateKana: readonly {
    readonly char: string;
    readonly strokes: readonly Stroke[];
  }[]
): CellEvaluation => {
  if (cell.char && isCellTargetKanji(cell, targetKanjiChars)) {
    return {
      cellIndex: cell.index,
      char: cell.char,
      isTargetKanji: true,
      status: 'target-kanji',
      feedback: `Target kanji "${cell.char}" (Stroke order verified)`
    };
  }
  const strokes = cell.strokes;
  if (strokes && strokes.length > 0) {
    return evaluateStrokesCell(cell.index, strokes, candidateKana);
  }
  return {
    cellIndex: cell.index,
    char: cell.char,
    isTargetKanji: false,
    status: 'empty',
    feedback: 'Empty'
  };
};

export const scoreSentenceSubmission = (
  gridCells: readonly GridCell[],
  targetKanji: readonly TargetKanjiPrompt[]
): SentenceSubmissionResult => {
  const candidateKana = AVAILABLE_KANA.map((kana) => ({
    char: kana,
    strokes: getCharacterData(kana).strokes
  }));
  const targetChars = targetKanji.map((t) => t.char);

  const cellEvaluations = gridCells
    .filter(
      (cell) => cell.char !== null || (cell.strokes && cell.strokes.length > 0)
    )
    .map((cell) => evaluateSingleCell(cell, targetChars, candidateKana));

  const usedTargetKanji = targetChars.filter((c) =>
    cellEvaluations.some((ev) => ev.isTargetKanji && ev.char === c)
  );
  const unusedTargetKanji = targetChars.filter(
    (c) => !usedTargetKanji.includes(c)
  );
  const bonus =
    usedTargetKanji.length === targetKanji.length
      ? ALL_TARGETS_BONUS_POINTS
      : 0;
  const pointsAwarded =
    usedTargetKanji.length * POINTS_PER_TARGET_KANJI + bonus;

  const sentenceText = cellEvaluations.map((ev) => ev.char ?? '・').join('');

  return {
    usedTargetKanji,
    unusedTargetKanji,
    pointsAwarded,
    sentenceText,
    cellEvaluations
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

  return {
    ...state,
    config,
    isConfiguring: false,
    targetKanji,
    gridCells: initGridCells(),
    activeCellIndex: FIRST_INDEX,
    activeMode: 'freeform',
    selectedChar: null,
    freeformStrokes: [],
    completedStrokeIndices: [],
    feedback: {
      type: 'info',
      message:
        'Game started! Write hiragana freely in the active cell or select a target kanji.'
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
