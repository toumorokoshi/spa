import { describe, it, expect } from 'vitest';
import {
  ALL_TARGETS_BONUS_POINTS,
  ALLOWED_SENTENCE_KANJI,
  DEFAULT_SELECTED_YEAR,
  FIRST_INDEX,
  KANJI_YEAR_1,
  KANJI_YEAR_2,
  KANJI_YEAR_3,
  POINTS_PER_TARGET_KANJI,
  SECOND_YEAR,
  TARGET_KANJI_COUNT,
  THIRD_YEAR,
  TOTAL_GRID_CELLS
} from './constants';
import { getCharacterData } from './character-data';
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
  switchTab,
  getKanjiYearOption,
  selectYearConfig,
  toggleKanjiSelection,
  selectRandomKanjiForYear,
  isConfigReadyToStart,
  openConfiguration,
  closeConfiguration,
  updateConfig,
  startGameWithConfig,
  addFreeformStroke,
  submitActiveCell,
  setSelectedTargetKanji
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

describe('kanji configuration options and selection helpers', () => {
  it('retrieves year options and kanji lists', () => {
    const year1 = getKanjiYearOption(DEFAULT_SELECTED_YEAR);
    expect(year1.year).toBe(DEFAULT_SELECTED_YEAR);
    expect(year1.kanji).toEqual(KANJI_YEAR_1);
    expect(year1.kanji.length).toBe(80);

    const year2 = getKanjiYearOption(SECOND_YEAR);
    expect(year2.year).toBe(SECOND_YEAR);
    expect(year2.kanji).toEqual(KANJI_YEAR_2);
    expect(year2.kanji.length).toBe(160);

    const year3 = getKanjiYearOption(THIRD_YEAR);
    expect(year3.year).toBe(THIRD_YEAR);
    expect(year3.kanji).toEqual(KANJI_YEAR_3);
    expect(year3.kanji.length).toBe(200);
  });

  it('switches year configuration and populates target kanji', () => {
    const initialConfig = {
      selectedYear: DEFAULT_SELECTED_YEAR,
      selectedKanji: ['日', '山', '木', '水', '火']
    };
    const year2Config = selectYearConfig(initialConfig, SECOND_YEAR);
    expect(year2Config.selectedYear).toBe(SECOND_YEAR);
    expect(year2Config.selectedKanji.length).toBe(TARGET_KANJI_COUNT);
    year2Config.selectedKanji.forEach((char) => {
      expect((KANJI_YEAR_2 as readonly string[]).includes(char)).toBe(true);
    });

    const year3Config = selectYearConfig(initialConfig, THIRD_YEAR);
    expect(year3Config.selectedYear).toBe(THIRD_YEAR);
    expect(year3Config.selectedKanji.length).toBe(TARGET_KANJI_COUNT);
    year3Config.selectedKanji.forEach((char) => {
      expect((KANJI_YEAR_3 as readonly string[]).includes(char)).toBe(true);
    });
  });
});

describe('kanji selection and character dataset validation', () => {
  it('toggles kanji selection and enforces 5 kanji limit', () => {
    const config = {
      selectedYear: DEFAULT_SELECTED_YEAR,
      selectedKanji: ['日', '山', '木', '水', '火']
    };
    // Deselect one
    const withoutSun = toggleKanjiSelection(config, '日');
    expect(withoutSun.selectedKanji).toEqual(['山', '木', '水', '火']);
    expect(isConfigReadyToStart(withoutSun)).toBe(false);

    // Re-select another
    const withMoon = toggleKanjiSelection(withoutSun, '月');
    expect(withMoon.selectedKanji).toEqual(['山', '木', '水', '火', '月']);
    expect(isConfigReadyToStart(withMoon)).toBe(true);

    // Cannot add beyond 5
    const overflow = toggleKanjiSelection(withMoon, '川');
    expect(overflow.selectedKanji.length).toBe(TARGET_KANJI_COUNT);
    expect(overflow.selectedKanji).toEqual(withMoon.selectedKanji);
  });

  it('selects 5 random kanji for a year', () => {
    const randomSet2 = selectRandomKanjiForYear(
      SECOND_YEAR,
      TARGET_KANJI_COUNT
    );
    expect(randomSet2.length).toBe(TARGET_KANJI_COUNT);
    const unique2 = new Set(randomSet2);
    expect(unique2.size).toBe(TARGET_KANJI_COUNT);

    const randomSet3 = selectRandomKanjiForYear(THIRD_YEAR, TARGET_KANJI_COUNT);
    expect(randomSet3.length).toBe(TARGET_KANJI_COUNT);
    const unique3 = new Set(randomSet3);
    expect(unique3.size).toBe(TARGET_KANJI_COUNT);
    randomSet3.forEach((char) => {
      expect((KANJI_YEAR_3 as readonly string[]).includes(char)).toBe(true);
    });
  });

  it('verifies all 440 kanji in years 1-3 have complete character data', () => {
    expect(ALLOWED_SENTENCE_KANJI.length).toBe(440);
    ALLOWED_SENTENCE_KANJI.forEach((char) => {
      const data = getCharacterData(char);
      expect(data.char).toBe(char);
      expect(data.reading).toBeTruthy();
      expect(data.meaning).toBeTruthy();
      expect(data.strokes.length).toBeGreaterThan(0);
    });
  });
});

describe('kanji game state transitions with configuration', () => {
  it('starts game with configuration, initializes targets, and exits configuration view', () => {
    const state = createInitialGameState();
    expect(state.isConfiguring).toBe(true);

    const year2Config = {
      selectedYear: SECOND_YEAR,
      selectedKanji: ['行', '今', '午', '古', '万']
    };
    const started = startGameWithConfig(state, year2Config);
    expect(started.isConfiguring).toBe(false);
    expect(started.config).toEqual(year2Config);
    expect(started.targetKanji.map((t) => t.char)).toEqual(
      year2Config.selectedKanji
    );
    expect(started.selectedChar).toBeNull();
    expect(started.activeMode).toBe('freeform');
    expect(started.gridCells.length).toBe(TOTAL_GRID_CELLS);

    const kanjiSelected = setSelectedTargetKanji(started, '行');
    expect(kanjiSelected.selectedChar).toBe('行');
    expect(kanjiSelected.activeMode).toBe('kanji');
  });

  it('supports freeform stroke drawing and cell submission without prior character selection', () => {
    const state = createInitialGameState();
    const started = startGameWithConfig(state, state.config);
    expect(started.activeMode).toBe('freeform');

    const withStroke = addFreeformStroke(started, [
      { x: 10, y: 10 },
      { x: 20, y: 20 }
    ]);
    expect(withStroke.freeformStrokes.length).toBe(1);

    const submitted = submitActiveCell(withStroke);
    expect(submitted.activeCellIndex).toBe(1);
    expect(submitted.gridCells[0].strokes?.length).toBe(1);
    expect(submitted.gridCells[0].char).toBeNull();
  });

  it('allows opening, closing, and updating configuration state', () => {
    const playingState = { ...createInitialGameState(), isConfiguring: false };
    const opened = openConfiguration(playingState);
    expect(opened.isConfiguring).toBe(true);

    const closed = closeConfiguration(opened);
    expect(closed.isConfiguring).toBe(false);

    const customConfig = {
      selectedYear: SECOND_YEAR,
      selectedKanji: ['行', '今', '午', '古', '万']
    };
    const updated = updateConfig(closed, customConfig);
    expect(updated.config).toEqual(customConfig);
  });
});
