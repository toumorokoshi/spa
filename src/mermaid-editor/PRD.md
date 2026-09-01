# Mermaid Editor PRD

## Problem Statement

Authoring and sharing Mermaid diagrams often involves switching between external documentation tools or heavy live editors. Furthermore, default diagram styling is not always suitable for every context, and pasting generated diagrams into other applications (Slack, Google Docs, Notion, GitHub issues, Keynote) requires different formats (PNG image, SVG XML, Markdown fences, or raw text).

## Proposed Solution

A lightweight, client-side single-page app that provides:

1. A collapsible text input panel on the left to write and edit Mermaid syntax.
2. A live-rendering SVG preview panel on the right with custom theme selection.
3. Convenient template presets for common diagram types.
4. Comprehensive clipboard export options (PNG image, SVG XML, Markdown code block, raw code).
5. Offline-first execution bundled via Vite.

## Requirements

### Functional Requirements

- **Live Rendering**: Re-renders the diagram in real time as the user edits markup.
- **Theme Selection**: Allows selecting among Mermaid themes (`Neutral`, `Default`, `Dark`, `Forest`, `Base`), re-rendering the diagram dynamically.
- **Collapsible Input Panel**: Provides an interactive toggle to expand/collapse the editor sidebar to maximize viewport area for large diagrams.
- **Template Presets**: Pre-populated examples including Flowcharts, Sequence Diagrams, Class Diagrams, State Diagrams, Git Graphs, and ER Diagrams.
- **Export / Copy**:
  - `Copy PNG`: Renders the SVG onto an offscreen canvas and copies the resulting PNG image to the system clipboard.
  - `Copy SVG`: Copies the SVG XML directly to the clipboard.
  - `Copy Markdown`: Copies formatted ` ```mermaid ... ``` ` blocks for markdown documents.
  - `Copy Code`: Copies plain Mermaid markup.
- **Error Diagnostics**: Captures Mermaid parse exceptions and renders helpful diagnostic alert blocks without crashing.

### Non-Functional Requirements

- **Local & Offline**: Zero network calls at runtime after initial page load.
- **Performance**: Instant live rendering with debounced updates.
- **Accessibility**: Keyboard navigable controls, standard `aria-label` attributes, and screen-reader accessible error/toast states.
