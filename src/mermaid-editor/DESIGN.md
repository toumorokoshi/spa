# Mermaid Editor Architecture and Design

## Overview

`mermaid-editor` follows the repository's functional programming tenants by cleanly decoupling stateful UI components from pure utility modules:

- `src/mermaid-editor/main.tsx`: DOM entry point mounting the Preact root component.
- `src/mermaid-editor/app.tsx`: Central state shell orchestrating diagram input, layout collapse state, asynchronous rendering lifecycle, and copy feedback.
- `src/mermaid-editor/components/editor.tsx`: Collapsible left sidebar containing code editor textarea, preset template picker, and clear action.
- `src/mermaid-editor/components/diagram-preview.tsx`: Right display pane housing live rendered SVG diagram, error diagnostics banner, and multi-format copy action buttons.
- `src/mermaid-editor/lib/renderer.ts`: Pure functional rendering layer encapsulating Mermaid initialization, ID generation, DOM cleanup, and structured error handling.
- `src/mermaid-editor/lib/clipboard.ts`: Cross-platform clipboard export utilities for PNG image blobs, SVG XML, Markdown codeblocks, and plain text.
- `src/mermaid-editor/lib/presets.ts`: Readonly presets collection for instant diagram templates.

## Key Design Considerations

### 1. Separation of Concerns & Functional Architecture

All core diagram rendering logic (`renderMermaid`) and clipboard serialization (`copySvg`, `copyPng`, `copyMarkdown`) are isolated in `lib/` as pure, testable functions that do not depend on component lifecycles.

### 2. Collapsible Split View Layout

The editor pane is collapsible into a thin action rail. When collapsed, the preview pane expands to take 100% of the viewport, enabling seamless viewing of large, complex diagrams.

### 3. Comprehensive Clipboard Export Pipeline

To support diverse workflows, the editor supports 4 export formats:

- **PNG Image**: Draws SVG to an offscreen canvas at 2x scale and writes a native PNG Blob to the clipboard.
- **SVG XML**: Copies vector SVG XML markup.
- **Markdown**: Formats the diagram as a fenced ` ```mermaid ` codeblock for GitHub/GitLab/Notion.
- **Plain Code**: Raw diagram text for sharing or saving.

### 4. Non-blocking Diagnostic Error Boundaries

Instead of failing ungracefully on syntax typos during active typing, `renderMermaid` intercepts parse failures and passes structured diagnostics to `DiagramPreview` to render clean, readable syntax error alerts.
