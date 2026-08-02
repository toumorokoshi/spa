/* eslint-disable complexity, functional/no-let, no-magic-numbers, max-lines-per-function */
import TurndownService from 'turndown';
import { marked } from 'marked';
import {
  latexToText,
  latexToMathML,
  convertEmbeddedLatexToUnicode,
  convertEmbeddedLatexToMathML,
  hasLatexCommands,
  hasLatexDelimiters,
  SUPERSCRIPTS,
  SUBSCRIPTS,
  unicodeToLetterMap,
  normalizeInput,
  unwrapStyleCommands,
  findMatchingBrace
} from './latex';
import { readMathFromHtml, transformMathElements } from './dom';

export type InputFormat = 'auto' | 'html' | 'markdown' | 'latex';

export interface ClipboardDataPayload {
  plainText: string;
  htmlText?: string;
}

export interface DetectionResult {
  format: Exclude<InputFormat, 'auto'>;
  explanation: string;
}

export interface ConvertedOutputs {
  html: string;
  markdown: string;
  plaintext: string;
  debugSteps: Array<{ stepName: string; output: string }>;
  detectedFormat?: Exclude<InputFormat, 'auto'>;
  detectionExplanation?: string;
}

import { gfm } from 'turndown-plugin-gfm';

const turndownService = new TurndownService({ headingStyle: 'atx' });
turndownService.use(gfm);

export const isHtml = (str: string): boolean => {
  return /<[a-z/][\s\S]*>/i.test(str);
};

export const detectFormatDetails = (
  payload: ClipboardDataPayload
): DetectionResult => {
  if (payload.htmlText && payload.htmlText.trim().length > 0) {
    return {
      format: 'html',
      explanation:
        'Detected HTML content in clipboard payload (payload.htmlText).'
    };
  }

  if (isHtml(payload.plainText)) {
    return {
      format: 'html',
      explanation: 'Detected HTML tags inside plainText input.'
    };
  }

  if (hasLatexDelimiters(payload.plainText)) {
    return {
      format: 'latex',
      explanation:
        'Detected LaTeX math delimiters ($$, \\[, \\], \\(, or \\)) in plainText.'
    };
  }

  if (hasLatexCommands(payload.plainText)) {
    return {
      format: 'latex',
      explanation: 'Detected LaTeX math macros/commands in plainText.'
    };
  }

  return {
    format: 'markdown',
    explanation:
      'Defaulted to Markdown/Plaintext (no HTML tags or LaTeX indicators detected).'
  };
};

export const detectFormat = (
  payload: ClipboardDataPayload
): Exclude<InputFormat, 'auto'> => {
  return detectFormatDetails(payload).format;
};

const MIN_DEDUPLICATE_PREFIX_LEN = 3;
const DEDUPLICATE_PREFIX_RATIO = 0.5;
const SHORT_FALLBACK_LEN = 2;
const MAX_FALLBACK_SEARCH_LEN = 100;
const FALLBACK_SEARCH_RATIO = 3;

const reverseSuperscripts: Record<string, string> = Object.fromEntries(
  Object.entries(SUPERSCRIPTS).map(([k, v]) => [v, k])
);
const reverseSubscripts: Record<string, string> = Object.fromEntries(
  Object.entries(SUBSCRIPTS).map(([k, v]) => [v, k])
);

const normalizeForComparison = (str: string): string => {
  return str
    .split('')
    .map((char) => {
      if (reverseSuperscripts[char]) {
        return reverseSuperscripts[char];
      }
      if (reverseSubscripts[char]) {
        return reverseSubscripts[char];
      }
      if (unicodeToLetterMap[char]) {
        return unicodeToLetterMap[char];
      }
      return char;
    })
    .join('')
    .toLowerCase()
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[^a-z0-9]/g, '');
};

const getCommonPrefixLength = (a: string, b: string, index = 0): number => {
  if (index >= a.length || index >= b.length || a[index] !== b[index]) {
    return index;
  }
  return getCommonPrefixLength(a, b, index + 1);
};

