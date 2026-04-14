# Random Japanese Flashcards

Single-page app under `src/random-japanese-flashcards/`: shows a random kana-only word for reading practice, with a control to draw another word without an immediate repeat.

## Regenerating words

The word list is checked in as `words.json`. To refresh it from the upstream frequency source:

```bash
npm run generate:words
```

See `specs/random-japanese-flashcards.md` for behavior and licensing of the source data.
