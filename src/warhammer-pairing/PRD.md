# Warhammer Pairing Solver PRD

## Problem Statement

Competitive Warhammer 40k / Warhammer Fantasy team tournaments (e.g. WTC / ETC) utilize an 8v8 pairing draft system where team captains must make simultaneous choices (Defenders, Attacker pairs, and Defender picks) over multiple rounds. The mathematical complexity of evaluating all possible branches across 5,685 draft states makes manual calculation impossible during the limited clock at the tournament table.

Previous tooling was implemented in Python (requiring NumPy, SciPy, command-line usage) and exported static Excel workbooks that required complex formula workarounds (`XLOOKUP`, `FILTER`, `LET`) which could be fragile on different spreadsheet software.

## Proposed Solution

A fast, offline-first, client-side Single Page Application (SPA) built with Preact and TypeScript that provides:

1. Flexible score matrix input via direct clipboard copy-paste from Google Sheets or Excel, or manual in-table editing.
2. Exact game-theoretic draft solving in <1 second directly in the browser.
3. Clear strategic presentation: Minimax game value, best pure defender recommendations, Nash mixed strategy probabilities, exploitability gaps, and conditional attacker tables.
4. An interactive at-the-table Draft Assistant guiding the captain through all 4 rounds with real-time advice and locked-in score tracking.

## Requirements

### Functional Requirements

- **Matrix Ingestion:**
  - Support pasting TSV (tab-separated) directly copied from Google Sheets / Excel.
  - Support pasting CSV (comma-separated) or semicolon-separated text.
  - Support matrices with or without row/column headers.
  - Provide inline editing for player names and score values ($0$ to $20$).
  - Provide preset sample datasets (8v8 tournament sample, 4v4 starter).
  - Export matrix back to TSV for easy copy-pasting back into spreadsheets.
- **Game Solver:**
  - Backward induction across all subgames ($8 \to 6 \to 4 \to \text{auto}$).
  - Minimax Nash equilibrium computation via linear programming (simplex).
  - Pure maximin calculation and exploitability gap determination.
  - Fast execution (<1 second in browser).
- **Solution Analysis:**
  - Display expected match total score out of 160.
  - Display best pure defender and worst-case guaranteed score.
  - Visual breakdown of mixed Nash equilibrium distributions.
  - Conditional attacker pairs table for selected defender vs. all opponent defenders.
- **Live Draft Assistant:**
  - Step-by-step round tracking (Round 1 to 4).
  - Dropdown selections for actual choices made by both captains.
  - Real-time optimal advice cards for Defender, Attacker pair, and Defender pick.
  - Scoreboard showing Locked-in Points, Remaining EV, and Projected Total.
  - Formed matchups table updating after each round.
- **Educational Guide:**
  - In-page documentation explaining tournament format, WTC pairing rules, game theory principles, and app usage.

### Non-Functional Requirements

- **Local & Offline:** Zero external network requests at runtime.
- **Performance:** Sub-second solve times for full 8v8 extensive-form trees.
- **Responsiveness:** Clean layout functional on desktop and tablet screens.
- **Quality & Safety:** Strict type safety in TypeScript, 100% test coverage of core game algorithms, zero ESLint warnings.
