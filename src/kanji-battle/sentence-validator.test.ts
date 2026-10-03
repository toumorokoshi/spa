import { describe, it, expect } from 'vitest';
import { ALLOWED_SENTENCE_KANJI, SENTENCE_POINTS_SHORT } from './constants';
import { isKanji } from './character-data';
import {
  isAllowedKanji,
  extractKanjiFromText,
  getDisallowedKanji,
  canConstructSentence,
  constructSentence,
  validateSentenceList
} from './sentence-validator';
import { SentencePrompt } from './types';
import { SENTENCE_LIST } from './sentences-data';

describe('configuration: ALLOWED_SENTENCE_KANJI constants', () => {
  it('contains valid kanji characters', () => {
    expect(ALLOWED_SENTENCE_KANJI.length).toBeGreaterThan(0);
    ALLOWED_SENTENCE_KANJI.forEach((char) => {
      expect(isKanji(char)).toBe(true);
    });
  });

  it('correctly identifies allowed and disallowed kanji', () => {
    expect(isAllowedKanji('日')).toBe(true);
    expect(isAllowedKanji('木')).toBe(true);
    expect(isAllowedKanji('火')).toBe(true);

    // Unconfigured kanji
    expect(isAllowedKanji('私')).toBe(false);
    expect(isAllowedKanji('電')).toBe(false);

    // Kana characters
    expect(isAllowedKanji('は')).toBe(false);
    expect(isAllowedKanji('あ')).toBe(false);
  });
});

describe('sentence-validator: text extraction and validation', () => {
  it('extracts kanji characters from mixed text', () => {
    const kanji = extractKanjiFromText('日は山から出る');
    expect(kanji).toEqual(['日', '山', '出']);

    const kanaOnly = extractKanjiFromText('ひらがな');
    expect(kanaOnly).toEqual([]);
  });

  it('detects allowed and disallowed sentences', () => {
    expect(canConstructSentence('日は山から出る')).toBe(true);
    expect(canConstructSentence('大きな木')).toBe(true);

    // Contains unconfigured kanji: 私 and 見
    expect(canConstructSentence('私は木を見る')).toBe(false);
    expect(getDisallowedKanji('私は木を見る')).toEqual(['私', '見']);
  });

  it('constructs valid sentence prompts and rejects invalid ones', () => {
    const validPrompt: SentencePrompt = {
      id: 'custom-valid',
      text: '木と水',
      english: 'Tree and water.',
      kana: 'きとみず',
      points: SENTENCE_POINTS_SHORT
    };
    expect(constructSentence(validPrompt)).toEqual(validPrompt);

    const invalidPrompt: SentencePrompt = {
      id: 'custom-invalid',
      text: '電車に乗る',
      english: 'Ride the train.',
      kana: 'でんしゃにのる',
      points: SENTENCE_POINTS_SHORT
    };
    expect(() => constructSentence(invalidPrompt)).toThrow(/disallowed kanji/);
  });

  it('validates that all sentences in SENTENCE_LIST use allowed kanji', () => {
    const validated = validateSentenceList(SENTENCE_LIST);
    expect(validated.length).toBe(SENTENCE_LIST.length);
  });
});
