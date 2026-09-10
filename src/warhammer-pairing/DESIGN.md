# Warhammer Pairing Solver Architecture and Design

## Overview

`warhammer-pairing` follows the repository's core tenets of functional programming, separation of state from business logic, and modular testability:

- `src/warhammer-pairing/main.tsx`: Mounts Preact root component into `#app`.
- `src/warhammer-pairing/app.tsx`: Top-level state coordinator managing the current matrix, solved solution, active tab, and modal visibility.
- `src/warhammer-pairing/lib/types.ts`: Readonly interfaces for score matrices, game states, stage games, and solution outputs.
- `src/warhammer-pairing/lib/matrix-game.ts`: Pure functional zero-sum matrix game solver implementing pure saddle points, $2 \times 2$ analytical solutions, and primal simplex LP on the dual problem.
- `src/warhammer-pairing/lib/solver.ts`: Backward-induction extensive-form game solver with bitmask state encoding and subgame memoization.
- `src/warhammer-pairing/lib/parser.ts`: Intelligent clipboard parser and serializer supporting TSV, CSV, and varied header formats.
- `src/warhammer-pairing/lib/sample-data.ts`: Built-in tournament sample matrices.
- `src/warhammer-pairing/components/score-matrix-table.tsx`: Interactive score matrix editor with heatmap cell shading and direct clipboard paste listeners.
- `src/warhammer-pairing/components/solution-overview.tsx`: Visual report of game value, pure defender, exploitability gap, mixed strategies, and conditional attacker tables.
- `src/warhammer-pairing/components/draft-assistant.tsx`: Step-by-step tournament draft assistant managing round state, live advice, and scoreboard.
- `src/warhammer-pairing/components/explanation-guide.tsx`: In-page documentation and tournament guide.

## Key Design Considerations

### 1. Bitmask State Encoding & High-Performance Backward Induction

A pairing draft state is defined by the set of active remaining players for Team A and Team B.
Rather than using string keys or object sets, states are represented as bitmasks:

- Team A mask: 8 bits ($0 \dots 255$)
- Team B mask: 8 bits ($0 \dots 255$)
- Subgame cache key: `(maskA << 12) | maskB` (a single 32-bit integer).

This enables fast Map lookups and eliminates object allocation overhead during tree traversal, allowing the entire 8v8 game tree (5,685 states, ~110,000 subgames) to solve in ~750ms in JavaScript.

### 2. Dual Simplex Linear Programming Formulation

Zero-sum matrix games $P$ are solved by converting to linear programs:

- When shifted so all entries are positive ($P' = P + C > 0$), Player B's dual problem is:
  $$\text{Maximize } \sum q_j \quad \text{subject to } P' q \le 1, \; q \ge 0$$
- Since the right-hand side is $1 > 0$, the origin $q = 0$ is immediately basic feasible. No Phase 1 auxiliary optimization is required.
- Standard simplex pivots directly to optimality in just a few iterations. Player A's optimal mixed strategy is recovered directly from the dual slack variables.

### 3. Separation of State and Pure Calculations

All mathematical routines (`solveZeroSum`, `createSolver`, `computePickMatrix`, `parseScoreMatrix`, `serializeScoreMatrix`) are pure, side-effect-free functions isolated in `lib/`. React/Preact hooks (`useState`) are confined strictly to top-level containers in `components/` and `app.tsx`.

### 4. Seamless Clipboard UX

Tournament captains commonly prepare matrix predictions in Google Sheets or Microsoft Excel. When copying cells from spreadsheets, the clipboard payload is formatted as tab-separated values (`TSV`). The parser handles:

- Tab-delimited, comma-delimited, and semicolon-delimited tables.
- Leading empty cells (the corner cell of a matrix).
- Input with or without player name headers.
- Paste events dispatched anywhere on the interactive table or through the manual paste modal.