const isDuplicate = (fallback: string, expected: string): boolean => {
  const normFallback = normalizeForComparison(fallback);
  const normExpected = normalizeForComparison(expected);
  if (!normFallback || !normExpected) {
    return false;
  }
  if (normFallback.length <= SHORT_FALLBACK_LEN) {
    return normFallback === normExpected;
  }
  const maxLen = Math.max(normFallback.length, normExpected.length);
  const minLen = Math.min(normFallback.length, normExpected.length);
  if (maxLen > minLen * 2.0) {
    return false;
  }
  const prefixLen = getCommonPrefixLength(normFallback, normExpected);
  const requiredLen = Math.max(
    MIN_DEDUPLICATE_PREFIX_LEN,
    Math.floor(normFallback.length * DEDUPLICATE_PREFIX_RATIO)
  );
  return prefixLen >= requiredLen;
};

const hasWordBoundary = (before: string, suffixIndex: number): boolean => {
  if (suffixIndex === 0) {
    return true;
  }
  const prevChar = before[suffixIndex - 1];
  return !/[a-zA-Z0-9]/.test(prevChar);
};

const isInsideHtmlTag = (str: string, index: number): boolean => {
  const lastOpen = str.lastIndexOf('<', index);
  const lastClose = str.lastIndexOf('>', index);
  return lastOpen > lastClose;
};

const isCandidateMatch = (
  before: string,
  candidate: string,
  index: number,
  converted: string
): boolean => {
  if (isInsideHtmlTag(before, index)) {
    return false;
  }
  return (
    candidate.trim() !== '' &&
    !/\s/.test(candidate[0]) &&
    isDuplicate(candidate, converted) &&
    hasWordBoundary(before, index)
  );
};

const findFallbackSuffixRecursive = (
  before: string,
  converted: string,
  index: number,
  maxIndex: number
): string => {
  if (index > maxIndex) {
    return '';
  }
  const candidate = before.slice(index);
  if (isCandidateMatch(before, candidate, index, converted)) {
    return candidate;
  }
  return findFallbackSuffixRecursive(before, converted, index + 1, maxIndex);
};

const findFallbackSuffix = (before: string, converted: string): string => {
  const searchLimit = Math.min(
    before.length,
    Math.max(MAX_FALLBACK_SEARCH_LEN, converted.length * FALLBACK_SEARCH_RATIO)
  );
  const minStartIndex = before.length - searchLimit;
  return findFallbackSuffixRecursive(
    before,
    converted,
    minStartIndex,
    before.length - 1
  );
};

const processBlockReplacementFull = (
  before: string,
  after: string,
  converted: string,
  unicodeConverted = converted
): string => {
  const fallbackSuffix = unicodeConverted
    ? findFallbackSuffix(before, unicodeConverted)
    : '';
  if (!fallbackSuffix) {
    return before + converted + after;
  }
  const beforeWithoutFallback = before.slice(
    0,
    before.length - fallbackSuffix.length
  );
  const cleanedBefore = getCleanedBefore(beforeWithoutFallback);
  return cleanedBefore + converted + after;
};

