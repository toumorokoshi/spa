import TurndownService from 'turndown';
import { marked } from 'marked';
import { latexToText, convertEmbeddedLatex, getLatexCommands } from './latex';

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
  'textbf',
  'textit',
  'text',
  'mathrm',
  'mathbf',
  'mathit',
  'begin',
  'end',
  'mathbb',
  'mathcal'
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

const removeDisplayStyle = (text: string): string => {
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
    return removeDisplayStyle(before + after);
  }

  const before = text.slice(0, startIdx + matchLength);
  const after = text.slice(startIdx + matchLength);
  return before + removeDisplayStyle(after);
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
  // remove displayStyle, which shows up from wikipedia
  return removeDisplayStyle(plainText);
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
