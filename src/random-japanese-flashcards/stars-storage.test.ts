import { describe, it, expect } from 'vitest';
import {
  parseStars,
  readStars,
  serializeStars,
  writeStars
} from './stars-storage';

describe('serializeStars / parseStars', () => {
  it('round-trips and sorts', () => {
    const raw = serializeStars(['b', 'a']);
    expect(raw).toBe('["a","b"]');
    expect(parseStars(raw)).toEqual(['a', 'b']);
  });

  it('parseStars handles invalid json', () => {
    expect(parseStars('not json')).toEqual([]);
    expect(parseStars(null)).toEqual([]);
    expect(parseStars('{}')).toEqual([]);
  });
});

describe('readStars / writeStars', () => {
  it('uses storage', () => {
    const store: Record<string, string> = {};
    const storage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      }
    };
    writeStars(storage, ['みどり', 'あお']);
    expect(readStars(storage)).toEqual(['あお', 'みどり']);
  });
});
