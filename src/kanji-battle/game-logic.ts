import { FIRST_INDEX } from './constants';
import { GameState, StrokeMatchResult } from './types';

export const createInitialGameState = (
  sentenceIndex = FIRST_INDEX
): GameState => ({
  sentenceIndex,
  charIndex: FIRST_INDEX,
  completedStrokeIndices: [],
  feedback: {
    type: 'info',
    message: 'Write the highlighted character on the canvas below.'
  },
  showGuide: true,
  isSentenceComplete: false
});

const handleCompletedCharacter = (
  state: GameState,
  nextCompleted: readonly number[],
  sentenceLength: number
): GameState => {
  const nextCharIndex = state.charIndex + 1;
  if (nextCharIndex >= sentenceLength) {
    return {
      ...state,
      completedStrokeIndices: nextCompleted,
      isSentenceComplete: true,
      feedback: {
        type: 'success',
        message: 'Sentence complete! Excellent stroke execution!'
      }
    };
  }
  return {
    ...state,
    charIndex: nextCharIndex,
    completedStrokeIndices: [],
    feedback: {
      type: 'success',
      message: 'Character complete! Onto the next character.'
    }
  };
};

const handleCorrectStroke = (
  state: GameState,
  strokeIndex: number,
  totalStrokes: number,
  sentenceLength: number
): GameState => {
  const nextCompleted = [...state.completedStrokeIndices, strokeIndex];
  if (nextCompleted.length >= totalStrokes) {
    return handleCompletedCharacter(state, nextCompleted, sentenceLength);
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

export const advanceSentence = (
  state: GameState,
  direction: number,
  totalSentences: number
): GameState => {
  const nextIndex =
    (state.sentenceIndex + direction + totalSentences) % totalSentences;
  return createInitialGameState(nextIndex);
};

export const resetCurrentCharacter = (state: GameState): GameState => ({
  ...state,
  completedStrokeIndices: [],
  feedback: {
    type: 'info',
    message: 'Character cleared. Start drawing stroke 1.'
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
  totalStrokes: number,
  sentenceLength: number
): GameState => {
  if (result.status === 'correct' && result.expectedIndex !== undefined) {
    return handleCorrectStroke(
      state,
      result.expectedIndex,
      totalStrokes,
      sentenceLength
    );
  }
  return handleStrokeError(state, result);
};
