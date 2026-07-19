# Advanced Paster Specification

This specification documents the step-by-step pipeline `advanced-paster` uses to detect, process, and convert pasted input (HTML, Markdown, or LaTeX) into Plaintext, Markdown, and HTML outputs.

---

## 1. Entry Point and State Orchestration

The application UI and side-effects are managed in [index.tsx](../index.tsx):

- Global paste listener (`window.addEventListener('paste', ...)`) intercepts paste events (unless focused inside the manual input textarea, which has its own paste handler).
- It extracts `text/plain` and `text/html` from the clipboard event and stores them in the `payload` state as a `ClipboardDataPayload`.
- The `App` component runs a React effect that calls the core [convert](../lib/converter.ts#L589) function whenever the payload or format override dropdown state changes.

---

## 2. Format Detection (`detectFormat`)

When the user selects the **Auto-detect** input format, [detectFormat](../lib/converter.ts#L67) resolves the input format:

1. **HTML Format**: If `payload.htmlText` is present (not empty or undefined), it immediately resolves to `'html'`.
2. **LaTeX Format**: If no HTML is present, it scans `payload.plainText` for math indicators:
   - Checks for math delimiters: `$$`, `\[`, `\]`, `\(`, `\)`.
   - Checks for LaTeX commands: Uses a dynamic indicator list compiled from hardcoded structural macros (`frac`, `textbf`, `mathbf`, etc.) and all command names extracted from keys in the `LATEX_TO_UNICODE` map. It builds a regex: `\\(macro1|macro2|...)(?![a-zA-Z])`.
   - If either delimiters or commands are detected, it resolves to `'latex'`.
3. **Markdown Format**: If neither of the above conditions matches, it falls back to `'markdown'`.

---

## 3. Conversion Pipelines

Depending on the resolved format, the input is processed through one of three pipeline functions in [converter.ts](../lib/converter.ts):

### A. HTML Pipeline (`convertHtml`)

Used when the input is HTML. It processes the payload (`payload.htmlText` or fallback `payload.plainText`) as follows:

1. **Normalization**: Replaces non-breaking space characters (`\u00a0`) with standard spaces and strips all zero-width, invisible formatting, and directional characters (e.g., ZWSP, ZWNJ, ZWJ, LRM, RLM, BOM, WJ, SHY).
2. **Pre-processing**: If the input does not contain HTML tags (checked via `isHtml`), it passes the text through `processDisplayStyleToMathML` and `processDisplayStyleToUnicode` to handle any raw block-style LaTeX before parsing.
3. **Generating HTML Output**:
   - Invokes [cleanHtmlMathToMathML](../lib/converter.ts#L473), which finds MathML elements (in containers with classes like `katex` or `mwe-math-element`, or raw `<math>` tags), extracts raw LaTeX from their `<annotation>` tags, alttext, or image alt attributes, and re-renders them cleanly with Temml.
   - Invokes [convertEmbeddedLatexToMathML](../lib/latex.ts#L552) to convert any remaining inline LaTeX syntax (e.g. `$ ... $`) inside the HTML body to MathML blocks.
   - Extracts all `<math>` blocks temporarily and replaces them with placeholders.
   - Sanitizes the rest of the HTML structure: removes `<style>` blocks, `<meta>` tags, font tags (`<font>`), span tags (`<span>`), and presentation attributes (`style`, `class`, `id`, `color`, `bgcolor`, `align`, `valign`, `width`, `height`).
   - Restores the `<math>` blocks from placeholders.
4. **Generating Plaintext Output**:
   - Invokes [cleanHtmlMathToUnicode](../lib/converter.ts#L449), which behaves similarly to the MathML cleaner but translates the extracted LaTeX to Unicode characters.
   - Invokes [convertEmbeddedLatexToUnicode](../lib/latex.ts#L498) to resolve remaining inline LaTeX equations to Unicode.
   - Strips all HTML tags from the final string using a global regex `/<[^>]*>?/gm` and trims whitespace.
5. **Generating Markdown Output**:
   - Converts the cleaned Unicode HTML string (obtained before stripping tags for plaintext) into Markdown format using `turndownService.turndown`.

---

### B. LaTeX Pipeline (`convertLatex`)

Used when the input is LaTeX. It processes `payload.plainText`:

1. **Normalization**: Replaces non-breaking spaces with standard spaces and strips zero-width spaces (`\u200b`).
2. **Generating Plaintext and Markdown Outputs**:
   - Resolves display-style math blocks to Unicode using `processDisplayStyleToUnicode`.
   - Converts the entire LaTeX content into Unicode text using [latexToText](../lib/latex.ts#L423).
   - Markdown and Plaintext outputs both share this converted Unicode string.
3. **Generating HTML Output**:
   - Resolves display-style math blocks to MathML using `processDisplayStyleToMathML`.
   - If the text has LaTeX math delimiters or existing `<math>` tags, it processes inline formulas using [convertEmbeddedLatexToMathML](../lib/latex.ts#L552).
   - Otherwise, it converts the entire text block to MathML using [latexToMathML](../lib/latex.ts#L476).
   - Wraps the final MathML output inside a `<p>` tag.

---

### C. Markdown Pipeline (`convertMarkdown`)

Used when the input is Markdown. It processes `payload.plainText`:

1. **Normalization**: Replaces non-breaking spaces with standard spaces and strips zero-width spaces (`\u200b`).
2. **Generating Markdown and Plaintext Outputs**:
   - Resolves display-style math blocks to Unicode (`processDisplayStyleToUnicode`).
   - Converts any embedded inline math blocks to Unicode using [convertEmbeddedLatexToUnicode](../lib/latex.ts#L498).
   - The resulting string is the final Markdown.
   - Plaintext is generated by parsing this processed Markdown into HTML via `marked.parse` and then stripping the HTML tags.
3. **Generating HTML Output**:
   - Resolves display-style math blocks to MathML (`processDisplayStyleToMathML`).
   - Converts embedded inline math blocks to MathML using [convertEmbeddedLatexToMathML](../lib/latex.ts#L552).
   - Parses the resulting Markdown (now containing embedded MathML tags) to HTML using `marked.parse`.

---

## 4. LaTeX Conversion Functions

The core mathematical conversion logic resides in [latex.ts](../lib/latex.ts):

### Shared LaTeX preprocessing

Before Unicode or MathML conversion, LaTeX segments are preprocessed:

1. `normalizeInput` replaces non-breaking spaces and strips zero-width / invisible formatting characters.
2. `stripMathbfWrappers` unwraps `\mathbf{...}` and `\mathbf {...}` (brace-aware, recursive). Bold math from sources like Wikipedia is not useful in outputs; the inner content is kept.

### `latexToText`

Performs a best-effort, pure functional translation of a LaTeX string to plain Unicode text:

1. Runs shared LaTeX preprocessing (`normalizeInput`, then `stripMathbfWrappers`), then normalizes remaining macro spacing (such as changing `\mathrm {x}` to `\mathrm{x}`).
2. Replaces LaTeX symbols defined in the `LATEX_TO_UNICODE` map using dynamically generated regexes like `\\symbol(?![a-zA-Z])`.
3. Strips remaining formatting macros (e.g. `\textbf`, `\textit`, `\mathrm`, `\mathsf`) using regex, extracting only their inner text contents.
4. Converts complex mathematical structures:
   - `\frac{a}{b}` -> `(a)/(b)`
   - `\vec{x}` -> `x`
   - `\binom{n}{k}` -> `(n choose k)`
   - `\pmod{p}` -> `(mod p)`
   - `\xrightarrow{abc}` -> `──(abc)──→`
5. Translates subscripts (`_char` or `_{chars}`) and superscripts (`^char` or `^{chars}`) using the lookup mappings `SUBSCRIPTS` and `SUPERSCRIPTS`.

### `latexToMathML`

Translates a LaTeX segment to MathML using `temml.renderToString` after shared LaTeX preprocessing (`normalizeInput`, then `stripMathbfWrappers`), with the options:

- `displayMode`: Toggles block vs inline math.
- `annotate: true`: Generates the `<annotation encoding="application/x-tex">` block containing the preprocessed LaTeX string.
- `throwOnError: false`: Catches syntax errors gracefully, coloring invalid commands red (`#b22222`) inside `<mtext>` blocks instead of crashing.

### `convertEmbeddedLatexToUnicode` and `convertEmbeddedLatexToMathML`

Parses embedded LaTeX blocks sequentially:

1. `$$ ... $$` (display math)
2. `\[ ... \]` (display math)
3. `\( ... \)` (inline math)
4. `$ ... $` (inline math)

For inline dollar-sign math blocks, strict heuristics are applied to distinguish LaTeX equations from plain currency values:

- If the content contains a backslash (`\`), it is treated as LaTeX.
- If the content is short ($\le 4$ characters), it is treated as LaTeX (e.g., `$x$`, `$a$`).
- If the content contains common English words (e.g. `and`, `or`, `costs`, `price`), it is treated as currency/plain text and ignored.
- If the content contains mathematical operators (`=`, `<`, `>`, `+`, `-`, `*`, `/`, `^`, `_`), it is treated as LaTeX.
- Otherwise, the delimiters are ignored.

---

## 5. Duplicate Math Detection and Deduplication

Websites (like Wikipedia) frequently output a plaintext representation of a formula right before its MathML structure (e.g., `U {\displaystyle U}`). To prevent duplicate text in outputs, [processBlockReplacement](../lib/converter.ts#L229) cleans this up:

1. When a display-style math block is processed, `findFallbackSuffix` scans the preceding text (`before`) for a suffix matching the converted math string.
2. It compares the strings by normalising them (`normalizeForComparison`):
   - Maps superscript/subscript characters back to standard alphanumeric characters.
   - Maps blackboard-bold and calligraphic Unicode symbols back to standard letters using `unicodeToLetterMap`.
   - Strips backslashes and non-alphanumeric characters and converts to lowercase.
3. If the common prefix length between the normalized fallback candidate and the expected converted string is greater than a ratio of the fallback length (`DEDUPLICATE_PREFIX_RATIO = 0.5`), and their lengths do not differ by more than a factor of `2.0`, the candidate is marked as a duplicate.
4. The duplicate plaintext fallback is sliced out from the preceding text before rendering the newly converted block.

---

## 6. Debug Clipboard Payload

To help debug issues where invisible Unicode characters (like `\u200b`, `\u200c`, `\u200d`) affect parsing, the application UI includes a **Debug Clipboard Payload** section:

- It uses the helper function `escapeInvisibleChars` to replace raw non-printing characters in the clipboard payload with visible text labels:
  - `\u200b` -> `[ZWSP]` (Zero-Width Space)
  - `\u200c` -> `[ZWNJ]` (Zero-Width Non-Joiner)
  - `\u200d` -> `[ZWJ]` (Zero-Width Joiner)
  - `\u200e` -> `[LRM]` (Left-to-Right Mark)
  - `\u200f` -> `[RLM]` (Right-to-Left Mark)
  - `\ufeff` -> `[BOM]` (Byte Order Mark)
  - `\u2060` -> `[WJ]` (Word Joiner)
  - `\u00ad` -> `[SHY]` (Soft Hyphen)
  - `\u00a0` -> `[NBSP]` (Non-Breaking Space)
- Displays raw un-normalized clipboard data in both **unescaped** and **escaped** formats for both `plainText` and `htmlText` (if present) so that users can verify the exact structure of what was captured on paste.
- Includes a scrollable **Character-by-Character Inspector** table:
  - Lists every single character in the clipboard input by index.
  - Shows its glyph or text marker representation.
  - Shows its Unicode hex code point (e.g. `U+200C`).
  - Provides a short description (e.g., "Zero-Width Non-Joiner (ZWNJ)", "Newline (LF)").
  - Highlights hidden formatting characters using a light red background and text color to make them immediately stand out.
  - Supports toggling analysis between `plainText` and `htmlText` if both are available.
