import TurndownService from 'turndown';
import { marked } from 'marked';
import {
  latexToText,
  latexToMathML,
  convertEmbeddedLatexToUnicode,
  convertEmbeddedLatexToMathML,
  getLatexCommands,
  SUPERSCRIPTS,
  SUBSCRIPTS,
  unicodeToLetterMap,
  normalizeInput
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
  debugSteps?: Array<{ stepName: string; output: string }>;
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

const isHtml = (str: string): boolean => {
  return /<[a-z/][\s\S]*>/i.test(str);
};

const detectFormat = (payload: ClipboardDataPayload): InputFormat => {
  if (payload.htmlText || isHtml(payload.plainText)) {
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

const isCandidateMatch = (
  before: string,
  candidate: string,
  index: number,
  converted: string
): boolean => {
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
  const maxSearchLen = Math.min(
    before.length,
    Math.max(MAX_FALLBACK_SEARCH_LEN, converted.length * FALLBACK_SEARCH_RATIO)
  );
  return findFallbackSuffixRecursive(
    before,
    converted,
    before.length - maxSearchLen,
    before.length - 1
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

const processDisplayStyleToUnicode = (text: string): string => {
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
    return processDisplayStyleToUnicode(processedText);
  }

  const before = text.slice(0, startIdx + matchLength);
  const after = text.slice(startIdx + matchLength);
  return before + processDisplayStyleToUnicode(after);
};

const processDisplayStyleToMathML = (text: string): string => {
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
    const unescapedLatex = unwrapStyleCommands(latexInner);
    const unicodeConverted = latexToText(unescapedLatex);
    const mathmlConverted = latexToMathML(unescapedLatex, true);
    const processedText = processBlockReplacement(
      before,
      after,
      mathmlConverted,
      unicodeConverted
    );
    return processDisplayStyleToMathML(processedText);
  }

  const before = text.slice(0, startIdx + matchLength);
  const after = text.slice(startIdx + matchLength);
  return before + processDisplayStyleToMathML(after);
};

const NOT_FOUND_INDEX = -1;
const END_TAG_OFFSET = 3;

const MATH_CONTAINER_REGEX =
  /<([a-z0-9]+)[^>]*(?:\bdata-(?:math|latex|tex)="[^"]+"|class="[^"]*(?:math-block|math-inline|mwe-math-element|katex)[^"]*")[^>]*>/i;

const getOpenTagEnd = (
  html: string,
  index: number,
  tagName: string
): number => {
  const openPattern = new RegExp(`^<${tagName}\\b`, 'i');
  if (!openPattern.test(html.slice(index))) {
    return NOT_FOUND_INDEX;
  }
  return html.indexOf('>', index);
};

const getCloseTagEnd = (
  html: string,
  index: number,
  tagName: string
): number => {
  const closePattern = new RegExp(`^</${tagName}\\s*>`, 'i');
  if (!closePattern.test(html.slice(index))) {
    return NOT_FOUND_INDEX;
  }
  return html.indexOf('>', index);
};

const findMatchingTag = (
  html: string,
  tagName: string,
  index: number,
  depth: number
): number => {
  if (index >= html.length || depth === 0) {
    return index;
  }
  const openEnd = getOpenTagEnd(html, index, tagName);
  if (openEnd !== NOT_FOUND_INDEX) {
    return findMatchingTag(html, tagName, openEnd + 1, depth + 1);
  }
  const closeEnd = getCloseTagEnd(html, index, tagName);
  if (closeEnd !== NOT_FOUND_INDEX) {
    return findMatchingTag(html, tagName, closeEnd + 1, depth - 1);
  }
  return findMatchingTag(html, tagName, index + 1, depth);
};

const replaceHtmlContainers = (
  html: string,
  replaceFn: (innerContent: string, startTag: string) => string
): string => {
  const match = MATH_CONTAINER_REGEX.exec(html);
  if (!match) {
    return html;
  }
  const startIdx = match.index;
  const startTag = match[0];
  const tagName = match[1];
  const endTagLen = tagName.length + END_TAG_OFFSET;

  const j = findMatchingTag(html, tagName, startIdx + startTag.length, 1);
  if (
    j <= html.length &&
    html.slice(j - endTagLen, j).toLowerCase() === `</${tagName.toLowerCase()}>`
  ) {
    const before = html.slice(0, startIdx);
    const innerContent = html.slice(startIdx + startTag.length, j - endTagLen);
    const after = html.slice(j);
    return (
      before +
      replaceFn(innerContent, startTag) +
      replaceHtmlContainers(after, replaceFn)
    );
  }
  const before = html.slice(0, startIdx + startTag.length);
  const after = html.slice(startIdx + startTag.length);
  return before + replaceHtmlContainers(after, replaceFn);
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

const decodeHtmlEntities = (str: string): string => {
  return (
    str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      // eslint-disable-next-line quotes
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
  );
};

const extractDataMathAttribute = (tag: string): string | null => {
  const match =
    /\bdata-(?:math|latex|tex)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(tag);
  if (match) {
    // eslint-disable-next-line no-magic-numbers
    const val = match[1] ?? match[2] ?? match[3] ?? '';
    return decodeHtmlEntities(val.trim());
  }
  return null;
};

const extractAnnotationLatex = (innerContent: string): string | null => {
  const match = /<annotation[^>]*>([\s\S]*?)<\/annotation>/i.exec(innerContent);
  return match ? decodeHtmlEntities(match[1].trim()) : null;
};

const extractMathAttrLatex = (innerContent: string): string | null => {
  const match = /<math[^>]*alttext="([^"]+)"/i.exec(innerContent);
  return match ? decodeHtmlEntities(match[1].trim()) : null;
};

const extractImgAttrLatex = (innerContent: string): string | null => {
  const match = /<img[^>]*alt="([^"]+)"/i.exec(innerContent);
  return match ? decodeHtmlEntities(match[1].trim()) : null;
};