// Recursive brace-aware handler for {\\displaystyle ...} / {\\textstyle ...} in plain text
const processStyleBracesToUnicode = (text: string): string => {
  const pattern = /\{\s*\\(?:display|text|script|scriptscript)style/i;
  const match = pattern.exec(text);
  if (!match) {
    return text;
  }
  const startIdx = match.index;
  const matchLength = match[0].length;
  const j = findMatchingBrace(text, startIdx + 1, 1);

  if (j <= text.length && text[j - 1] === '}') {
    const before = text.slice(0, startIdx);
    const after = text.slice(j);
    const latexInner = text.slice(startIdx + matchLength, j - 1);
    const converted = latexToText(unwrapStyleCommands(latexInner));
    const processedText = processBlockReplacementFull(before, after, converted);
    return processStyleBracesToUnicode(processedText);
  }

  const before = text.slice(0, startIdx + matchLength);
  const after = text.slice(startIdx + matchLength);
  return before + processStyleBracesToUnicode(after);
};

const getCleanedBefore = (beforeWithoutFallback: string): string => {
  const matchWhitespace = /\s+$/.exec(beforeWithoutFallback);
  if (!matchWhitespace) {
    return beforeWithoutFallback;
  }
  const hasParagraphBreak = matchWhitespace[0].includes('\n\n');
  return beforeWithoutFallback.trimEnd() + (hasParagraphBreak ? '\n\n' : ' ');
};

const processBlockReplacement = (
  before: string,
  mathExpr: string,
  isUnicode: boolean,
  isDisplayHint = false
): { beforeClean: string; blockOutput: string } => {
  const cleanLatex = unwrapStyleCommands(mathExpr);
  const isDisplayMode =
    isDisplayHint ||
    mathExpr.includes('\\displaystyle') ||
    mathExpr.startsWith('$$') ||
    mathExpr.startsWith('\\[');

  const converted = isUnicode
    ? latexToText(cleanLatex)
    : latexToMathML(cleanLatex, isDisplayMode);
  const unicodeConverted = latexToText(cleanLatex);

  const fallback = findFallbackSuffix(before, unicodeConverted);
  let beforeClean = before;
  if (fallback) {
    const rawBefore = before.slice(0, before.length - fallback.length);
    beforeClean = getCleanedBefore(rawBefore);
  }

  return {
    beforeClean,
    blockOutput: converted
  };
};

// Finds the index just after the closing </span> that matches the <span> at spanStart.
// searchFrom must be the index AFTER the opening tag's `>` character.
const findMatchingSpanEnd = (html: string, searchFrom: number): number => {
  let depth = 0;
  let i = searchFrom;
  while (i < html.length) {
    const openIdx = html.indexOf('<span', i);
    const closeIdx = html.indexOf('</span>', i);
    if (closeIdx < 0) return -1;
    if (openIdx >= 0 && openIdx < closeIdx) {
      depth++;
      i = openIdx + 5; // skip past '<span'
    } else {
      if (depth === 0) {
        return closeIdx + '</span>'.length;
      }
      depth--;
      i = closeIdx + '</span>'.length;
    }
  }
  return -1;
};

const processDisplayStyleMath = (html: string, isUnicode: boolean): string => {
  const spanStartPattern =
    /<span[^>]*class="[^"]*mwe-math-element[^"]*"[^>]*>/gi;
  const delimiterPattern = /(\$\$|\\\[)([\s\S]*?)(\$\$|\\\])/gi;

  // Collect all matches (spans and delimiters) in document order
  type MatchItem = {
    index: number;
    end: number;
    content: string;
    isDelimiter: boolean;
    inner: string;
  };
  const matches: MatchItem[] = [];

  // Find all mwe-math-element spans with proper nesting
  let spanMatch;
  spanStartPattern.lastIndex = 0;
  while ((spanMatch = spanStartPattern.exec(html)) !== null) {
    const spanStart = spanMatch.index;
    // Start searching for the closing </span> after the opening tag's >
    const afterOpenTag = spanStart + spanMatch[0].length;
    const spanEnd = findMatchingSpanEnd(html, afterOpenTag);
    if (spanEnd >= 0) {
      matches.push({
        index: spanStart,
        end: spanEnd,
        content: html.slice(spanStart, spanEnd),
        isDelimiter: false,
        inner: ''
      });
      spanStartPattern.lastIndex = spanEnd; // skip past this span
    }
  }

  // Find all $$/\[ delimiter matches
  let delimMatch;
  delimiterPattern.lastIndex = 0;
  while ((delimMatch = delimiterPattern.exec(html)) !== null) {
    matches.push({
      index: delimMatch.index,
      end: delimMatch.index + delimMatch[0].length,
      content: delimMatch[0],
      isDelimiter: true,
      inner: delimMatch[2]
    });
  }

  // Sort by start index
  matches.sort((a, b) => a.index - b.index);

  // Remove overlapping matches (keep first one)
  const nonOverlapping: MatchItem[] = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.index >= lastEnd) {
      nonOverlapping.push(m);
      lastEnd = m.end;
    }
  }

  let result = '';
  let lastIndex = 0;

  for (const item of nonOverlapping) {
    const before = html.slice(lastIndex, item.index);
    const extracted = item.isDelimiter ? null : readMathFromHtml(item.content);
    // For delimiter matches, prefer the raw inner content to preserve whitespace for accurate annotation
    const mathExpr = item.isDelimiter
      ? item.inner
      : extracted?.latex || item.content;
    const isDisplayHint = item.isDelimiter || (extracted?.isDisplay ?? false);

    const { beforeClean, blockOutput } = processBlockReplacement(
      before,
      mathExpr,
      isUnicode,
      isDisplayHint
    );

    result += beforeClean + blockOutput;
    lastIndex = item.end;
  }

  result += html.slice(lastIndex);
  return result;
};

export const processDisplayStyleToUnicode = (html: string): string => {
  const braceResolved = processStyleBracesToUnicode(html);
  return processDisplayStyleMath(braceResolved, true);
};

