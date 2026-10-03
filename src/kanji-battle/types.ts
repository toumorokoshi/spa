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

export interface InventoryItem {
  readonly id: string;
  readonly count: number;
}

export interface PlayerProfile {
  readonly points: number;
  readonly purchasedItemIds: readonly string[];
  readonly inventory: readonly InventoryItem[];
  readonly unopenedBoxesCount: number;
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
  readonly strokes?: readonly Stroke[];
}

export interface CellEvaluation {
  readonly cellIndex: number;
  readonly char: string | null;
  readonly isTargetKanji: boolean;
  readonly status: 'target-kanji' | 'recognized-kana' | 'valid-kana' | 'empty';
  readonly feedback: string;
}

export interface SentenceSubmissionResult {
  readonly usedTargetKanji: readonly string[];
  readonly unusedTargetKanji: readonly string[];
  readonly pointsAwarded: number;
  readonly sentenceText: string;
  readonly cellEvaluations?: readonly CellEvaluation[];
}

export interface KanjiYearOption {
  readonly year: number;
  readonly label: string;
  readonly description: string;
  readonly kanji: readonly string[];
}

export interface KanjiConfig {
  readonly selectedYear: number;
  readonly selectedKanji: readonly string[];
}

export interface GameState {
  readonly activeTab: 'practice' | 'inventory' | 'shop';
  readonly isConfiguring: boolean;
  readonly config: KanjiConfig;
  readonly targetKanji: readonly TargetKanjiPrompt[];
  readonly gridCells: readonly GridCell[];
  readonly activeCellIndex: number;
  readonly selectedChar: string | null;
  readonly activeMode: 'freeform' | 'kanji';
  readonly freeformStrokes: readonly Stroke[];
  readonly completedStrokeIndices: readonly number[];
  readonly feedback: FeedbackState;
  readonly showGuide: boolean;
  readonly submissionResult: SentenceSubmissionResult | null;
}
