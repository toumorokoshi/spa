# Kanji Battle

Single-page app under `src/kanji-battle/`: an interactive Japanese sentence writing practice game featuring handwriting stroke recognition, stroke order enforcement, memory-based kanji recall, persistent point rewards, and a LEGO minifigure companion shop.

## Features

- **Free Sentence Writing Mode**: Players compose their own Japanese sentences in an authentic manuscript grid written top-to-bottom and right-to-left (縦書き).
- **5-Kanji Challenge in Hiragana**: Each challenge provides 5 target kanji shown exclusively in hiragana readings and English meanings, challenging the player to recall and write each kanji from memory. Clicking any target card selects it for writing in the active grid cell.
- **Connecting Kana Palette**: Players can choose grammatical particles and connecting kana (は, の, に, を, etc.) directly for sentence grid cells without duplicating target cards.
- **Stroke Order & Geometry Validation**: Real-time handwriting recognition verifies each stroke shape and enforces correct stroke order with immediate interactive feedback, evaluating current and future strokes sequentially.
- **Submission Scoring & Point Rewards**: Players submit their completed sentence and receive points based on how many of the 5 target kanji were used (`+50 pts` per target kanji, plus full completion bonus). Points persist in `localStorage`.
- **Minifigure Shop**: Players can spend accumulated points to unlock and equip collectible LEGO minifigure companions that appear in the app header.

## Configuration

- **Pre-Game Configuration Workflow**: Before the game mode begins, players configure their practice session through a 3-step workflow:
  1. **Select Year of Kanji**: Choose the school grade level (Year 1, Year 2, or Year 3 elementary kanji — 440 total kanji across the first 3 grades).
  2. **Select Kanji to Practice**: Select exactly 5 specific kanji cards from the chosen year, with helper actions to pick 5 random kanji or select the first 5.
  3. **Start Game**: Transitions into the active writing game mode with the selected kanji as target prompts.
- **Allowed Sentence Kanji**: The available kanji that can be used to construct sentences are defined as a constant array `ALLOWED_SENTENCE_KANJI` in `src/kanji-battle/constants.ts`, containing all 440 kanji across Year 1 (80), Year 2 (160), and Year 3 (200) with complete stroke recognition data, elementary school hiragana readings, and English meanings.
- **Persistent Preferences**: Selected configuration is stored in `localStorage` under `kanji-battle:config`, preserving chosen grade levels and kanji selections across sessions.
