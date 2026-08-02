# Gaps and follow-ups

- **Random Japanese Flashcards**: Optional next steps include English gloss / flip-to-reveal meaning and deeper spaced-repetition scheduling (beyond starring). File new `bd` issues if you start work on those.
- **Advanced Paster**: The UI could be updated to feel more modern and premium (e.g. glassmorphism, animations).
- **Advanced Paster**: LaTeX parsing has been upgraded to use Temml for rendering MathML in the HTML output, but Markdown/Plaintext still use the best-effort Unicode translation. Fully aligning all outputs could be a future improvement.
- **Advanced Paster**: `\mathbf` wrappers are stripped before MathML/Unicode conversion; other font macros that Temml still renders (e.g. `\boldsymbol`, `\mathrm`) may need the same treatment if they produce unhelpful styling.
- **Advanced Paster**: `latexToText` keeps LaTeX grouping braces, so a Wikipedia formula such as `{\text{Speedup}}={\frac {a}{b}}` yields `{Speedup}={(a)/(b)}` in the Markdown and Plaintext outputs. The braces cannot simply be dropped — `\mathbb{R} \setminus {0}` relies on them for set notation — so distinguishing grouping from notation needs a real parse. The MathML output is unaffected.
- **Advanced Paster**: `lib/dom.ts` now parses pasted HTML with the browser parser. The remaining regex-based tag walking in `converter.ts` (`findMatchingSpanEnd`, `processDisplayStyleMath`) could move onto the same foundation; it is kept for now because it also carries the `findFallbackSuffix` deduplication of plain-text math that precedes a formula.
