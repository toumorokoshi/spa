import TurndownService from 'turndown';
import { marked } from 'marked';
import { latexToText } from './latex';

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

const turndownService = new TurndownService({ headingStyle: 'atx' });

const detectFormat = (payload: ClipboardDataPayload): InputFormat => {
  if (payload.htmlText) {
    return 'html';
  }
  if (/\\(alpha|beta|frac|sum|int|begin{|sqrt|times)/.test(payload.plainText)) {
    return 'latex';
  }
  return 'markdown';
};

const convertHtml = (html: string): ConvertedOutputs => {
  const markdown = turndownService.turndown(html);
  const plaintext = html.replace(/<[^>]*>?/gm, '').trim();
  return { html, markdown, plaintext };
};

const convertLatex = (plainText: string): ConvertedOutputs => {
  const plaintext = latexToText(plainText);
  const markdown = plaintext;
  const html = `<p>${plaintext}</p>`;
  return { html, markdown, plaintext };
};

const convertMarkdown = (plainText: string): ConvertedOutputs => {
  const markdown = plainText;
  const htmlBody = marked.parse(markdown, { async: false }) as string;
  const html = htmlBody.trim();
  const plaintext = html.replace(/<[^>]*>?/gm, '').trim();
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
