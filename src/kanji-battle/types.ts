export interface Point {
  readonly x: number;
  readonly y: number;
}

export type Stroke = readonly Point[];

export interface CharacterData {
  readonly char: string;
  readonly reading?: string;
  readonly meaning: string;
  readonly strokes: readonly Stroke[];
}

export interface SentencePrompt {
  readonly id: string;
  readonly text: string;
  readonly english: string;
  readonly kana: string;
  readonly points: number;
}

export interface ShopItem {
  readonly id: string;
  readonly name: string;
  readonly category: 'minifigure';
  readonly price: number;
  readonly icon: string;
  readonly description: string;
}

export interface PlayerProfile {
  readonly points: number;
  readonly purchasedItemIds: readonly string[];
  readonly equippedItemId: string | null;
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

export interface TargetKanjiPrompt {
  readonly char: string;
  readonly reading: string;
  readonly meaning: string;
}

export interface GridCell {
  readonly index: number;
  readonly column: number;
  readonly row: number;
  readonly char: string | null;
  readonly isTargetKanji: boolean;
}

export interface SentenceSubmissionResult {
  readonly usedTargetKanji: readonly string[];
  readonly unusedTargetKanji: readonly string[];
  readonly pointsAwarded: number;
  readonly sentenceText: string;
}

export interface GameState {
  readonly activeTab: 'practice' | 'shop';
  readonly targetKanji: readonly TargetKanjiPrompt[];
  readonly gridCells: readonly GridCell[];
  readonly activeCellIndex: number;
  readonly selectedChar: string;
  readonly completedStrokeIndices: readonly number[];
  readonly feedback: FeedbackState;
  readonly showGuide: boolean;
  readonly submissionResult: SentenceSubmissionResult | null;
}
