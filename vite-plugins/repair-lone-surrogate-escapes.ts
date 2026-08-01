import type { Plugin } from 'vite';

/**
 * Works around a rolldown (Vite 8) codegen bug: when a string literal holding a
 * lone surrogate escape is folded into a template literal, the escape's
 * backslash is emitted as U+FFFD, so `\ud800` becomes `<U+FFFD>d800`.
 *
 * Temml relies on this idiom to build its lexer's token regex
 * (`[\uD800-\uDBFF][\uDC00-\uDFFF]`, for matching surrogate pairs). Corrupted,
 * that character class becomes a `0`-to-U+FFFD range that matches a backslash,
 * so every LaTeX command fails to lex and all math renders as an error.
 *
 * Only `vite build` is affected -- the dev server serves temml untransformed
 * thanks to `optimizeDeps.exclude`. Drop this once rolldown is fixed.
 */
export const repairLoneSurrogateEscapes = (): Plugin => ({
  name: 'repair-lone-surrogate-escapes',
  renderChunk(code) {
    const repaired = code.replace(/�([0-9a-fA-F]{4})/g, '\\u$1');
    return repaired === code ? null : { code: repaired, map: null };
  }
});
