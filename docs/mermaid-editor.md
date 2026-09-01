# Mermaid Editor

Single-page app under `src/mermaid-editor/`: provides an in-browser live editor for Mermaid diagrams with a collapsible left editing panel, real-time SVG rendering, custom theme selection (`Neutral`, `Default`, `Dark`, `Forest`, `Base`), diagram presets, and multi-format clipboard exports (PNG image, SVG XML, Markdown code block, raw code).

## Usage

1. Open `/spa/src/mermaid-editor/`.
2. Type or paste Mermaid diagram syntax into the editor on the left.
3. Select presets from the dropdown (Flowchart, Sequence Diagram, Class Diagram, State Diagram, Git Graph, ER Diagram) to quickly bootstrap new charts.
4. Select a visual theme from the **Theme** dropdown (`Neutral`, `Default`, `Dark`, `Forest`, `Base`).
5. Collapse the editor pane using the **◀ / ▶** toggle to maximize diagram preview area.
6. Use the **Copy PNG**, **Copy SVG**, **Copy Markdown**, or **Copy Code** buttons to export the diagram directly to the clipboard.

See `specs/mermaid-editor.md` for architectural and behavioral details.
