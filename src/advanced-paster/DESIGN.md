# Advanced Paster Design

## Core Architecture

This application follows strict functional programming principles and separates state/IO from core logic.

### IO and State (The Shell)

The main Preact component (`App`) handles all side-effects:

- Listening for global clipboard events (`window.addEventListener('paste', ...)`).
- Managing the `textarea` DOM events.
- Interacting with `navigator.clipboard` to write output.
- Managing the internal state (`rawText`, `detectedFormat`).

### Core Logic (The Core)

The `lib/` directory contains pure, side-effect-free transformation logic:

- `converter.ts`: Orchestrates the conversions. Given an input format and string, it returns a data structure containing all three converted formats (`html`, `markdown`, `plaintext`).
- `latex.ts`: Provides best-effort conversion from LaTeX symbols to Unicode characters, and supports parsing and converting inline/display LaTeX math blocks embedded inside Markdown and HTML structures.

### Third-Party Libraries

We use established libraries to ensure high-quality parsing:

- `turndown`: HTML -> Markdown
- `marked`: Markdown -> HTML

### Math Deduplication Strategy

When copying from sources like Wikipedia, math formulas are often duplicated in different formats side-by-side (e.g., plaintext fallback and Unicode/LaTeX). The converter uses `isDuplicate` to check if text before a LaTeX block is a duplicate of its converted Unicode counterpart:

- It normalizes both strings by mapping Unicode symbols/superscripts/subscripts back to their basic characters and stripping formatting and non-alphanumeric characters.
- It validates the common prefix length against a threshold (using `DEDUPLICATE_PREFIX_RATIO`).
- To prevent false-positive matches (such as when a candidate starts matching a prefix but contains a large trailing unmatched segment from adjacent formulas), it enforces that the normalized lengths of the fallback and expected strings do not differ by more than a factor of `2.0`.
