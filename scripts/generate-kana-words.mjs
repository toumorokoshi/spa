/**
 * Builds the flashcard word list from Hermit Dave's Japanese frequency file
 * (MIT). Every distinct token is kept in corpus order for deduping, then:
 * - Kana-only tokens (no han script) are kept as-is (hiragana / katakana).
 * - Tokens containing kanji are tokenized with kuromoji; readings are converted
 *   to hiragana with wanakana (readings are katakana from the analyzer).
 *
 * Wanakana does not infer kanji readings by itself; kuromoji supplies them.
 *
 *   npm run generate:words
 */
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import kuromoji from 'kuromoji';
import * as wanakana from 'wanakana';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const LIST_URL =
  'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/ja/ja_full.txt';
const MIN_LENGTH = 2;

const dicPath = join(dirname(require.resolve('kuromoji/package.json')), 'dict');

const hasKanji = (s) => /\p{Script=Han}/u.test(s);

const isValidKanaOutput = (s) =>
  s.length >= MIN_LENGTH &&
  /^[\u3040-\u309F\u30A0-\u30FFー]+$/u.test(s) &&
  ![...s].some((ch) => wanakana.isKanji(ch)) &&
  !/[ヾゟ]/u.test(s);

/**
 * @param {import('kuromoji').Tokenizer} tokenizer
 */
const toFlashcardForm = (word, tokenizer) => {
  if (!wanakana.isJapanese(word)) {
    return null;
  }
  if (!hasKanji(word)) {
    return word;
  }
  const reading = tokenizer
    .tokenize(word)
    .map((t) => t.reading ?? '')
    .join('');
  if (!reading) {
    return null;
  }
  return wanakana.toHiragana(reading);
};

const buildTokenizer = () =>
  new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath }).build((err, tokenizer) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokenizer);
    });
  });

const main = async () => {
  const res = await fetch(LIST_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch word list: ${res.status}`);
  }
  const text = await res.text();
  const tokenizer = await buildTokenizer();

  const seen = new Set();
  const words = [];

  for (const line of text.split('\n')) {
    const word = line.split(/\s+/)[0];
    if (!word) {
      continue;
    }
    const out = toFlashcardForm(word, tokenizer);
    if (!out || !isValidKanaOutput(out) || seen.has(out)) {
      continue;
    }
    seen.add(out);
    words.push(out);
  }

  words.sort((a, b) => a.localeCompare(b, 'ja'));

  if (words.length === 0) {
    throw new Error('No words collected from source');
  }

  const outPath = join(
    __dirname,
    '..',
    'src',
    'random-japanese-flashcards',
    'words.json'
  );
  writeFileSync(outPath, `${JSON.stringify(words)}\n`, 'utf8');
  process.stdout.write(`Wrote ${words.length} words to ${outPath}\n`);
};

main().catch((err) => {
  process.stderr.write(`${err}\n`);
  process.exitCode = 1;
});
