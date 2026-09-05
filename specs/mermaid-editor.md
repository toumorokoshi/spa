# Mermaid Editor

## Behavior

- **Initial State**: On load, displays a default flowchart diagram with YAML front matter configuration (`rankSpacing: 1` and `nodeSpacing: 1`) in the editor and renders the corresponding SVG diagram using the `Neutral` theme in the preview pane.
- **Theme Selection**: Supports dynamically choosing between `Neutral`, `Default`, `Dark`, `Forest`, and `Base` themes. Changing the theme instantly re-renders the active diagram. Dark theme applies a high-contrast container background.
- **Collapsible Sidebar**: An interactive collapse toggle allows minimizing the left editor pane to 48px width, granting full viewport real-estate to the preview panel.
- **Presets**: Selecting a preset replaces the current editor text with the selected template code.
- **Auto-wrap Text**: An "Auto-wrap text" button directly below the preset dropdown traverses the rendered SVG nodes, measures label text dimensions against the configured or default wrapping width (`wrappingWidth`), and formats long node text in the editor source with quotes and `\n` line breaks. This forces Mermaid to compute multi-line node bounds prior to layout calculation, reflowing the diagram layout and preventing text clipping.
- **Live Rendering**: Edits to the text field automatically trigger re-rendering of the SVG output via Mermaid.
- **Error Handling**: When invalid Mermaid syntax is provided, the preview displays a formatted syntax error banner while preserving user input.
- **Export Options**:
  - **Copy PNG**: Converts SVG to 2x PNG canvas and copies an `image/png` blob to clipboard.
  - **Copy SVG**: Copies `image/svg+xml` and `text/plain` SVG markup to clipboard.
  - **Copy Markdown**: Copies diagram wrapped in ` ```mermaid ` code fences.
  - **Copy Code**: Copies raw text input to clipboard.
- **Feedback**: Displays a transient badge indicator upon copying or running diagram modifications (such as auto-wrap).

## Implementation Details

- Built using **Preact** + **TypeScript** + **Mermaid**.
- All dependencies run entirely offline/client-side and are bundled into the static site via Vite.
- Pure functions in `src/mermaid-editor/lib/` isolate rendering, themes, and clipboard logic.
