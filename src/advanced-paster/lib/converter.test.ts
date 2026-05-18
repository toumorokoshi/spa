/* eslint-disable max-lines-per-function */
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

  it('formats the user specific string', () => {
    expect(latexToText('$a, b \\in G$, $a \\circ b \\in G$.')).toBe(
      'a, b ∈ G, a ∘ b ∈ G.'
    );
  });
});

describe('converter', () => {
  it('handles HTML input automatically', () => {
    const payload = {
      plainText: 'Hello World',
      htmlText: '<h1>Hello</h1><p>World</p>'
    };

    const result = convert(payload, 'auto');
    expect(result.html).toBe('<h1>Hello</h1><p>World</p>');
    expect(result.markdown).toContain('# Hello');
    expect(result.markdown).toContain('World');
    // HTML tags stripped:
    expect(result.plaintext).toBe('HelloWorld');
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

  it('handles the user specific string automatically', () => {
    const payload = {
      plainText: '$a, b \\in G$, $a \\circ b \\in G$.'
    };

    const result = convert(payload, 'auto');
    expect(result.plaintext).toBe('a, b ∈ G, a ∘ b ∈ G.');
    expect(result.markdown).toBe('a, b ∈ G, a ∘ b ∈ G.');
    expect(result.html).toBe('<p>a, b ∈ G, a ∘ b ∈ G.</p>');
  });

  it('converts embedded LaTeX inside Markdown', () => {
    const payload = {
      plainText: 'Let $a, b \\in G$ be elements, then $a \\circ b \\in G$.'
    };

    const result = convert(payload, 'markdown');
    expect(result.plaintext).toBe('Let a, b ∈ G be elements, then a ∘ b ∈ G.');
    expect(result.markdown).toBe('Let a, b ∈ G be elements, then a ∘ b ∈ G.');
    expect(result.html).toBe(
      '<p>Let a, b ∈ G be elements, then a ∘ b ∈ G.</p>'
    );
  });

  it('protects currency from incorrect LaTeX conversion in Markdown', () => {
    const payload = {
      plainText: 'This item costs $10 and that costs $20.'
    };

    const result = convert(payload, 'markdown');
    expect(result.plaintext).toBe('This item costs $10 and that costs $20.');
    expect(result.markdown).toBe('This item costs $10 and that costs $20.');
    expect(result.html).toBe('<p>This item costs $10 and that costs $20.</p>');
  });

  it('does not strip HTML tables', () => {
    const payload = {
      plainText: 'cell1 cell2',
      htmlText:
        '<table style="width: 100%;"><tbody><tr><td style="color: red;">cell1</td><td>cell2</td></tr></tbody></table>'
    };

    const result = convert(payload, 'auto');
    expect(result.html).toContain('<table');
    expect(result.html).toContain('<tbody>');
    expect(result.html).toContain('<tr');
    expect(result.html).toContain('<td');
    expect(result.html).toContain('cell1');
    expect(result.html).toContain('cell2');

    // Markdown may retain the table as raw HTML if there are no headers
    expect(result.markdown).toContain('<table');
  });
});
