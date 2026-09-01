# Mermaid Editor

`mermaid-editor` is a single-page application for drafting Mermaid diagrams with live client-side SVG rendering, a collapsible editing sidebar, theme selection, diagram templates, and multiple clipboard copy formats (PNG image, SVG XML, Markdown code block, and raw Mermaid source).

## Key Features

1. **Live Mermaid Rendering**: Real-time client-side parsing and SVG diagram generation powered by Mermaid.
2. **Theme Selection**: Switch between built-in Mermaid themes (`Neutral`, `Default`, `Dark`, `Forest`, `Base`), with an adaptive dark-mode preview viewport.
3. **Collapsible Sidebar**: Compact toggle to collapse the editor into a minimalist side rail for full diagram preview space.
4. **Preset Templates**: Quick-start starters for Flowchart, Sequence Diagram, Class Diagram, State Diagram, Git Graph, and ER Diagram.
5. **Rich Copy Options**:
   - **Copy PNG**: Converts rendered SVG to a 2x retina PNG and copies it as an image to the clipboard.
   - **Copy SVG**: Copies raw SVG XML / image blob.
   - **Copy Markdown**: Copies diagram wrapped in a ` ```mermaid ` block ready for Markdown documents.
   - **Copy Code**: Copies raw diagram markup.
6. **Real-time Syntax Diagnostics**: Displays clear error banners if Mermaid markup has parse or syntax issues.
7. **Local & Offline**: Operates fully client-side without network requests.
