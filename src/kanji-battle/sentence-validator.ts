import { isKanji } from './character-data';
import { ALLOWED_SENTENCE_KANJI } from './constants';
import { SentencePrompt } from './types';

export const isAllowedKanji = (char: string): boolean =>
  (ALLOWED_SENTENCE_KANJI as readonly string[]).includes(char);

export const extractKanjiFromText = (text: string): readonly string[] =>
  Array.from(text).filter(isKanji);

export const getDisallowedKanji = (text: string): readonly string[] =>
  extractKanjiFromText(text).filter((char) => !isAllowedKanji(char));

export const canConstructSentence = (text: string): boolean =>
  getDisallowedKanji(text).length === 0;

export const constructSentence = (prompt: SentencePrompt): SentencePrompt => {
  const disallowed = getDisallowedKanji(prompt.text);
  if (disallowed.length > 0) {
    throw new Error(
      `Cannot construct sentence "${prompt.text}": contains disallowed kanji [${disallowed.join(', ')}]. Only kanji in ALLOWED_SENTENCE_KANJI are permitted.`
    );
  }
  return prompt;
};

export const validateSentenceList = (
  sentences: readonly SentencePrompt[]
): readonly SentencePrompt[] => sentences.map(constructSentence);
