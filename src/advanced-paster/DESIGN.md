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
- `latex.ts`: Provides best-effort conversion from LaTeX symbols to Unicode characters.

### Third-Party Libraries

We use established libraries to ensure high-quality parsing:

- `turndown`: HTML -> Markdown
- `marked`: Markdown -> HTML