// No brace-resolving counterpart to processStyleBracesToUnicode: on the MathML
// side the {\displaystyle...} patterns are consumed by cleanHtmlMathToMathML,
// which reads them off the DOM rather than out of the raw string.
export const processDisplayStyleToMathML = (html: string): string =>
  processDisplayStyleMath(html, false);

/**
 * Replaces every math container in `html` -- MathML trees, `data-math`
 * editor blocks, KaTeX spans and Wikipedia's rendered SVG `<img>` -- with
 * Temml-rendered MathML. Locating and reading them is delegated to `./dom`,
 * which uses the browser's parser rather than tag-matching by regex.
 */
export const cleanHtmlMathToMathML = (html: string): string =>
  transformMathElements(html, ({ latex, isDisplay }) =>
    latexToMathML(latex, isDisplay)
  );

/** As `cleanHtmlMathToMathML`, but rendering to best-effort Unicode text. */
export const cleanHtmlMathToUnicode = (html: string): string =>
  transformMathElements(html, ({ latex }) => latexToText(latex));

export const convertHtml = (rawInput: string): ConvertedOutputs => {
  const steps: Array<{ stepName: string; output: string }> = [];

  steps.push({ stepName: '1. Raw Input', output: rawInput });

  const normalized = normalizeInput(rawInput);
  steps.push({ stepName: '2. Normalize Input', output: normalized });

  // Math elements are extracted structurally, via the DOM, before any
  // text-level pass runs. The text passes match `{\displaystyle ...}` and math
  // delimiters anywhere in the string, including inside attribute values, so
  // they would otherwise corrupt the very `alt`/`alttext` sources the math has
  // to be read from.
  const cleanedHtmlForHtml = cleanHtmlMathToMathML(normalized);
  steps.push({
    stepName: '3. Extract Html Math Elements to MathML',
    output: cleanedHtmlForHtml
  });

  const htmlWithMath = processDisplayStyleToMathML(cleanedHtmlForHtml);
  steps.push({
    stepName: '4. Pre-process Display Style MathML',
    output: htmlWithMath
  });

  const processedHtmlForHtml = convertEmbeddedLatexToMathML(htmlWithMath);
  steps.push({
    stepName: '5. Convert Embedded Latex to MathML',
    output: processedHtmlForHtml
  });

  const cleanedHtmlForText = cleanHtmlMathToUnicode(normalized);
  steps.push({
    stepName: '6. Extract Html Math Elements to Unicode',
    output: cleanedHtmlForText
  });

  const htmlWithMathText = processDisplayStyleToUnicode(cleanedHtmlForText);
  steps.push({
    stepName: '7. Pre-process Display Style Unicode',
    output: htmlWithMathText
  });

  const processedHtmlForText = convertEmbeddedLatexToUnicode(htmlWithMathText);
  steps.push({
    stepName: '8. Convert Embedded Latex to Unicode',
    output: processedHtmlForText
  });

  const markdown = turndownService.turndown(processedHtmlForText);
  steps.push({ stepName: '9. Generate Markdown (Turndown)', output: markdown });

  const mathBlocks: string[] = [];
  const withPlaceholders = processedHtmlForHtml.replace(
    /<math[^>]*>[\s\S]*?<\/math>/gi,
    (match) => {
      const placeholder = `__MATH_BLOCK_PLACEHOLDER_${mathBlocks.length}__`;
      mathBlocks.push(match);
      return placeholder;
    }
  );
  steps.push({
    stepName: '10. Math Blocks Isolated',
    output: withPlaceholders
  });

  const cleanedRest = withPlaceholders
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<meta[^>]*>/gis, '')
    .replace(/<\/?font[^>]*>/gis, '')
    .replace(/<\/?span[^>]*>/gis, '')
    .replace(
      /\s+(style|class|id|color|bgcolor|align|valign|width|height)=("[^"]*"|'[^']*'|[^\s>]+)/gi,
      ''
    );
  steps.push({
    stepName: '11. Style/Font/Span/Attrs Sanitized',
    output: cleanedRest
  });

  const cleanHtml = mathBlocks.reduce((htmlText, block, index) => {
    return htmlText.replace(`__MATH_BLOCK_PLACEHOLDER_${index}__`, block);
  }, cleanedRest);
  steps.push({
    stepName: '12. Math Blocks Restored (Final HTML)',
    output: cleanHtml
  });

  const plaintext = processedHtmlForText.replace(/<[^>]*>?/gm, '').trim();
  steps.push({ stepName: '13. Generate Plaintext (Final)', output: plaintext });

  return { html: cleanHtml, markdown, plaintext, debugSteps: steps };
};

