import { describe, it, expect } from 'vitest';
import {
  ALL_TARGETS_BONUS_POINTS,
  FIRST_INDEX,
  POINTS_PER_TARGET_KANJI,
  TARGET_KANJI_COUNT,
  TOTAL_GRID_CELLS
} from './constants';
import {
  createInitialGameState,
  initGridCells,
  processStrokeResult,
  selectCell,
  setSelectedChar,
  clearCell,
  scoreSentenceSubmission,
  submitSentence,
  resetCurrentCharacter,
  toggleGuide,
  switchTab
} from './game-logic';

describe('grid and target challenge initialization', () => {
  it('creates grid cells organized by columns and rows', () => {
    const cells = initGridCells();
    expect(cells.length).toBe(TOTAL_GRID_CELLS);
    expect(cells[FIRST_INDEX].column).toBe(0);
    expect(cells[FIRST_INDEX].row).toBe(0);
  });

  it('initializes game state with 5 target kanji in hiragana', () => {
    const state = createInitialGameState();
    expect(state.targetKanji.length).toBe(TARGET_KANJI_COUNT);
    state.targetKanji.forEach((target) => {
      expect(target.reading.length).toBeGreaterThan(0);
      expect(target.meaning.length).toBeGreaterThan(0);
    });
    expect(state.activeCellIndex).toBe(FIRST_INDEX);
    expect(state.submissionResult).toBeNull();
  });
});

describe('cell selection and stroke processing', () => {
  it('selects cells and changes target character', () => {
    const state = createInitialGameState();
    const cellSelected = selectCell(state, 1);
    expect(cellSelected.activeCellIndex).toBe(1);

    const charSelected = setSelectedChar(cellSelected, '木');
    expect(charSelected.selectedChar).toBe('木');
  });

  it('rejects wrong stroke order with error feedback', () => {
    const state = createInitialGameState();
    const wrongOrderState = processStrokeResult(
      state,
      { status: 'wrong-order', expectedIndex: 0, matchedIndex: 1 },
      2
    );
    expect(wrongOrderState.completedStrokeIndices).toEqual([]);
    expect(wrongOrderState.feedback.type).toBe('error');
    expect(wrongOrderState.feedback.message).toContain(
      'Incorrect stroke order'
    );
  });

  it('completes character into active cell and advances to next cell', () => {
    const state = {
      ...createInitialGameState(),
      selectedChar: '日',
      completedStrokeIndices: [0, 1, 2]
    };
    const completedState = processStrokeResult(
      state,
      { status: 'correct', expectedIndex: 3 },
      4
    );
    expect(completedState.gridCells[0].char).toBe('日');
    expect(completedState.gridCells[0].isTargetKanji).toBe(true);
    expect(completedState.activeCellIndex).toBe(1);
    expect(completedState.completedStrokeIndices).toEqual([]);
  });

  it('clears cell and resets character strokes', () => {
    const state = {
      ...createInitialGameState(),
      completedStrokeIndices: [0]
    };
    const resetState = resetCurrentCharacter(state);
    expect(resetState.completedStrokeIndices).toEqual([]);

    const clearedState = clearCell(state, 0);
    expect(clearedState.gridCells[0].char).toBeNull();
  });
});

describe('sentence submission scoring and tab switching', () => {
  it('scores sentence submission based on target kanji count and bonus', () => {
    const state = createInitialGameState();
    const cellsWithTwo = state.gridCells.map((cell) => {
      if (cell.index === 0) return { ...cell, char: '日' };
      if (cell.index === 1) return { ...cell, char: '山' };
      return cell;
    });

    const result = scoreSentenceSubmission(cellsWithTwo, state.targetKanji);
    expect(result.usedTargetKanji).toEqual(['日', '山']);
    expect(result.pointsAwarded).toBe(2 * POINTS_PER_TARGET_KANJI);

    const submitted = submitSentence({ ...state, gridCells: cellsWithTwo });
    expect(submitted.submissionResult?.pointsAwarded).toBe(
      2 * POINTS_PER_TARGET_KANJI
    );
  });

  it('awards full completion bonus when all 5 target kanji are used', () => {
    const state = createInitialGameState();
    const cellsWithAll = state.gridCells.map((cell) => {
      const target = state.targetKanji[cell.index];
      return target ? { ...cell, char: target.char } : cell;
    });

    const result = scoreSentenceSubmission(cellsWithAll, state.targetKanji);
    expect(result.usedTargetKanji.length).toBe(TARGET_KANJI_COUNT);
    const expectedScore =
      TARGET_KANJI_COUNT * POINTS_PER_TARGET_KANJI + ALL_TARGETS_BONUS_POINTS;
    expect(result.pointsAwarded).toBe(expectedScore);
  });

  it('toggles guides and switches tabs', () => {
    const state = createInitialGameState();
    const guideState = toggleGuide(state);
    expect(guideState.showGuide).toBe(true);

    const shopState = switchTab(state, 'shop');
    expect(shopState.activeTab).toBe('shop');
  });
});
