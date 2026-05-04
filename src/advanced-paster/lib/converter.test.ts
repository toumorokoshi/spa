import { describe, it, expect } from 'vitest';
import { convert } from './converter';
import { latexToText } from './latex';

describe('latexToText', () => {
  it('converts common symbols', () => {
    expect(latexToText('\\alpha')).toBe('α');
    expect(latexToText('\\beta \\times \\gamma')).toBe('β × γ');
  });

  it('strips formatting macros', () => {
    expect(latexToText('\\textbf{hello}')).toBe('hello');
    expect(latexToText('\\textit{world}')).toBe('world');
  });

  it('converts fractions', () => {
    expect(latexToText('\\frac{1}{2}')).toBe('(1)/(2)');
  });

  it('removes math boundaries', () => {
    expect(latexToText('$$ \\alpha $$')).toBe('α');
  });
});

describe('converter', () => {
  it('handles HTML input automatically', () => {
    const payload = {
      plainText: 'Hello World',
      htmlText: '<h1>Hello</h1><p>World</p>'
    };

    const result = convert(payload, 'auto');
    expect(result.html).toBe('<h1>Hello</h1>\n<p>World</p>');
    expect(result.markdown).toContain('# Hello');
    expect(result.markdown).toContain('World');
    // HTML tags stripped:
    expect(result.plaintext).toBe('Hello\nWorld');
  });

  it('handles Markdown input automatically', () => {
    const payload = {
      plainText: '# Hello\n\nWorld'
    };

    const result = convert(payload, 'auto');
    expect(result.markdown).toBe('# Hello\n\nWorld');
    expect(result.html).toBe('<h1>Hello</h1>\n<p>World</p>');
    expect(result.plaintext).toBe('Hello\nWorld');
  });

  it('handles LaTeX input automatically', () => {
    const payload = {
      plainText: '$$ \\alpha \\times \\beta $$'
    };

    const result = convert(payload, 'auto');
    expect(result.plaintext).toBe('α × β');
    expect(result.html).toBe('<p>α × β</p>');
    expect(result.markdown).toBe('α × β');
  });

  it('respects manual format override', () => {
    // Looks like LaTeX but forced to markdown
    const payload = {
      plainText: '\\alpha'
    };

    const result = convert(payload, 'markdown');
    expect(result.html).toBe('<p>\\alpha</p>');
  });
});
