import {
  SENTENCE_POINTS_SHORT,
  SENTENCE_POINTS_MEDIUM,
  SENTENCE_POINTS_LONG
} from './constants';
import { validateSentenceList } from './sentence-validator';
import { SentencePrompt } from './types';

export const SENTENCE_LIST: readonly SentencePrompt[] = validateSentenceList([
  {
    id: 'sun-mountain',
    text: '日は山から出る',
    english: 'The sun rises from the mountain.',
    kana: 'ひはやまからでる',
    points: SENTENCE_POINTS_LONG
  },
  {
    id: 'numbers',
    text: '一二三四五',
    english: 'One, two, three, four, five.',
    kana: 'いちにさんしご',
    points: SENTENCE_POINTS_MEDIUM
  },
  {
    id: 'big-tree',
    text: '大きな木',
    english: 'A big tree.',
    kana: 'おおきなき',
    points: SENTENCE_POINTS_SHORT
  },
  {
    id: 'elements',
    text: '木と水と火',
    english: 'Wood, water, and fire.',
    kana: 'きとみずとひ',
    points: SENTENCE_POINTS_MEDIUM
  },
  {
    id: 'body-parts',
    text: '口と目と手',
    english: 'Mouth, eyes, and hands.',
    kana: 'くちとめとて',
    points: SENTENCE_POINTS_MEDIUM
  },
  {
    id: 'japan-trip',
    text: '日本に行く',
    english: 'Going to Japan.',
    kana: 'にほんにいく',
    points: SENTENCE_POINTS_MEDIUM
  }
]);
