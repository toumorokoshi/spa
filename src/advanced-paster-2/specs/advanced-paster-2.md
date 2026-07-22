# Advanced Paster 2 Technical Specification

This specification documents the pipeline, text type detection, raw inputs row, and transformation debug stages used in `advanced-paster-2`.

---

## 1. Detection Mechanism (`detectFormatDetails`)

1. **HTML Detection**:
   - If `payload.htmlText` is non-empty, format resolves to `'html'` with explanation `"Detected HTML content in clipboard payload (payload.htmlText)."`.
   - If `payload.plainText` contains HTML tags (`/<[a-z/][\s\S]*>/i`), format resolves to `'html'`.

2. **LaTeX Detection**:
   - Scans `payload.plainText` for math delimiters (`$$`, `\[`, `\]`, `\(`, `\)`).
   - Scans `payload.plainText` for LaTeX macros and structural commands.
   - If matched, format resolves to `'latex'`.

3. **Markdown Fallback**:
   - If neither HTML nor LaTeX is detected, format resolves to `'markdown'`.

---

## 2. Transformation Pipelines and Debug Stages

Each conversion pipeline records `debugSteps: Array<{ stepName: string; output: string }>`:

### HTML Pipeline (`convertHtml`)

1. Raw Input
2. Normalize Input
3. Pre-process Display Style MathML
4. Clean Html Math Containers to MathML
5. Convert Embedded Latex to MathML
6. Pre-process Display Style Unicode
7. Clean Html Math Containers to Unicode
8. Convert Embedded Latex to Unicode
9. Generate Markdown (Turndown)
10. Math Blocks Isolated
11. Style/Font/Span/Attrs Sanitized
12. Math Blocks Restored (Final HTML)
13. Generate Plaintext (Final)

### LaTeX Pipeline (`convertLatex`)

1. Raw LaTeX Input
2. Normalize Input
3. Text Input Prepared
4. Process Display Style Math to Unicode
5. Generate Plaintext / Unicode
6. Generate Markdown
7. HTML Input Prepared
8. Process Display Style Math to MathML
9. Render Final HTML with MathML

### Markdown Pipeline (`convertMarkdown`)

1. Raw Markdown Input
2. Normalize Input
3. Process Display Style Math to Unicode
4. Convert Embedded LaTeX to Unicode
5. Final Markdown Output
6. Process Display Style Math to MathML
7. Convert Embedded LaTeX to MathML
8. Parse Markdown to HTML
9. Generate Plaintext Output

---

## 3. UI Shell Architecture

- **Text Type Banner**: Renders detected format badge and rationale.
- **Raw Inputs Row**: Visual row displaying raw `plainText` and `htmlText` (as raw HTML source).
- **Debug Pipeline Stages**: Sequential accordion cards displaying step-by-step intermediate transformation outputs.
- **Output Grid**: Rendered HTML, HTML source, Markdown, Plaintext columns.
