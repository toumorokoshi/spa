# Kanji Battle

Single-page app under `src/kanji-battle/`: an interactive Japanese sentence writing practice game featuring handwriting stroke recognition, stroke order enforcement, memory-based kanji recall, persistent point rewards, and a LEGO minifigure companion shop.

## Features

- **Free Sentence Writing Mode**: Players compose their own Japanese sentences in an authentic manuscript grid written top-to-bottom and right-to-left (縦書き).
- **5-Kanji Challenge in Hiragana**: Each challenge provides 5 target kanji shown exclusively in hiragana readings and English meanings, challenging the player to recall and write each kanji from memory.
- **Stroke Order & Geometry Validation**: Real-time handwriting recognition verifies each stroke shape and enforces correct stroke order with immediate interactive feedback.
- **Submission Scoring & Point Rewards**: Players submit their completed sentence and receive points based on how many of the 5 target kanji were used (`+50 pts` per target kanji, plus full completion bonus). Points persist in `localStorage`.
- **Minifigure Shop**: Players can spend accumulated points to unlock and equip collectible LEGO minifigure companions that appear in the app header.

## Configuration

- **Allowed Sentence Kanji**: The available kanji that can be used to construct sentences are defined as a constant array `ALLOWED_SENTENCE_KANJI` in `src/kanji-battle/constants.ts`. All sentence prompts are validated against this list to guarantee only supported kanji are presented to the player.
