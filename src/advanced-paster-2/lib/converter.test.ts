import { describe, it, expect } from 'vitest';
import {
  convert,
  detectFormatDetails,
  detectFormat,
  convertHtml,
  cleanHtmlMathToMathML,
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
  it('handles full HTML document string provided by user directly in cleanHtmlMathToMathML', () => {
    const inputHtml =
      '<meta charset=\'utf-8\'><html><head></head><body><div class="math-block" data-math="\\text{Loss}_{\\text{L1}} = \\text{Loss}_{\\text{original}} + \\lambda \\sum_{i=1}^{n} \\vert{}w_i\\vert{}" style="font-family: &quot;Google Sans Text&quot;, sans-serif !important; line-height: 1.15 !important; margin-top: 0px !important;">$$\\text{Loss}_{\\text{L1}} = \\text{Loss}_{\\text{original}} + \\lambda \\sum_{i=1}^{n} \\vert{}w_i\\vert{}$$</div></body></html>';
    const cleanMath = cleanHtmlMathToMathML(inputHtml);
    expect(cleanMath).toContain('<mtext>Loss</mtext>');
    expect(cleanMath).toContain('<mtext>L1</mtext>');
    expect(cleanMath).not.toContain('<mi>L</mi><mi>o</mi><mi>s</mi><mi>s</mi>');

    const res = convertHtml(inputHtml);
    expect(res.html).toContain('<mtext>Loss</mtext>');
    expect(res.html).not.toContain('<mi>L</mi><mi>o</mi><mi>s</mi><mi>s</mi>');
  });

  it('handles full HTML document string with non-breaking spaces and zero-width spaces', () => {
    const inputHtml =
      '<meta charset=\'utf-8\'><html><head></head><body><div class="math-block" data-math="\\text{\u00a0Loss\u200b}_{\\text{L1}} = \\text{Loss}" style="font-family: &quot;Google Sans&quot;;">$$\\text{Loss}$$</div></body></html>';
    const cleanMath = cleanHtmlMathToMathML(inputHtml);
    expect(cleanMath).toContain('<mtext>Loss</mtext>');
  });

  it('handles data-math with html entities like &lt; &gt; &amp; &quot;', () => {
    const inputHtml =
      '<div class="math-block" data-math="\\text{Loss} &lt; \\text{gain}">$$\\text{Loss} &lt; \\text{gain}$$</div>';
    const res = convertHtml(inputHtml);
    expect(res.html).toContain('<mtext>Loss</mtext>');
    expect(res.html).toContain('<mtext>gain</mtext>');
  });

  it('handles span with data-math', () => {
    const inputHtml =
      '<span class="math-inline" data-math="\\text{loss}">$$\\text{loss}$$</span>';
    const res = convertHtml(inputHtml);
    expect(res.html).toContain('<mtext>loss</mtext>');
  });

  it('handles data-math with &quot; in adjacent style attribute', () => {
    const inputHtml =
      '<div class="math-block" data-math="\\text{Loss} = 1" style="font-family: &quot;Google Sans&quot;;">$$\\text{Loss} = 1$$</div>';
    const res = convertHtml(inputHtml);
    expect(res.html).toContain('<mtext>Loss</mtext>');
  });

  it('handles math-block div WITHOUT data-math attribute', () => {
    const inputHtml =
      '<div class="math-block">$$\\text{Loss}_{\\text{L1}} = \\text{Loss}_{\\text{original}} + \\lambda \\sum_{i=1}^{n} \\vert{}w_i\\vert{}$$</div>';
    const res = convertHtml(inputHtml);
    expect(res.html).toContain('<mtext>Loss</mtext>');
  });

  it('handles data-math containing > inside attribute value', () => {
    const inputHtml =
      '<div class="math-block" data-math="\\text{Loss} > \\text{Gain}">$$\\text{Loss} > \\text{Gain}$$</div>';
    const res = convertHtml(inputHtml);
    console.log('TEST 6 OUTPUT:\n', res.html);
  });

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
