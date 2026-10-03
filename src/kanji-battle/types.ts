export interface Point {
  readonly x: number;
  readonly y: number;
}

export type Stroke = readonly Point[];

export interface CharacterData {
  readonly char: string;
  readonly meaning: string;
  readonly strokes: readonly Stroke[];
}

export interface SentencePrompt {
  readonly id: string;
  readonly text: string;
  readonly english: string;
  readonly kana: string;
}

export interface StrokeMatchResult {
  readonly status:
    | 'correct'
    | 'wrong-order'
    | 'wrong-direction'
    | 'unrecognized'
    | 'too-short';
  readonly expectedIndex?: number;
  readonly matchedIndex?: number;
}

export interface FeedbackState {
  readonly type: 'info' | 'success' | 'warning' | 'error';
  readonly message: string;
}

export interface GameState {
  readonly sentenceIndex: number;
  readonly charIndex: number;
  readonly completedStrokeIndices: readonly number[];
  readonly feedback: FeedbackState;
  readonly showGuide: boolean;
  readonly isSentenceComplete: boolean;
}
