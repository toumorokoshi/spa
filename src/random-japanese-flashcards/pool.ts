import { ALL_WORD_INDICES, KANA_WORDS } from './words';

const allIndicesOf = (words: readonly string[]): readonly number[] =>
  Array.from({ length: words.length }, (_, i) => i);

/** Indices into the word list for the current practice mode. */
export const poolIndices = (
  words: readonly string[],
  starred: ReadonlySet<string>,
  starredOnly: boolean
): readonly number[] => {
  if (!starredOnly) {
    return words === KANA_WORDS ? ALL_WORD_INDICES : allIndicesOf(words);
  }
  return words.flatMap((w, i) => (starred.has(w) ? [i] : []));
};

export const initialIndexFromPool = (
  pool: readonly number[],
  rng: () => number
): number => {
  if (pool.length === 0) {
    return 0;
  }
  const pick = Math.floor(rng() * pool.length);
  return pool[pick] ?? 0;
};

/** Uniform choice from `pool` excluding `current` when possible. */
export const nextIndexInPool = (
  pool: readonly number[],
  current: number,
  rng: () => number
): number => {
  if (pool.length === 0) {
    return 0;
  }
  if (pool.length === 1) {
    return pool[0] ?? 0;
  }
  const others = pool.filter((i) => i !== current);
  const pick = Math.floor(rng() * others.length);
  return others[pick] ?? current;
};
