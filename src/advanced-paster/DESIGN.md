# Advanced Paster Architecture and Design

## Overview

`advanced-paster` decouples state and IO shell components from pure, functional transformation logic:

- `index.tsx`: Preact UI shell managing clipboard event listeners, format selector, raw inputs view, text type detection banner, and transformation debug pipeline UI.
- `lib/converter.ts`: Conversion orchestrator exposing `detectFormatDetails` and recording step-by-step `debugSteps` for `convertHtml`, `convertLatex`, and `convertMarkdown`.
- `lib/dom.ts`: Locates and reads math elements in pasted HTML using the browser's HTML parser.
- `lib/latex.ts`: Functional translation layer from LaTeX math to MathML and Unicode text.

## Core Features

### 1. Text Type Detection

`detectFormatDetails` inspects `payload.htmlText` and `payload.plainText` to classify input as `html`, `latex`, or `markdown` and provides a human-readable explanation of why the format was selected.

### 2. Math Element Extraction

Pasted math arrives in many shapes: MathML `<math>` trees, editor containers
carrying `data-math`, KaTeX spans, and Wikipedia's rendered SVG `<img>` whose
`alt` holds the original LaTeX. `lib/dom.ts` locates all of these with the
browser's own HTML parser instead of hand-rolled tag matching, which gets tag
balancing, attribute quoting, and entity decoding correct for free. The same
API is available under jsdom in tests.

Rendered math is spliced back in as a string via placeholder text nodes rather
than as DOM nodes, because Temml's MathML output is sensitive to serialization
(namespaces, `style` attributes, entity forms). See
`specs/advanced-paster.md` for the recognition and extraction rules.

### 3. Raw Inputs Row

Exposes raw inputs (`plainText` and `htmlText`) side-by-side. When HTML is pasted, `htmlText` is presented as raw HTML source code, enabling users to inspect the exact structure received from the system clipboard.

### 4. Debug Pipeline Transformation Stages

Every conversion pipeline function (`convertHtml`, `convertLatex`, `convertMarkdown`) records intermediate outputs at each transformation step. The UI renders these stages sequentially in expandable accordion blocks.
