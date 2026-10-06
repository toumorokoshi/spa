# spa

YFT's simple single page apps, primarily for personal use.

This repository contains a series of directories, each of which contains a
single-page-application that serves a particular purpose.

Although each subdirectory under `src/` is its own application, the whole
project is compiled as a single package and served via GitHub Pages.

## Applications

- **[Random Japanese Flashcards](/spa/src/random-japanese-flashcards/)** — Spaced-repetition Japanese vocabulary flashcard practice.
- **[Advanced Paster](/spa/src/advanced-paster/)** — Multi-format clipboard converter for rich text, HTML, LaTeX formulas (via Temml), and Markdown.
- **[Mermaid Editor](/spa/src/mermaid-editor/)** — Live client-side Mermaid diagram editor with theme selection and export.
- **[Warhammer Pairing Solver](/spa/src/warhammer-pairing/)** — Optimal pairing-strategy solver for WTC/ETC-style 8v8 Warhammer team drafts. Treats the tournament draft as a zero-sum extensive-form game solved via backward induction and nested linear programming. Features direct spreadsheet copy-paste (Excel/Google Sheets), Nash equilibrium calculations, pure-maximin recommendations with exploitability gaps, and an interactive at-the-table live draft assistant.
- **[Kanji Battle](/spa/src/kanji-battle/)** — Interactive Japanese kanji stroke handwriting practice and battle game.
- **[Agent Host Protocol UI](/spa/src/agent-host-protocol-ui/)** — Client-side web UI for services implementing the Agent Host Protocol (AHP), inspired by the VS Code Agents view. Directly connects over WebSocket to manage agent sessions, inspect streaming reasoning, and approve tool calls. Supports multiple AHP hosts with a passphrase-encrypted settings vault.

## Requirements

- **Local-only at runtime:** Each SPA must work without contacting third-party
  origins while you use it. Do not load scripts, stylesheets, fonts, or data from
  external URLs in the built app; ship everything needed via the Vite bundle and
  static assets under `public/` (or the app directory). Do not call remote APIs
  from app code unless there is an explicit, documented exception.
- **Offline after a successful load:** Once a page and its assets have been
  loaded over the network, using the app should not require further network
  access. (Repeat visits while fully offline depend on the browser’s HTTP cache;
  this project does not ship a service worker.)

## Tech Stack

- **[Preact](https://preactjs.com/)** — lightweight JSX component framework
- **[TypeScript](https://www.typescriptlang.org/)** — type safety
- **[Vite](https://vite.dev/)** — build tool (multi-page mode)
- **[Vitest](https://vitest.dev/)** — testing
- **[ESLint](https://eslint.org/)** + **[Prettier](https://prettier.io/)** — linting and formatting

## Project Structure

```
spa/
├── index.html                          # Landing page linking to all apps
├── src/
│   └── random-japanese-flashcards/     # Each app is a self-contained directory
│       ├── index.html                  # Standalone HTML entry
│       ├── main.tsx                    # Preact entry point
│       ├── app.tsx                     # Root component
│       ├── style.css                   # App styles
│       └── app.test.tsx               # Tests
├── public/                             # Static assets
├── vite.config.ts                      # Auto-discovers src/*/index.html
├── vitest.config.ts
├── eslint.config.js
├── tsconfig.json
└── justfile
```

## Development

```bash
npm install         # Install dependencies
just dev            # Start dev server
just test           # Run tests
just lint           # Check linting and formatting
just fix            # Auto-fix linting and formatting
just build          # Production build
```

## Adding a New App

1. Create a new directory under `src/`, e.g. `src/my-app/`.
2. Add an `index.html` that loads a `main.tsx` entry point.
3. The Vite config auto-discovers `src/*/index.html` — no config changes needed.
4. Add a link to the new app in the root `index.html`.
