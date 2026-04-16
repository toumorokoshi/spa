# Design

- When the page loads, a random Japanese word is shown.
- The set of flashcards focuses on common words (large list derived from a frequency corpus: kana tokens as-is, kanji tokens converted to hiragana readings; see `specs/random-japanese-flashcards.md`).
- The words are in hiragana and katakana (and prolonged sound mark where applicable).
- A **Next card** control chooses another random card and **does not repeat** the previous card when more than one word exists in the active pool (full list or starred-only).
- **Space** and **Enter** advance the card like **Next card**.
- Users can **star** words and optionally practice **starred words only** (saved in the browser).
