# Random Japanese Flashcards

Single-page app under `src/random-japanese-flashcards/`: shows a random kana-only word for reading practice, with **Next card**, **Space** / **Enter** shortcuts, optional **starred** words persisted in the browser, and a **Practice starred only** mode that restricts draws to starred entries.

## Regenerating words

The word list is checked in as `words.json`. To refresh it from the upstream frequency source:

```bash
npm run generate:words
```

See `specs/random-japanese-flashcards.md` for behavior, licensing, and how kanji entries are converted to kana (kuromoji + wanakana in the generator only).
