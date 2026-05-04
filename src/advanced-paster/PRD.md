# Advanced Paster

(NOTE: this is human authored. agents **should not** modify this file).

## Problem Statement

Some text systems, such as Anki, support HTML. However, when pasting, the
styling ends up being perserved, which results in copying over multiple
undesired elements including:

- text color (e.g. if you use dark mode, white text + black background)
- text size.
- font sizes / font styling.

However, it's not always clear what format might be desirable for a system.
These include:

- HTML-based formatting for systems that support that (Anki).
- Markdown-based systems (e.g. my personal notes).
- Plaintext (lowest common denominator).

So it's important to **selectively strip and reformat the content** based on the **source**, and the **target**.

## Proposed Solution

The idea is to create a single page app that can take pasted content, then
provides both renders, as well as "copy to clipboard" buttons, for multiple
different formats.

### Input formats supported

- HTML
- Markdown
- Latex

### Output formats supported

- HTML
- Markdown
- Plaintext

### UI elements supported:

- text columns for each of the supported output formats
  - a button above each of the columns which copies the formatted text to the clipboard.
- an additional text column for the raw format.

### Conversion of Latex

Latex in particular should best-effort convert every block to text. This includes:

- converting all symbols to their closest unicode character.