const extractLatexFromMathHtml = (
  innerContent: string,
  startTag = ''
): string | null => {
  return (
    extractDataMathAttribute(startTag) ??
    extractAnnotationLatex(innerContent) ??
    extractMathAttrLatex(innerContent) ??
    extractImgAttrLatex(innerContent)
  );
};

const replaceMathTags = (
  html: string,
  replaceFn: (innerContent: string, startTag: string) => string
): string => {
  const startPattern = /<math[^>]*>/i;
  const match = startPattern.exec(html);
  if (!match) {
    return html;
  }
  const startIdx = match.index;
  const startTag = match[0];

  if (startTag.includes('data-processed="true"')) {
    const endTag = '</math>';
    const endIdx = html.indexOf(endTag, startIdx + startTag.length);
    if (endIdx >= 0) {
      const before = html.slice(0, startIdx + startTag.length);
      const after = html.slice(startIdx + startTag.length);
      return before + replaceMathTags(after, replaceFn);
    }
  }

  const endTag = '</math>';
  const endIdx = html.indexOf(endTag, startIdx + startTag.length);
  if (endIdx >= 0) {
    const before = html.slice(0, startIdx);
    const innerContent = html.slice(startIdx + startTag.length, endIdx);
    const after = html.slice(endIdx + endTag.length);
    const replacement = replaceFn(innerContent, startTag).replace(
      /<math/i,
      '<math data-processed="true"'
    );
    return before + replacement + replaceMathTags(after, replaceFn);
  }
  const before = html.slice(0, startIdx + startTag.length);
  const after = html.slice(startIdx + startTag.length);
  return before + replaceMathTags(after, replaceFn);
};

const cleanHtmlMathToUnicode = (html: string): string => {
  const replaceFn = (innerContent: string, startTag: string): string => {
    const rawLatex = extractLatexFromMathHtml(innerContent, startTag);
    if (rawLatex !== null) {
      const cleanedLatex = unwrapStyleCommands(rawLatex);
      return latexToText(cleanedLatex);
    }
    return innerContent.replace(/<[^>]*>?/gm, '');
  };

  const processedContainers = replaceHtmlContainers(html, replaceFn);
  const result = replaceMathTags(processedContainers, replaceFn);
  return result.replace(/\s*data-processed="true"/g, '');
};

const cleanHtmlMathToMathML = (html: string): string => {
  const replaceFn = (innerContent: string, startTag: string): string => {
    const rawLatex = extractLatexFromMathHtml(innerContent, startTag);
    if (rawLatex !== null) {
      const cleanedLatex = unwrapStyleCommands(rawLatex);
      const isDisplay =
        rawLatex.includes('\\displaystyle') ||
        startTag.includes('display="block"') ||
        startTag.includes('mwe-math-element-block') ||
        startTag.includes('math-block');
      const mathml = latexToMathML(cleanedLatex, isDisplay);
      return mathml.replace(/<math/i, '<math data-processed="true"');
    }
    return innerContent.replace(/<[^>]*>?/gm, '');
  };

  const processedContainers = replaceHtmlContainers(html, replaceFn);
  const result = replaceMathTags(processedContainers, replaceFn);
  return result.replace(/\s*data-processed="true"/g, '');
};

