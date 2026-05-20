import TurndownService from 'turndown';
import { marked } from 'marked';
import { latexToText, convertEmbeddedLatex } from './latex';

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

const LATEX_INDICATORS = [
  'alpha',
  'beta',
  'gamma',
  'delta',
  'epsilon',
  'zeta',
  'eta',
  'theta',
  'iota',
  'kappa',
  'lambda',
  'mu',
  'nu',
  'xi',
  'pi',
  'rho',
  'sigma',
  'tau',
  'upsilon',
  'phi',
  'chi',
  'psi',
  'omega',
  'Gamma',
  'Delta',
  'Theta',
  'Lambda',
  'Xi',
  'Pi',
  'Sigma',
  'Upsilon',
  'Phi',
  'Psi',
  'Omega',
  'times',
  'div',
  'pm',
  'mp',
  'cdot',
  'infty',
  'approx',
  'neq',
  'leq',
  'geq',
  'equiv',
  'sim',
  'propto',
  'forall',
  'exists',
  'in',
  'notin',
  'subset',
  'supset',
  'cup',
  'cap',
  'Rightarrow',
  'Leftarrow',
  'Leftrightarrow',
  'rightarrow',
  'leftarrow',
  'leftrightarrow',
  'uparrow',
  'downarrow',
  'partial',
  'nabla',
  'int',
  'sum',
  'prod',
  'sqrt',
  'angle',
  'circ',
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
  'setminus'
];

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

const convertHtml = (html: string): ConvertedOutputs => {
  const processedHtml = convertEmbeddedLatex(html);
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
  return plainText.replace(/\{\\displaystyle\s*[^}]+\}/g, '');
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
