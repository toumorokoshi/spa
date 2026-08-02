# Advanced Paster Technical Specification

This specification documents the pipeline, text type detection, math element extraction, raw inputs row, and transformation debug stages used in `advanced-paster`.

---

## 0. Math Element Extraction (`lib/dom.ts`)

Math inside pasted HTML is located with the browser's own HTML parser rather
than by regular expression. `transformMathElements(html, render)` parses the
input into a detached `<template>`, finds the math elements, and replaces each
with the output of `render`.

### Recognised elements

| Shape                                                         | Source of LaTeX                                           |
| ------------------------------------------------------------- | --------------------------------------------------------- |
| `<math>` / `<mwe-math-element>`                               | `<annotation encoding="application/x-tex">`, or `alttext` |
| `[data-math]`, `[data-latex]`, `[data-tex]`                   | the attribute value                                       |
| `.math-block`, `.math-inline`, `.katex`, `.mwe-math-element*` | as above, else `$$...$$` in the text                      |
| `<img>` judged to be math                                     | the `alt` attribute                                       |

An `<img>` counts as math when its `src` is a MediaWiki math render URL, its
class is a `mwe-math-fallback-image*`, or its `alt` reads as LaTeX
(`isLatexLike` in `lib/latex.ts`). This covers copying a single formula out of
a Wikipedia article, which yields the rendered SVG `<img>` on its own with no
surrounding `mwe-math-element` wrapper. Images that are not math are left as
images.

### Extraction rules

- **Outermost wins.** A Wikipedia formula nests a `<math>` tree and a fallback
  `<img>` inside one `mwe-math-element` span; all three match, but they
  describe a single expression, so only the span is converted.
- **Entities are decoded by the parser.** Attribute values and text content
  arrive already decoded, so `&amp;` in a matrix body needs no manual pass.
- **Temml output is skipped**, identified by its `tml-display` / `tml-inline`
  class or `display:block math` style, so a stage never re-converts its own
  output.
- **Display mode** is inferred from `\displaystyle`, a `<div>` container, a
  `*-block` class, a `display="block"` attribute, or `$$` / `\[` delimiters.
- **Rendered math is spliced in as a string.** Each match becomes a placeholder
  text node, the tree is serialized once, then placeholders are substituted
  textually. Temml's MathML is serialization-sensitive (namespaces, `style`
  attributes, entity forms), so the parser is used only to find and read math,
  never to re-emit it.
- **Input with no math is returned byte-for-byte**, so documents that never
  needed parsing are not reshaped by a serialization round-trip.

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
3. Extract Html Math Elements to MathML
4. Pre-process Display Style MathML
5. Convert Embedded Latex to MathML
6. Extract Html Math Elements to Unicode
7. Pre-process Display Style Unicode
8. Convert Embedded Latex to Unicode
9. Generate Markdown (Turndown)
10. Math Blocks Isolated
11. Style/Font/Span/Attrs Sanitized
12. Math Blocks Restored (Final HTML)
13. Generate Plaintext (Final)

Structural extraction (steps 3 and 6) runs **before** the text-level display
style passes (steps 4 and 7). The text passes match `{\displaystyle ...}` and
math delimiters anywhere in the string, including inside attribute values, so
running them first would corrupt the `alt` / `alttext` / `data-math` attributes
that the math has to be read from.

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
