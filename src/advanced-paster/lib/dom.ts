/**
 * DOM-based location and extraction of math elements inside pasted HTML.
 *
 * Pasted math arrives in many shapes -- MathML `<math>` trees, editor
 * containers carrying `data-math`, KaTeX spans, and Wikipedia's rendered SVG
 * `<img>` whose `alt` holds the original LaTeX. Locating these with regular
 * expressions means hand-rolling tag balancing, attribute quoting and entity
 * decoding; the browser's own parser already does all three correctly, and it
 * is available both at runtime and under jsdom in tests.
 *
 * Rendered math is spliced back in as a *string* rather than as DOM nodes: the
 * MathML that Temml emits is serialization-sensitive (namespaces, `style`
 * attributes, entity forms), so each matched element is swapped for a
 * placeholder text node, the tree is serialized once, and the placeholders are
 * then substituted textually. The parser is used only to find and read math,
 * never to re-emit it.
 */
import { isLatexLike, unwrapStyleCommands } from './latex';

/** A math expression located in pasted HTML, with its rendering mode. */
export interface MathElement {
  latex: string;
  isDisplay: boolean;
}

/**
 * Elements that may carry math. `<img>` is included as a candidate and then
 * narrowed by `isMathImage`, since most images are not math.
 */
const MATH_SELECTOR = [
  'math',
  'mwe-math-element',
  'img',
  '[data-math]',
  '[data-latex]',
  '[data-tex]',
  '.math-block',
  '.math-inline',
  '.katex',
  '[class*="mwe-math-element"]'
].join(',');

const TEX_ANNOTATION_SELECTOR =
  'annotation[encoding="application/x-tex"], annotation[encoding="TeX"]';

