import charactersJson from './characters.json';
import { CharacterData } from './types';

interface RawCharacterData {
  readonly char: string;
  readonly reading?: string;
  readonly meaning: string;
  readonly strokes: readonly (readonly (readonly [number, number])[])[];
}

const rawDict = charactersJson as unknown as Record<string, RawCharacterData>;

export const isKanji = (char: string): boolean => /[\u4e00-\u9faf]/.test(char);

export const CHARACTER_DICTIONARY: Record<string, CharacterData> =
  Object.fromEntries(
    Object.entries(rawDict).map(([k, v]) => [
      k,
      {
        char: v.char,
        reading: v.reading,
        meaning: v.meaning,
        strokes: v.strokes.map((s) => s.map(([x, y]) => ({ x, y })))
      }
    ])
  );

export const getCharacterData = (char: string): CharacterData => {
  const existing = CHARACTER_DICTIONARY[char];
  if (existing) {
    return existing;
  }
  return {
    char,
    meaning: 'Character',
    strokes: []
  };
};