export const convertLatex = (plainText: string): ConvertedOutputs => {
  const steps: Array<{ stepName: string; output: string }> = [];

  steps.push({ stepName: '1. Raw LaTeX Input', output: plainText });

  const normalized = normalizeInput(plainText);
  steps.push({ stepName: '2. Normalize Input', output: normalized });

  const textInput = isHtml(normalized)
    ? cleanHtmlMathToUnicode(normalized)
    : normalized;
  steps.push({ stepName: '3. Text Input Prepared', output: textInput });

  const textWithMath = processDisplayStyleToUnicode(textInput);
  steps.push({
    stepName: '4. Process Display Style Math to Unicode',
    output: textWithMath
  });

  const plaintext = latexToText(textWithMath);
  steps.push({
    stepName: '5. Generate Plaintext / Unicode',
    output: plaintext
  });

  const markdown = plaintext;
  steps.push({ stepName: '6. Generate Markdown', output: markdown });

  const htmlInput = isHtml(normalized)
    ? cleanHtmlMathToMathML(normalized)
    : normalized;
  steps.push({ stepName: '7. HTML Input Prepared', output: htmlInput });

  const htmlWithMath = processDisplayStyleToMathML(htmlInput);
  steps.push({
    stepName: '8. Process Display Style Math to MathML',
    output: htmlWithMath
  });

  const hasLatexDelimiters = /\$|\\\[|\\\]|\\\(|\\\)/.test(htmlWithMath);
  const hasMathML = htmlWithMath.includes('<math');
  const html =
    hasLatexDelimiters || hasMathML
      ? `<p>${convertEmbeddedLatexToMathML(htmlWithMath)}</p>`
      : `<p>${latexToMathML(htmlWithMath, false)}</p>`;
  steps.push({ stepName: '9. Render Final HTML with MathML', output: html });

  return { html, markdown, plaintext, debugSteps: steps };
};

export const convertMarkdown = (plainText: string): ConvertedOutputs => {
  const steps: Array<{ stepName: string; output: string }> = [];

  steps.push({ stepName: '1. Raw Markdown Input', output: plainText });

  const normalized = normalizeInput(plainText);
  steps.push({ stepName: '2. Normalize Input', output: normalized });

  const textWithMathText = processDisplayStyleToUnicode(normalized);
  steps.push({
    stepName: '3. Process Display Style Math to Unicode',
    output: textWithMathText
  });

  const processedMarkdownForText =
    convertEmbeddedLatexToUnicode(textWithMathText);
  steps.push({
    stepName: '4. Convert Embedded LaTeX to Unicode',
    output: processedMarkdownForText
  });

  const markdown = processedMarkdownForText;
  steps.push({ stepName: '5. Final Markdown Output', output: markdown });

  const textWithMathHtml = processDisplayStyleToMathML(normalized);
  steps.push({
    stepName: '6. Process Display Style Math to MathML',
    output: textWithMathHtml
  });

  const processedMarkdownForHtml =
    convertEmbeddedLatexToMathML(textWithMathHtml);
  steps.push({
    stepName: '7. Convert Embedded LaTeX to MathML',
    output: processedMarkdownForHtml
  });

  const htmlBody = marked.parse(processedMarkdownForHtml, {
    async: false
  }) as string;
  const html = htmlBody.trim();
  steps.push({ stepName: '8. Parse Markdown to HTML', output: html });

  const htmlBodyForText = marked.parse(processedMarkdownForText, {
    async: false
  }) as string;
  const plaintext = htmlBodyForText.replace(/<[^>]*>?/gm, '').trim();
  steps.push({ stepName: '9. Generate Plaintext Output', output: plaintext });

  return { html, markdown, plaintext, debugSteps: steps };
};

export const convert = (
  payload: ClipboardDataPayload,
  format: InputFormat
): ConvertedOutputs => {
  const detection = detectFormatDetails(payload);
  const resolvedFormat = format === 'auto' ? detection.format : format;

  let outputs: ConvertedOutputs;
  if (resolvedFormat === 'html') {
    outputs = convertHtml(payload.htmlText || payload.plainText);
  } else if (resolvedFormat === 'latex') {
    outputs = convertLatex(payload.plainText);
  } else {
    outputs = convertMarkdown(payload.plainText);
  }

  return {
    ...outputs,
    detectedFormat: detection.format,
    detectionExplanation: detection.explanation
  };
};
