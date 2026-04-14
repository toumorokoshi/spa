# spa

YFT's simple single page apps, primarily for personal use.

This repository contains a series of directories, each of which contains a
single-page-application that serves a particular purpose.

Although each subdirectory under `src/` is its own application, the whole
project is compiled as a single package and served via GitHub Pages.

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
