import { describe, it, expect } from 'vitest';
import {
  createInitialGameState,
  processStrokeResult,
  advanceSentence,
  resetCurrentCharacter,
  toggleGuide
} from './game-logic';

describe('stroke result handling', () => {
  it('creates initial game state', () => {
    const state = createInitialGameState(0);
    expect(state.sentenceIndex).toBe(0);
    expect(state.charIndex).toBe(0);
    expect(state.completedStrokeIndices).toEqual([]);
    expect(state.showGuide).toBe(true);
    expect(state.isSentenceComplete).toBe(false);
  });

  it('accepts correct stroke and updates completed strokes', () => {
    const state = createInitialGameState(0);
    const nextState = processStrokeResult(
      state,
      { status: 'correct', expectedIndex: 0 },
      2,
      3
    );
    expect(nextState.completedStrokeIndices).toEqual([0]);
    expect(nextState.feedback.type).toBe('success');
  });

  it('advances character when all strokes are complete', () => {
    const state = {
      ...createInitialGameState(0),
      completedStrokeIndices: [0]
    };
    const nextState = processStrokeResult(
      state,
      { status: 'correct', expectedIndex: 1 },
      2,
      3
    );
    expect(nextState.charIndex).toBe(1);
    expect(nextState.completedStrokeIndices).toEqual([]);
  });

  it('completes sentence when all characters are complete', () => {
    const state = {
      ...createInitialGameState(0),
      charIndex: 2,
      completedStrokeIndices: [0]
    };
    const nextState = processStrokeResult(
      state,
      { status: 'correct', expectedIndex: 1 },
      2,
      3
    );
    expect(nextState.isSentenceComplete).toBe(true);
    expect(nextState.feedback.type).toBe('success');
    expect(nextState.feedback.message).toContain('Sentence complete');
  });

  it('reports error on wrong stroke order and does not advance', () => {
    const state = createInitialGameState(0);
    const nextState = processStrokeResult(
      state,
      { status: 'wrong-order', expectedIndex: 0, matchedIndex: 1 },
      2,
      3
    );
    expect(nextState.completedStrokeIndices).toEqual([]);
    expect(nextState.feedback.type).toBe('error');
    expect(nextState.feedback.message).toContain('Incorrect stroke order');
  });
});

describe('sentence navigation and controls', () => {
  it('handles wrong direction, short strokes, and unrecognized strokes', () => {
    const state = createInitialGameState(0);
    const revState = processStrokeResult(
      state,
      { status: 'wrong-direction' },
      2,
      3
    );
    expect(revState.feedback.type).toBe('warning');

    const shortState = processStrokeResult(
      state,
      { status: 'too-short' },
      2,
      3
    );
    expect(shortState.feedback.type).toBe('info');

    const unrecState = processStrokeResult(
      state,
      { status: 'unrecognized' },
      2,
      3
    );
    expect(unrecState.feedback.type).toBe('warning');
  });

  it('cycles sentences forward and backward', () => {
    const state = createInitialGameState(0);
    const forward = advanceSentence(state, 1, 5);
    expect(forward.sentenceIndex).toBe(1);

    const backward = advanceSentence(state, -1, 5);
    expect(backward.sentenceIndex).toBe(4);
  });

  it('resets character and toggles guide', () => {
    const state = {
      ...createInitialGameState(0),
      completedStrokeIndices: [0],
      showGuide: true
    };
    const reset = resetCurrentCharacter(state);
    expect(reset.completedStrokeIndices).toEqual([]);

    const toggled = toggleGuide(state);
    expect(toggled.showGuide).toBe(false);
  });
});
