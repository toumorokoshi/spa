export const STARS_STORAGE_KEY = 'random-japanese-flashcards:stars';

export const serializeStars = (words: readonly string[]): string =>
  JSON.stringify([...words].sort());

export const parseStars = (raw: string | null): string[] => {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
};

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export const readStars = (storage: StorageLike): string[] =>
  parseStars(storage.getItem(STARS_STORAGE_KEY));

export const writeStars = (
  storage: StorageLike,
  words: readonly string[]
): void => {
  storage.setItem(STARS_STORAGE_KEY, serializeStars(words));
};
