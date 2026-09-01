# Mermaid Editor

## Behavior

- **Initial State**: On load, displays a default flowchart diagram in the editor and renders the corresponding SVG diagram in the preview pane.
- **Collapsible Sidebar**: An interactive collapse toggle allows minimizing the left editor pane to 48px width, granting full viewport real-estate to the preview panel.
- **Presets**: Selecting a preset replaces the current editor text with the selected template code.
- **Live Rendering**: Edits to the text field automatically trigger re-rendering of the SVG output via Mermaid.
- **Error Handling**: When invalid Mermaid syntax is provided, the preview displays a formatted syntax error banner while preserving user input.
- **Export Options**:
  - **Copy PNG**: Converts SVG to 2x PNG canvas and copies an `image/png` blob to clipboard.
  - **Copy SVG**: Copies `image/svg+xml` and `text/plain` SVG markup to clipboard.
  - **Copy Markdown**: Copies diagram wrapped in ` ```mermaid ` code fences.
  - **Copy Code**: Copies raw text input to clipboard.
- **Feedback**: Displays a transient badge indicator upon copying.

## Implementation Details

- Built using **Preact** + **TypeScript** + **Mermaid**.
- All dependencies run entirely offline/client-side and are bundled into the static site via Vite.
- Pure functions in `src/mermaid-editor/lib/` isolate rendering and clipboard logic.
