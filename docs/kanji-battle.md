# Kanji Battle

Single-page app under `src/kanji-battle/`: an interactive Japanese sentence writing practice game featuring handwriting stroke recognition, stroke order enforcement, memory-based kanji recall, persistent point rewards, and a LEGO minifigure companion shop.

## Features

- **Free Sentence Writing Mode**: Players compose their own Japanese sentences in an authentic manuscript grid written top-to-bottom and right-to-left (縦書き).
- **5-Kanji Challenge in Hiragana**: Each challenge provides 5 target kanji shown exclusively in hiragana readings and English meanings, challenging the player to recall and write each kanji from memory.
- **Freeform Writing Flow**: The player does not need to specify hiragana beforehand. They write each cell freely on the stylus canvas, then click "Submit Character ▶" to commit strokes and advance to the next cell.
- **Target Kanji Real-Time Stroke Order Enforcement**: For kanji, the player selects the target kanji card they are writing, and the game enforces stroke order and stroke geometry in real time with guidelines and hints.
- **End-of-Sentence Evaluation & Breakdown**: Correctness evaluation is performed upon sentence submission. The system verifies target kanji, matches handwritten kana strokes, displays an evaluated character chip breakdown in a submission modal, and awards points based on target kanji used (`+50 pts` per target kanji, plus completion bonus). Points persist in `localStorage`.
- **Blind Boxes**: Completing a practice round awards a mystery blind box. Players click the box to unbox a random collectible minifigure with pop-out reveal animations. Unboxed figures are added to the player's inventory, and duplicates increase the item's count badge.
- **Minifigure Inventory**: A dedicated Inventory tab displays all purchased items and received minifigures with owned duplicate counts (`x1`, `x2`, etc.), total collection metrics, and equipping controls. Any unopened blind boxes can also be opened directly from the inventory.
- **Authentic Lego Minifigure Vector System**: Features a dedicated, lightweight SVG rendering engine that recreates the authentic 1:1 Lego minifigure anatomy (cylindrical stud head, yellow skin tone, curved arms with trademark C-clamp hands, trapezoidal torso, and dual-stud leg blocks with foot notches).
- **Minifigure Collection & Shop**: Features an expanded catalog of 24 collectible brick companions (including Dinosaur, Ninja, King, Jester, Samurai, Robot, Astronaut, etc.) styled with tailored headgear (crowns, cowls, helmets, hats), facial expressions, and themed torso prints/accessories. Minifigures are rendered crisp and scalable in the Shop, Inventory, Companion Badge, and Blind Box unboxing modal.
- **Tablet-Friendly Form Factor**: Optimized for stylus handwriting on tablet devices (e.g. iPad with Apple Pencil):
  - **Dominant Writing Desk**: The canvas and immediate character controls occupy the primary real estate of the screen, scaling up to 480px with high-resolution drawing buffers, accurate pointer capture, and ample wrist/palm resting margins.
  - **Collapsible Reference Sidebar**: On tablet screens ($\ge 768\text{px}$), target kanji prompts and the 20-cell manuscript grid sit in a compact, sticky sidebar on the left so writers can reference their sentence while drawing.
  - **Focus Mode & Narrow Top Fold**: The sidebar can be folded away at any time to grant 100% full-width real estate to the writing canvas with a reopen pill. On mobile viewports, the reference pane collapses into a narrow fold on top to avoid vertical scrolling.

## Configuration

- **Pre-Game Configuration Workflow**: Before the game mode begins, players configure their practice session through a 3-step workflow:
  1. **Select Year of Kanji**: Choose the school grade level (Year 1, Year 2, or Year 3 elementary kanji — 440 total kanji across the first 3 grades).
  2. **Select Kanji to Practice**: Select exactly 5 specific kanji cards from the chosen year, with helper actions to pick 5 random kanji or select the first 5.
  3. **Start Game**: Transitions into the active writing game mode with the selected kanji as target prompts.
- **Allowed Sentence Kanji**: The available kanji that can be used to construct sentences are defined as a constant array `ALLOWED_SENTENCE_KANJI` in `src/kanji-battle/constants.ts`, containing all 440 kanji across Year 1 (80), Year 2 (160), and Year 3 (200) with complete stroke recognition data, elementary school hiragana readings, and English meanings.
- **Persistent Preferences**: Selected configuration is stored in `localStorage` under `kanji-battle:config`, preserving chosen grade levels and kanji selections across sessions.
