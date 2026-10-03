import { getCharacterData } from './character-data';
import {
  ALL_TARGETS_BONUS_POINTS,
  DEFAULT_CHALLENGE_KANJI,
  FIRST_INDEX,
  GRID_COLUMNS,
  GRID_ROWS,
  POINTS_PER_TARGET_KANJI
} from './constants';
import {
  GameState,
  GridCell,
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

export const createInitialGameState = (
  targetChars: readonly string[] = DEFAULT_CHALLENGE_KANJI
): GameState => {
  const targetKanji = buildTargetKanjiPrompts(targetChars);
  const firstChar =
    targetKanji[FIRST_INDEX]?.char ?? DEFAULT_CHALLENGE_KANJI[0];

  return {
    activeTab: 'practice',
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

export const startNewChallenge = (
  state: GameState,
  newTargetChars?: readonly string[]
): GameState => {
  const initial = createInitialGameState(newTargetChars);
  return {
    ...initial,
    activeTab: state.activeTab
  };
};
