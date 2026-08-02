/* eslint-disable max-lines-per-function */
import { describe, it, expect } from 'vitest';
import { readMathFromHtml, transformMathElements } from './dom';

const WIKIPEDIA_MATH_IMG =
  '<img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/d81b8c33cae834be9695eb83960081cb3ce0ffd7" aria-hidden="true" alt="{\\displaystyle {\\text{Speedup}}={\\frac {a}{b}}}">';

const label = ({ latex, isDisplay }: { latex: string; isDisplay: boolean }) =>
  `[${isDisplay ? 'block' : 'inline'}:${latex}]`;

describe('transformMathElements', () => {
  it('returns the input untouched when it holds no math', () => {
    const html = '<p>Plain <b>prose</b> with <i>no</i> math.</p>';
    expect(transformMathElements(html, label)).toBe(html);
  });

  it('leaves ordinary images alone', () => {
    const html = '<p>See <img src="cat.jpg" alt="A cat on a mat"> here.</p>';
    expect(transformMathElements(html, label)).toBe(html);
  });

  it('converts a bare Wikipedia math image using its alt LaTeX', () => {
    expect(transformMathElements(WIKIPEDIA_MATH_IMG, label)).toBe(
      '[block:{\\text{Speedup}}={\\frac {a}{b}}]'
    );
  });

  it('recognises a math image by its wikimedia src even when the alt is bare', () => {
    const html =
      '<img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/abc" alt="U">';
    expect(transformMathElements(html, label)).toBe('[inline:U]');
  });

  it('recognises a math image by its mediawiki fallback class', () => {
    const html =
      '<img class="mwe-math-fallback-image-inline" src="/x.svg" alt="U">';
    expect(transformMathElements(html, label)).toBe('[inline:U]');
  });

  it('emits one result for a Wikipedia span wrapping both MathML and a fallback image', () => {
    const html =
      '<span class="mwe-math-element"><span class="mwe-math-mathml-inline"><math alttext="{\\displaystyle U}"><semantics><mi>U</mi><annotation encoding="application/x-tex">{\\displaystyle U}</annotation></semantics></math></span><img class="mwe-math-fallback-image-inline" src="/u.svg" alt="U" /></span>';
    expect(transformMathElements(html, label)).toBe('[block:U]');
  });

  it('preserves surrounding markup around replaced math', () => {
    const html = `<p>Before ${WIKIPEDIA_MATH_IMG} after.</p>`;
    expect(transformMathElements(html, () => '<math/>')).toBe(
      '<p>Before <math/> after.</p>'
    );
  });

  it('replaces each of several math elements independently', () => {
    const html =
      '<p><span data-math="a">x</span> and <span data-math="b">y</span></p>';
    expect(
      transformMathElements(html, ({ latex }) => latex.toUpperCase())
    ).toBe('<p>A and B</p>');
  });

  it('does not expand dollar patterns in rendered output', () => {
    // `$&` and `$1` are String.replace substitution patterns; rendered MathML
    // embeds the raw LaTeX source, so they must survive verbatim.
    const rendered = transformMathElements(
      '<span data-math="x">x</span>',
      () => '<annotation>$$a$&b$1</annotation>'
    );
    expect(rendered).toBe('<annotation>$$a$&b$1</annotation>');
  });

  it('skips math already rendered by Temml', () => {
    const html =
      '<math display="block" class="tml-display" style="display:block math;"><mi>x</mi></math>';
    expect(transformMathElements(html, label)).toBe(html);
  });

  it('decodes HTML entities in the extracted LaTeX', () => {
    const html = '<div class="math-block" data-math="a &lt; b &amp; c">x</div>';
    expect(transformMathElements(html, ({ latex }) => latex)).toBe('a < b & c');
  });

  it('survives a full document wrapper around the math', () => {
    const html =
      '<meta charset="utf-8"><html><head></head><body><div class="math-block" data-math="x">y</div></body></html>';
    expect(transformMathElements(html, ({ latex }) => latex)).toContain('x');
  });
});

describe('readMathFromHtml', () => {
  it('reads the LaTeX and display mode of a single container', () => {
    expect(readMathFromHtml(WIKIPEDIA_MATH_IMG)).toEqual({
      latex: '{\\text{Speedup}}={\\frac {a}{b}}',
      isDisplay: true
    });
  });

  it('prefers an explicit data attribute over the rendered text', () => {
    expect(
      readMathFromHtml('<span data-math="\\alpha">rendered</span>')
    ).toEqual({ latex: '\\alpha', isDisplay: false });
  });

  it('falls back to a TeX annotation inside a MathML tree', () => {
    const html =
      '<math><semantics><mi>x</mi><annotation encoding="application/x-tex">x^2</annotation></semantics></math>';
    expect(readMathFromHtml(html)?.latex).toBe('x^2');
  });

  it('returns null when the fragment holds no math', () => {
    expect(readMathFromHtml('<p>prose</p>')).toBeNull();
  });
});
