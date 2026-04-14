/**
 * Downloads Hermit Dave's Japanese frequency list (MIT) and writes kana-only
 * words (length >= 2) in frequency order. Regenerate with:
 *   node scripts/generate-kana-words.mjs
 */
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIST_URL =
  'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/ja/ja_full.txt';
const TARGET_COUNT = 3500;
const MIN_LENGTH = 2;

const kanaOnly = /^[\u3040-\u309F\u30A0-\u30FFー]+$/u;

const main = async () => {
  const res = await fetch(LIST_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch word list: ${res.status}`);
  }
  const text = await res.text();
  const seen = new Set();
  const words = [];

  for (const line of text.split('\n')) {
    const word = line.split(/\s+/)[0];
    if (!word || word.length < MIN_LENGTH || !kanaOnly.test(word)) {
      continue;
    }
    if (seen.has(word)) {
      continue;
    }
    seen.add(word);
    words.push(word);
    if (words.length >= TARGET_COUNT) {
      break;
    }
  }

  if (words.length < TARGET_COUNT) {
    throw new Error(
      `Expected at least ${TARGET_COUNT} words, got ${words.length}`
    );
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
