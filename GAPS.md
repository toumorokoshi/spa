# Gaps and follow-ups

- **Random Japanese Flashcards**: Optional next steps include English gloss / flip-to-reveal meaning and deeper spaced-repetition scheduling (beyond starring). File new `bd` issues if you start work on those.
- **Advanced Paster**: The UI could be updated to feel more modern and premium (e.g. glassmorphism, animations).
- **Advanced Paster**: LaTeX parsing has been upgraded to use Temml for rendering MathML in the HTML output, but Markdown/Plaintext still use the best-effort Unicode translation. Fully aligning all outputs could be a future improvement.
- **Advanced Paster**: `\mathbf` wrappers are stripped before MathML/Unicode conversion; other font macros that Temml still renders (e.g. `\boldsymbol`, `\mathrm`) may need the same treatment if they produce unhelpful styling.
