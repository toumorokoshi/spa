import TurndownService from 'turndown';
import { marked } from 'marked';
import {
  latexToText,
  convertEmbeddedLatex,
  getLatexCommands,
  SUPERSCRIPTS,
  SUBSCRIPTS,
  unicodeToLetterMap
} from './latex';

export type InputFormat = 'auto' | 'html' | 'markdown' | 'latex';

export interface ClipboardDataPayload {
  plainText: string;
  htmlText?: string;
}

export interface ConvertedOutputs {
  html: string;
  markdown: string;
  plaintext: string;
}

import { gfm } from 'turndown-plugin-gfm';

const turndownService = new TurndownService({ headingStyle: 'atx' });
turndownService.use(gfm);

const STRUCTURAL_MACROS = [
  'frac',
  'tfrac',
  'dfrac',
  'cfrac',
  'textbf',
  'textit',
  'text',
  'mathrm',
  'mathbf',
  'mathit',
  'begin',
  'end',
  'mathbb',
  'mathcal',
  'boldsymbol',
  'bold',
  'mathsf',
  'operatorname',
  'widehat',
  'vec',
  'underbrace',
  'stackrel',
  'pmod',
  'xrightarrow'
];

const getLatexIndicators = (): string[] => {
  const dynamicCommands = getLatexCommands();
  const allIndicators = new Set([...STRUCTURAL_MACROS, ...dynamicCommands]);
  return Array.from(allIndicators);
};

const LATEX_INDICATORS = getLatexIndicators();

const detectFormat = (payload: ClipboardDataPayload): InputFormat => {
  if (payload.htmlText) {
    return 'html';
  }

  const hasLatexDelimiters = /\$\$|\\\[|\\\]|\\\(|\\\)/.test(payload.plainText);
  const commandsPattern = new RegExp(
    `\\\\(${LATEX_INDICATORS.join('|')})(?![a-zA-Z])`
  );
  const hasLatexCommands = commandsPattern.test(payload.plainText);

  if (hasLatexDelimiters || hasLatexCommands) {
    return 'latex';
  }

  return 'markdown';
};

const SPAN_START_LEN = 5;
const SPAN_END_LEN = 7;

const findMatchingBrace = (
  text: string,
  index: number,
  braceCount: number
): number => {
  if (index >= text.length || braceCount === 0) {
    return index;
  }
  const nextChar = text[index];
  const nextCount =
    nextChar === '{'
      ? braceCount + 1
      : nextChar === '}'
        ? braceCount - 1
        : braceCount;
  return findMatchingBrace(text, index + 1, nextCount);
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

const findFallbackSuffixRecursive = (
  before: string,
  converted: string,
  index: number,
  minIndex: number
): string => {
  if (index < minIndex) {
    return '';
  }
  const candidate = before.slice(index);
  if (
    candidate.trim() &&
    isDuplicate(candidate, converted) &&
    hasWordBoundary(before, index)
  ) {
    return candidate;
  }
  return findFallbackSuffixRecursive(before, converted, index - 1, minIndex);
};

const findFallbackSuffix = (before: string, converted: string): string => {
  const maxSearchLen = Math.min(
    before.length,
    Math.max(MAX_FALLBACK_SEARCH_LEN, converted.length * FALLBACK_SEARCH_RATIO)
  );
  return findFallbackSuffixRecursive(
    before,
    converted,
    before.length - 1,
    before.length - maxSearchLen
  );
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
  after: string,
  converted: string
): string => {
  const fallbackSuffix = converted ? findFallbackSuffix(before, converted) : '';
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

const processDisplayStyle = (text: string): string => {
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
    const processedText = processBlockReplacement(before, after, converted);
    return processDisplayStyle(processedText);
  }

  const before = text.slice(0, startIdx + matchLength);
  const after = text.slice(startIdx + matchLength);
  return before + processDisplayStyle(after);
};

const findMatchingSpan = (
  html: string,
  index: number,
  spanCount: number
): number => {
  if (index >= html.length || spanCount === 0) {
    return index;
  }
  if (html.startsWith('<span', index)) {
    return findMatchingSpan(html, index + SPAN_START_LEN, spanCount + 1);
  }
  if (html.startsWith('</span>', index)) {
    return findMatchingSpan(html, index + SPAN_END_LEN, spanCount - 1);
  }
  return findMatchingSpan(html, index + 1, spanCount);
};

const replaceHtmlContainers = (
  html: string,
  className: string,
  replaceFn: (innerContent: string) => string
): string => {
  const startPattern = new RegExp(
    `<span[^>]*class="[^"]*${className}[^"]*"[^>]*>`,
    'i'
  );
  const match = startPattern.exec(html);
  if (!match) {
    return html;
  }
  const startIdx = match.index;
  const startTag = match[0];
  const j = findMatchingSpan(html, startIdx + startTag.length, 1);
  if (j <= html.length && html.slice(j - SPAN_END_LEN, j) === '</span>') {
    const before = html.slice(0, startIdx);
    const innerContent = html.slice(
      startIdx + startTag.length,
      j - SPAN_END_LEN
    );
    const after = html.slice(j);
    return (
      before +
      replaceFn(innerContent) +
      replaceHtmlContainers(after, className, replaceFn)
    );
  }
  const before = html.slice(0, startIdx + startTag.length);
  const after = html.slice(startIdx + startTag.length);
  return before + replaceHtmlContainers(after, className, replaceFn);
};

const unwrapStyleCommands = (text: string): string => {
  const pattern = /\{\s*\\(?:display|text|script|scriptscript)style/i;
  const match = pattern.exec(text);
  if (!match) {
    return text.replace(/\\(?:display|text|script|scriptscript)style\s*/gi, '');
  }
  const startIdx = match.index;
  const matchLength = match[0].length;
  const j = findMatchingBrace(text, startIdx + 1, 1);
  if (j <= text.length && text[j - 1] === '}') {
    const before = text.slice(0, startIdx);
    const inner = text.slice(startIdx + matchLength, j - 1);
    const after = text.slice(j);
    return unwrapStyleCommands(before + inner + after);
  }
  const before = text.slice(0, startIdx + matchLength);
  const after = text.slice(startIdx + matchLength);
  return before + unwrapStyleCommands(after);
};

const extractLatexFromMathHtml = (innerContent: string): string | null => {
  const annotationMatch = /<annotation[^>]*>([\s\S]*?)<\/annotation>/i.exec(
    innerContent
  );
  if (annotationMatch) {
    return annotationMatch[1].trim();
  }
  const mathMatch = /<math[^>]*alttext="([^"]+)"/i.exec(innerContent);
  if (mathMatch) {
    return mathMatch[1].trim();
  }
  const imgMatch = /<img[^>]*alt="([^"]+)"/i.exec(innerContent);
  if (imgMatch) {
    return imgMatch[1].trim();
  }
  return null;
};

