import raw from './words.json';

export const KANA_WORDS: readonly string[] = raw;

export const ALL_WORD_INDICES: readonly number[] = Object.freeze(
  Array.from({ length: KANA_WORDS.length }, (_, i) => i)
);
