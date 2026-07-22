# Advanced Paster 2

`advanced-paster-2` is a single-page application for converting pasted clipboard content into Plaintext, Markdown, and HTML, with an emphasis on user curation, raw input visibility, and stage-by-stage pipeline transformation debugging.

## Key Features

1. **Text Type Detection**: Automatically detects input type (`html`, `latex`, `markdown`) and displays the rationale behind detection.
2. **Raw Clipboard Inputs Row**: Presents raw `plainText` and `htmlText` (including raw HTML source code when HTML content is pasted) alongside character-by-character inspection tools.
3. **Curated Transformation Debug Pipeline**: Exposes a step-by-step debug view showing intermediate text transformations across all pipeline stages.
4. **Multi-Format Output Columns**: Outputs Rendered HTML, HTML Source, Markdown, and Plaintext.