const WIKIMEDIA_MATH_SRC = /\/media\/math\/render\//i;
const MATH_FALLBACK_IMAGE_CLASS = /mwe-math-fallback-image/i;
const BLOCK_CLASS = /math-block|mwe-math-element-block/i;
const TEMML_CLASS = /tml-(?:display|inline)/;
const TEMML_STYLE = /display:\s*(?:block|inline)\s+math/;
const DISPLAY_DELIMITER = /\$\$|\\\[/;

const attr = (element: Element, name: string): string =>
  element.getAttribute(name) ?? '';

/** Matches the element itself first, then its descendants. */
const selfOrDescendant = (
  element: Element,
  selector: string
): Element | null =>
  element.matches(selector) ? element : element.querySelector(selector);

/**
 * Math already rendered by Temml. Re-extracting it would round-trip the
 * expression through the LaTeX annotation for no gain, and risks double
 * conversion when a pipeline stage runs over its own output.
 */
const isTemmlOutput = (element: Element): boolean =>
  TEMML_CLASS.test(attr(element, 'class')) ||
  TEMML_STYLE.test(attr(element, 'style'));

/**
 * Wikipedia and MediaWiki serve math as an SVG `<img>` whose `alt` is the
 * source LaTeX. Copying a single formula out of an article yields that `<img>`
 * on its own, stripped of the `mwe-math-element` wrapper that would otherwise
 * identify it -- so the `alt` content itself has to be the deciding signal.
 */
const isMathImage = (element: Element): boolean =>
  WIKIMEDIA_MATH_SRC.test(attr(element, 'src')) ||
  MATH_FALLBACK_IMAGE_CLASS.test(attr(element, 'class')) ||
  isLatexLike(attr(element, 'alt'));

const isMathElement = (element: Element): boolean => {
  if (element.tagName === 'IMG') {
    return isMathImage(element);
  }
  return !isTemmlOutput(element);
};

const DATA_ATTRIBUTES = ['data-math', 'data-latex', 'data-tex'];

const readDataAttribute = (element: Element): string | null =>
  DATA_ATTRIBUTES.reduce<string | null>(
    (found, name) => found ?? element.getAttribute(name),
    null
  );

const readTexAnnotation = (element: Element): string | null =>
  selfOrDescendant(element, TEX_ANNOTATION_SELECTOR)?.textContent ?? null;

const readAltText = (element: Element): string | null =>
  selfOrDescendant(element, 'math[alttext]')?.getAttribute('alttext') ?? null;

const readImageAlt = (element: Element): string | null =>
  selfOrDescendant(element, 'img[alt]')?.getAttribute('alt') ?? null;

const readOwnAlt = (element: Element): string | null =>
  element.getAttribute('alt');

const readDelimited = (element: Element): string | null => {
  const match = /(\$\$|\\\[|\\\()([\s\S]*?)(\$\$|\\\]|\\\))/.exec(
    element.textContent ?? ''
  );
  return match ? match[2] : null;
};

/**
 * Ordered most to least authoritative: an explicit source attribute beats a
 * MathML annotation, which beats an accessibility fallback, which beats
 * scraping delimiters out of the rendered text.
 */
const LATEX_READERS = [
  readDataAttribute,
  readTexAnnotation,
  readAltText,
  readImageAlt,
  readOwnAlt,
  readDelimited
];

const readLatex = (element: Element): string | null =>
  LATEX_READERS.reduce<string | null>(
    (found, read) => (found ? found : read(element)),
    null
  );

const hasBlockDisplayAttribute = (element: Element): boolean =>
  selfOrDescendant(element, '[display="block"]') !== null;

const DISPLAY_HINTS = [
  (element: Element): boolean => element.tagName === 'DIV',
  (element: Element): boolean => BLOCK_CLASS.test(attr(element, 'class')),
  hasBlockDisplayAttribute,
  (element: Element): boolean =>
    DISPLAY_DELIMITER.test(element.textContent ?? '')
];

const isDisplayMath = (element: Element, latex: string): boolean =>
  latex.includes('\\displaystyle') ||
  DISPLAY_HINTS.some((hint) => hint(element));

/**
 * Reads an element's math source. Attribute values and text content arrive
 * already entity-decoded from the parser, so only `\displaystyle`-style
 * wrappers need stripping.
 */
const readMathElement = (element: Element): MathElement => {
  const latex = readLatex(element) ?? element.textContent ?? '';
  return {
    // Trimmed after unwrapping: stripping `{\displaystyle ...}` leaves the
    // space that separated the command from its argument.
    latex: unwrapStyleCommands(latex).trim(),
    isDisplay: isDisplayMath(element, latex)
  };
};

/**
 * Outermost matches only, in document order. A Wikipedia formula nests a
 * `<math>` tree and a fallback `<img>` inside one `mwe-math-element` span; all
 * three match the selector but describe a single expression.
 */
const collectMathElements = (root: ParentNode): Element[] =>
  Array.from(root.querySelectorAll(MATH_SELECTOR))
    .filter(isMathElement)
    .reduce<Element[]>(
      (outermost, element) =>
        outermost.some((kept) => kept.contains(element))
          ? outermost
          : [...outermost, element],
      []
    );

// Private Use Area, so the token cannot collide with markup or pasted prose.
const placeholderFor = (index: number): string => `${index}`;

const substitutePlaceholders = (
  serialized: string,
  rendered: string[]
): string =>
  rendered.reduce(
    // Replacer function, not a string: rendered MathML embeds the LaTeX source,
    // which may contain `$$` and other `$` patterns that `replace` would expand.
    (html, replacement, index) =>
      html.replace(placeholderFor(index), () => replacement),
    serialized
  );

/**
 * Swaps each located math element for a placeholder, reading its source first.
 * Isolates the tree mutation this transform depends on.
 */
const renderAndDetach = (
  elements: Element[],
  render: (math: MathElement) => string
): string[] =>
  elements.map((element, index) => {
    const rendered = render(readMathElement(element));
    element.replaceWith(document.createTextNode(placeholderFor(index)));
    return rendered;
  });

/**
 * Replaces every math element in `html` with the output of `render`.
 *
 * Returns `html` untouched when it holds no math, so documents that never
 * needed parsing are not reshaped by a serialization round-trip.
 */
export const transformMathElements = (
  html: string,
  render: (math: MathElement) => string
): string => {
  // `<template>` parses in a mode that tolerates orphaned table fragments and
  // adds no `<html>`/`<body>` wrapper of its own, unlike `DOMParser`.
  const template = document.createElement('template');
  template.innerHTML = html;

  const elements = collectMathElements(template.content);
  if (elements.length === 0) {
    return html;
  }

  // Must render before serializing: `renderAndDetach` reads each element's
  // source and only then swaps it out for its placeholder.
  const rendered = renderAndDetach(elements, render);
  return substitutePlaceholders(template.innerHTML, rendered);
};

/**
 * Reads the single math expression described by an HTML fragment, for callers
 * that have already isolated one container. Returns `null` when the fragment
 * holds no math.
 */
export const readMathFromHtml = (html: string): MathElement | null => {
  const template = document.createElement('template');
  template.innerHTML = html;
  const [element] = collectMathElements(template.content);
  return element ? readMathElement(element) : null;
};
