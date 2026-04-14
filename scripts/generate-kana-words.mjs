/**
 * Downloads Hermit Dave's Japanese frequency list (MIT), collects every
 * unique kana-only token (length >= 2), then sorts with the Japanese locale
 * so the bundled list spans the syllabary evenly (not only high-frequency
 * early-rank forms). Regenerate with:
 *   npm run generate:words
 */
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIST_URL =
  'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/ja/ja_full.txt';
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
