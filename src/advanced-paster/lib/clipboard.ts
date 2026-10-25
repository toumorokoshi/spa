/**
 * Wraps rendered HTML in a minimal document with an explicit white background
 * and black text. Without explicit colors, some macOS paste targets show the
 * copied fragment with a gray background.
 */
export const toClipboardHtml = (html: string): string =>
  '<html><body style="background-color:#ffffff;color:#000000">' +
  `<div style="background-color:#ffffff;color:#000000">${html}</div>` +
  '</body></html>';
