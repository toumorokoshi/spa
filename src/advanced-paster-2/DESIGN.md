# Advanced Paster 2 Architecture and Design

## Overview

`advanced-paster-2` decouples state and IO shell components from pure, functional transformation logic:

- `index.tsx`: Preact UI shell managing clipboard event listeners, format selector, raw inputs view, text type detection banner, and transformation debug pipeline UI.
- `lib/converter.ts`: Conversion orchestrator exposing `detectFormatDetails` and recording step-by-step `debugSteps` for `convertHtml`, `convertLatex`, and `convertMarkdown`.
- `lib/latex.ts`: Functional translation layer from LaTeX math to MathML and Unicode text.

## Core Features

### 1. Text Type Detection

`detectFormatDetails` inspects `payload.htmlText` and `payload.plainText` to classify input as `html`, `latex`, or `markdown` and provides a human-readable explanation of why the format was selected.

### 2. Raw Inputs Row

Exposes raw inputs (`plainText` and `htmlText`) side-by-side. When HTML is pasted, `htmlText` is presented as raw HTML source code, enabling users to inspect the exact structure received from the system clipboard.

### 3. Debug Pipeline Transformation Stages

Every conversion pipeline function (`convertHtml`, `convertLatex`, `convertMarkdown`) records intermediate outputs at each transformation step. The UI renders these stages sequentially in expandable accordion blocks.
