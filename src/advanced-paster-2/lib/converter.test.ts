import { describe, it, expect } from 'vitest';
import {
  convert,
  detectFormatDetails,
  detectFormat,
  convertHtml,
  convertLatex,
  convertMarkdown
} from './converter';

describe('detectFormatDetails', () => {
  it('detects html when htmlText is present in payload', () => {
    const res = detectFormatDetails({
      plainText: 'Hello',
      htmlText: '<h1>Hello</h1>'
    });
    expect(res.format).toBe('html');
    expect(res.explanation).toContain('payload.htmlText');
  });

  it('detects html when plainText contains html tags', () => {
    const res = detectFormatDetails({
      plainText: '<p>Some text</p>'
    });
    expect(res.format).toBe('html');
    expect(res.explanation).toContain('HTML tags');
  });

  it('detects latex when plainText contains latex math delimiters', () => {
    const res = detectFormatDetails({
      plainText: 'Solving $$ x^2 + y^2 = 1 $$'
    });
    expect(res.format).toBe('latex');
    expect(res.explanation).toContain('LaTeX math delimiters');
  });

  it('detects latex when plainText contains latex commands', () => {
    const res = detectFormatDetails({
      plainText: 'Expression: \\frac{1}{2}'
    });
    expect(res.format).toBe('latex');
    expect(res.explanation).toContain('LaTeX math macros/commands');
  });

  it('defaults to markdown when no HTML or LaTeX is detected', () => {
    const res = detectFormatDetails({
      plainText: '# Just plain markdown header'
    });
    expect(res.format).toBe('markdown');
    expect(res.explanation).toContain('Defaulted to Markdown');
  });
});

describe('detectFormat', () => {
  it('returns exact input format string', () => {
    expect(detectFormat({ plainText: '', htmlText: '<b>test</b>' })).toBe(
      'html'
    );
  });
});

describe('convertHtml', () => {
  it('generates debug steps for HTML pipeline', () => {
    const res = convertHtml('<h1>Title</h1><p>Body</p>');
    expect(res.debugSteps).toBeDefined();
    expect(res.debugSteps.length).toBeGreaterThan(0);
    expect(res.debugSteps[0].stepName).toBe('1. Raw Input');
    expect(res.html).toContain('<h1>Title</h1>');
  });
});

describe('convertLatex', () => {
  it('generates debug steps for LaTeX pipeline', () => {
    const res = convertLatex('\\alpha + \\beta');
    expect(res.debugSteps).toBeDefined();
    expect(res.debugSteps.length).toBeGreaterThan(0);
    expect(res.plaintext).toContain('α + β');
    expect(res.html).toContain('<math>');
  });
});

describe('convertMarkdown', () => {
  it('generates debug steps for Markdown pipeline', () => {
    const res = convertMarkdown('# Header\nSome **bold** text.');
    expect(res.debugSteps).toBeDefined();
    expect(res.debugSteps.length).toBeGreaterThan(0);
    expect(res.html).toContain('<h1>Header</h1>');
  });
});

describe('convert', () => {
  it('auto-detects HTML and returns detection metadata and debug steps', () => {
    const res = convert(
      { plainText: 'Test', htmlText: '<span>Test</span>' },
      'auto'
    );
    expect(res.detectedFormat).toBe('html');
    expect(res.detectionExplanation).toBeDefined();
    expect(res.debugSteps.length).toBeGreaterThan(0);
  });
});