const cleanHtmlMath = (html: string): string => {
  const replaceFn = (innerContent: string): string => {
    const rawLatex = extractLatexFromMathHtml(innerContent);
    if (rawLatex !== null) {
      const cleanedLatex = unwrapStyleCommands(rawLatex);
      return latexToText(cleanedLatex);
    }
    return innerContent.replace(/<[^>]*>?/gm, '');
  };

  const processedWiki = replaceHtmlContainers(
    html,
    'mwe-math-element',
    replaceFn
  );
  return replaceHtmlContainers(processedWiki, 'katex', replaceFn);
};

const convertHtml = (html: string): ConvertedOutputs => {
  const cleanedHtml = cleanHtmlMath(html);
  const processedHtml = convertEmbeddedLatex(cleanedHtml);
  const markdown = turndownService.turndown(processedHtml);

  // Remove <style>...</style> blocks, <meta> tags, <font> tags, and styling attributes
  const cleanHtml = processedHtml
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<meta[^>]*>/gis, '')
    .replace(/<\/?font[^>]*>/gis, '')
    .replace(
      /\s+(style|class|id|color|bgcolor|align|valign|width|height)=("[^"]*"|'[^']*'|[^\s>]+)/gi,
      ''
    );

  const plaintext = processedHtml.replace(/<[^>]*>?/gm, '').trim();
  return { html: cleanHtml, markdown, plaintext };
};

const convertLatex = (plainText: string): ConvertedOutputs => {
  const plaintext = latexToText(plainText);
  const markdown = plaintext;
  const html = `<p>${plaintext}</p>`;
  return { html, markdown, plaintext };
};

const convertMarkdown = (plainText: string): ConvertedOutputs => {
  const processedMarkdown = convertEmbeddedLatex(plainText);
  const markdown = processedMarkdown;
  const htmlBody = marked.parse(markdown, { async: false }) as string;
  const html = htmlBody.trim();
  const plaintext = html.replace(/<[^>]*>?/gm, '').trim();
  return { html, markdown, plaintext };
};

const convertMisc = (plainText: string): string => {
  // process displayStyle, which shows up from wikipedia
  const normalized = plainText.replace(/\u00a0/g, ' ');
  return processDisplayStyle(normalized);
};

export const convert = (
  payload: ClipboardDataPayload,
  format: InputFormat
): ConvertedOutputs => {
  const resolvedFormat = format === 'auto' ? detectFormat(payload) : format;
  payload.plainText = convertMisc(payload.plainText);

  if (resolvedFormat === 'html') {
    return convertHtml(payload.htmlText || payload.plainText);
  }
  if (resolvedFormat === 'latex') {
    return convertLatex(payload.plainText);
  }
  return convertMarkdown(payload.plainText);
};
