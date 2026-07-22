/* eslint-disable complexity, functional/no-let, no-magic-numbers, max-lines-per-function */
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

  const hasLatexDelimiters = /\$\$|\\\[|\\\]|\\\(|\\\)/.test(payload.plainText);
  const commandsPattern = new RegExp(
    `\\\\(${LATEX_INDICATORS.join('|')})(?![a-zA-Z])`
  );
  const hasLatexCommands = commandsPattern.test(payload.plainText);

  if (hasLatexDelimiters) {
    return {
      format: 'latex',
      explanation:
        'Detected LaTeX math delimiters ($$, \\[, \\], \\(, or \\)) in plainText.'
    };
  }

  if (hasLatexCommands) {
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

const processBlockReplacement = (
  before: string,
  mathExpr: string,
  isUnicode: boolean
): { beforeClean: string; blockOutput: string } => {
  const converted = isUnicode
    ? latexToText(mathExpr)
    : latexToMathML(mathExpr, true);

  const fallback = findFallbackSuffix(before, converted);
  let beforeClean = before;
  if (fallback) {
    beforeClean = before.slice(0, before.length - fallback.length);
  }

  return {
    beforeClean,
    blockOutput: converted
  };
};

const processDisplayStyleMath = (html: string, isUnicode: boolean): string => {
  const displayPattern = /(\$\$|\\\[)([\s\S]*?)(\$\$|\\\])/g;

  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = displayPattern.exec(html)) !== null) {
    const matchIndex = match.index;
    const before = html.slice(lastIndex, matchIndex);
    const mathExpr = match[2];

    const { beforeClean, blockOutput } = processBlockReplacement(
      before,
      mathExpr,
      isUnicode
    );

    result += beforeClean + blockOutput;
    lastIndex = match.index + match[0].length;
  }

  result += html.slice(lastIndex);
  return result;
};

export const processDisplayStyleToUnicode = (html: string): string =>
  processDisplayStyleMath(html, true);

export const processDisplayStyleToMathML = (html: string): string =>
  processDisplayStyleMath(html, false);

export const decodeHtmlEntities = (str: string): string => {
  return (
    str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      // eslint-disable-next-line quotes
      .replace(/&(?:#39|#x27|apos);/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&bsol;/g, '\\')
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      )
  );
};

const extractLatexFromMathHtml = (mathHtml: string): string | null => {
  const annotationMatch =
    /<annotation[^>]*encoding=["'](?:application\/x-tex|TeX)["'][^>]*>([\s\S]*?)<\/annotation>/i.exec(
      mathHtml
    );
  if (annotationMatch) return decodeHtmlEntities(annotationMatch[1].trim());

  const dataMathMatch =
    /data-(?:math|latex|tex)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(mathHtml);
  if (dataMathMatch) {
    const val = dataMathMatch[1] ?? dataMathMatch[2] ?? dataMathMatch[3] ?? '';
    return decodeHtmlEntities(val.trim());
  }

  const altMatch = /alt=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(mathHtml);
  if (altMatch) {
    const val = altMatch[1] ?? altMatch[2] ?? altMatch[3] ?? '';
    return decodeHtmlEntities(val.trim());
  }

  const delimitedMatch = /(\$\$|\\\[|\\\()([\s\S]*?)(\$\$|\\\]|\\\))/i.exec(
    mathHtml
  );
  if (delimitedMatch) {
    return decodeHtmlEntities(delimitedMatch[2].trim());
  }

  return null;
};

const findMatchingClosingTag = (
  html: string,
  startIndex: number,
  tagName: string
): number => {
  const openTagRegex = new RegExp(
    `<${tagName}(?:\\s+(?:[^\\s>="']+(?:=(?:"[^"]*"|'[^']*'|[^\\s>]+))?))*\\s*>`,
    'gi'
  );
  const closeTagRegex = new RegExp(`</${tagName}>`, 'gi');

  let depth = 1;
  let currIndex = startIndex;

  while (depth > 0 && currIndex < html.length) {
    openTagRegex.lastIndex = currIndex;
    closeTagRegex.lastIndex = currIndex;

    const nextOpen = openTagRegex.exec(html);
    const nextClose = closeTagRegex.exec(html);

    if (!nextClose) return -1;

    if (nextOpen && nextOpen.index < nextClose.index) {
      depth++;
      currIndex = nextOpen.index + nextOpen[0].length;
    } else {
      depth--;
      if (depth === 0) return nextClose.index + nextClose[0].length;
      currIndex = nextClose.index + nextClose[0].length;
    }
  }

  return -1;
};

const isMathContainerOpenTag = (openTag: string): boolean => {
  return (
    /<math\b/i.test(openTag) ||
    /data-(?:math|latex|tex)=/i.test(openTag) ||
    /class=["'][^"']*?\b(?:math-block|math-inline|katex|mwe-math-element)\b[^"']*?["']/i.test(
      openTag
    )
  );
};

const replaceHtmlContainers = (
  html: string,
  convertMathFn: (latex: string, isDisplay: boolean) => string
): string => {
  const containerPattern =
    /<(div|span|math|mwe-math-element)(?:\s+(?:[^\s>="']+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?))*\s*>/gi;

  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = containerPattern.exec(html)) !== null) {
    const openTag = match[0];
    if (!isMathContainerOpenTag(openTag)) continue;

    const tagName = match[1];
    const startIndex = match.index;
    const openTagLength = match[0].length;

    const endIndex = findMatchingClosingTag(
      html,
      startIndex + openTagLength,
      tagName
    );

    if (endIndex === -1) continue;

    const fullContainerHtml = html.slice(startIndex, endIndex);
    const latex = extractLatexFromMathHtml(fullContainerHtml);

    if (latex) {
      const isDisplay =
        tagName.toLowerCase() === 'div' ||
        /math-block/i.test(openTag) ||
        /\$\$|\\\[/.test(fullContainerHtml);

      result += html.slice(lastIndex, startIndex);
      result += convertMathFn(latex, isDisplay);
      lastIndex = endIndex;
      containerPattern.lastIndex = endIndex;
    }
  }

  result += html.slice(lastIndex);
  return result;
};

export const cleanHtmlMathToMathML = (html: string): string => {
  return replaceHtmlContainers(html, (latex, isDisplay) =>
    latexToMathML(latex, isDisplay)
  );
};

export const cleanHtmlMathToUnicode = (html: string): string => {
  return replaceHtmlContainers(html, (latex) => latexToText(latex));
};

export const convertHtml = (rawInput: string): ConvertedOutputs => {
  const steps: Array<{ stepName: string; output: string }> = [];

  steps.push({ stepName: '1. Raw Input', output: rawInput });

  const normalized = normalizeInput(rawInput);
  steps.push({ stepName: '2. Normalize Input', output: normalized });

  const htmlWithMath = isHtml(normalized)
    ? normalized
    : processDisplayStyleToMathML(normalized);
  steps.push({
    stepName: '3. Pre-process Display Style MathML',
    output: htmlWithMath
  });

  const cleanedHtmlForHtml = cleanHtmlMathToMathML(htmlWithMath);
  steps.push({
    stepName: '4. Clean Html Math Containers to MathML',
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
    stepName: '7. Clean Html Math Containers to Unicode',
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
