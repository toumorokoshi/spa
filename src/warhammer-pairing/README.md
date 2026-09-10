# Warhammer Pairing Solver

`warhammer-pairing` is a single-page application for computing optimal pairing draft strategies in competitive Warhammer 40,000 / Warhammer Fantasy team tournaments following the **World Team Championship (WTC)** and **European Team Championship (ETC)** 8v8 format.

## Overview & Purpose

In WTC-style team tournaments, two teams of 8 players face off across 8 tables. Each game awards 0–20 points (totaling 160 points per team match, where a 10–10 tie represents a draw). Because faction matchups and army lists can produce heavily skewed advantages, the draft pairing process is often the single most decisive factor in determining match outcomes.

This application models the draft as a **finite, zero-sum extensive-form game of imperfect information** (due to simultaneous secret nominations) and solves it exactly in the browser via **backward induction** and **nested linear programming (LP)**.

## Key Features

1. **Spreadsheet Copy-Paste (Excel & Google Sheets):**
   - Copy any score matrix directly from Google Sheets or Microsoft Excel (`Ctrl+C`) and paste it into the app (`Ctrl+V` or via the _Paste from Spreadsheet_ dialog).
   - Supports tab-separated (TSV), comma-separated (CSV), and semicolon-separated data.
   - Automatically detects player headers or generates default labels.
   - Allows inline editing of player names and scores directly in the interactive heatmap table.
   - Export matrix back to TSV with one click.

2. **Full Game-Theory Solution:**
   - **Game Expected Total:** Minimax game value (Team A's expected total out of 160 under optimal play).
   - **Best Pure Defender:** The single best deterministic defender choice for Round 1 and its guaranteed worst-case score.
   - **Exploitability Gap:** Difference between mixed Nash EV and deterministic pure play ($\Delta = V_{\text{Nash}} - V_{\text{pure}}$).
   - **Nash Mixed Strategies:** Probability distributions over defenders for both Team A and the opponent (predicted mix).
   - **Conditional Attacker Pairs:** Shows the optimal attacker pair $(a_1, a_2)$ to offer against every possible opponent defender.

3. **Interactive At-the-Table Draft Assistant:**
   - Digital replacement for static draft spreadsheets.
   - Guides captains through Rounds 1, 2, 3, and automatic Round 4.
   - Step 1: Recommended defender -> select actual defenders.
   - Step 2: Recommended attacker pair -> select actual attacker pairs.
   - Step 3: Recommended pick -> select actual picks.
   - Live scoreboard tracking **Locked-in Score**, **Remaining EV**, and **Projected Total**.
   - Full 8-matchup summary table with individual expected scores.

4. **100% Client-Side & Offline:**
   - Runs entirely in the browser with zero network calls at runtime.
   - Solves the full 8v8 game tree (5,685 states, ~110,000 evaluations) in under 1 second using bitmask indexing and an efficient primal simplex solver.

## How the WTC Draft Works

The draft occurs across 4 rounds:

- **Round 1 (8v8):**
  1. Both teams simultaneously nominate 1 Defender ($d_A, d_B$).
  2. Against the enemy defender, each team simultaneously offers 2 Attackers ($p_A, p_B$).
  3. Defenders simultaneously pick 1 enemy attacker to play against. Two pairings are locked in; rejected attackers return to the pool.
- **Round 2 (6v6):** Same process with the remaining 6 players per team.
- **Round 3 (4v4):** Same process with the remaining 4 players. Each team fields 1 defender, offers 2 attackers, and holds 1 reserve player.
- **Round 4 (Automatic):** The 2 rejected attackers and 2 held reserve players are automatically paired:
  - $(a_{\text{rejected}}, b_{\text{hold}})$
  - $(a_{\text{hold}}, b_{\text{rejected}})$
    All 8 tables are now assigned!

## Game Theory & Math

The draft is solved inside-out using backward induction:

1. **Level 3 (Defender Pick):** $2 \times 2$ zero-sum matrix game solved analytically or via LP.
2. **Level 2 (Attacker Pair Selection):** $\binom{k-1}{2} \times \binom{k-1}{2}$ zero-sum matrix game solved via Linear Programming.
3. **Level 1 (Defender Selection):** $k \times k$ zero-sum matrix game solved via Linear Programming.
   State values are memoized using compact 16-bit bitmask keys.