// eslint-disable-next-line max-lines-per-function
const convertHtml = (html: string): ConvertedOutputs => {
  const steps: Array<{ stepName: string; output: string }> = [];
  steps.push({ stepName: '1. Input Payload HTML', output: html });

  const normalized = normalizeInput(html);
  steps.push({
    stepName: '2. Normalization (Invisible chars stripped)',
    output: normalized
  });

  const htmlWithMath = isHtml(normalized)
    ? normalized
    : processDisplayStyleToMathML(normalized);
  steps.push({
    stepName: '3. Pre-process Display Style MathML',
    output: htmlWithMath
  });

  const cleanedHtmlForHtml = cleanHtmlMathToMathML(htmlWithMath);
  steps.push({
    stepName: '4. Clean Html Math to MathML',
    output: cleanedHtmlForHtml
  });

  const processedHtmlForHtml = convertEmbeddedLatexToMathML(cleanedHtmlForHtml);
  steps.push({
    stepName: '5. Convert Embedded Latex to MathML',
    output: processedHtmlForHtml
  });

  const htmlWithMathText = isHtml(normalized)
    ? normalized
    : processDisplayStyleToUnicode(normalized);
  steps.push({
    stepName: '6. Pre-process Display Style Unicode',
    output: htmlWithMathText
  });

  const cleanedHtmlForText = cleanHtmlMathToUnicode(htmlWithMathText);
  steps.push({
    stepName: '7. Clean Html Math to Unicode',
    output: cleanedHtmlForText
  });

  const processedHtmlForText =
    convertEmbeddedLatexToUnicode(cleanedHtmlForText);
  steps.push({
    stepName: '8. Convert Embedded Latex to Unicode',
    output: processedHtmlForText
  });

  const markdown = turndownService.turndown(processedHtmlForText);
  steps.push({ stepName: '9. Generate Markdown (Turndown)', output: markdown });

  // Remove <style>...</style> blocks, <meta> tags, <font> tags, and styling attributes
  // Extract math blocks first to preserve their attributes (class, style, etc.)
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

const convertLatex = (plainText: string): ConvertedOutputs => {
  const normalized = normalizeInput(plainText);
  const textInput = isHtml(normalized)
    ? cleanHtmlMathToUnicode(normalized)
    : normalized;
  const textWithMath = processDisplayStyleToUnicode(textInput);
  const plaintext = latexToText(textWithMath);
  const markdown = plaintext;

  const htmlInput = isHtml(normalized)
    ? cleanHtmlMathToMathML(normalized)
    : normalized;
  const htmlWithMath = processDisplayStyleToMathML(htmlInput);
  const hasLatexDelimiters = /\$|\\\[|\\\]|\\\(|\\\)/.test(htmlWithMath);
  const hasMathML = htmlWithMath.includes('<math');
  const html =
    hasLatexDelimiters || hasMathML
      ? `<p>${convertEmbeddedLatexToMathML(htmlWithMath)}</p>`
      : `<p>${latexToMathML(htmlWithMath, false)}</p>`;

  return { html, markdown, plaintext };
};

const convertMarkdown = (plainText: string): ConvertedOutputs => {
  const normalized = normalizeInput(plainText);
  const textWithMathText = processDisplayStyleToUnicode(normalized);
  const processedMarkdownForText =
    convertEmbeddedLatexToUnicode(textWithMathText);
  const markdown = processedMarkdownForText;

  const textWithMathHtml = processDisplayStyleToMathML(normalized);
  const processedMarkdownForHtml =
    convertEmbeddedLatexToMathML(textWithMathHtml);
  const htmlBody = marked.parse(processedMarkdownForHtml, {
    async: false
  }) as string;
  const html = htmlBody.trim();

  const htmlBodyForText = marked.parse(processedMarkdownForText, {
    async: false
  }) as string;
  const plaintext = htmlBodyForText.replace(/<[^>]*>?/gm, '').trim();

  return { html, markdown, plaintext };
};

export const convert = (
  payload: ClipboardDataPayload,
  format: InputFormat
): ConvertedOutputs => {
  const resolvedFormat = format === 'auto' ? detectFormat(payload) : format;

  if (resolvedFormat === 'html') {
    return convertHtml(payload.htmlText || payload.plainText);
  }
  if (resolvedFormat === 'latex') {
    return convertLatex(payload.plainText);
  }
  return convertMarkdown(payload.plainText);
};
