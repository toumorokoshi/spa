export interface RenderedNodeInfo {
  readonly nodeId: string;
  readonly label: string;
  readonly width: number;
}

export interface AutoWrapResult {
  readonly updatedCode: string;
  readonly wrappedCount: number;
}

export const DEFAULT_WRAPPING_WIDTH = 200;
const CHAR_WIDTH_APPROX_PX = 8.5;

interface DelimPair {
  readonly open: string;
  readonly close: string;
}

const DELIMITER_PAIRS: readonly DelimPair[] = [
  { open: '([', close: '])' },
  { open: '[[', close: ']]' },
  { open: '[(', close: ')]' },
  { open: '((', close: '))' },
  { open: '{{', close: '}}' },
  { open: '[/', close: '/]' },
  { open: '[\\', close: '\\]' },
  { open: '[/', close: '\\]' },
  { open: '[\\', close: '/]' },
  { open: '[', close: ']' },
  { open: '(', close: ')' },
  { open: '{', close: '}' },
  { open: '>', close: ']' }
];

const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const parseWrappingWidthFromCode = (code: string): number => {
  const match = code.match(/wrappingWidth['"]?\s*:\s*(\d+)/i);
  if (match && match[1]) {
    const parsed = parseInt(match[1], 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_WRAPPING_WIDTH;
};

const getContext = (): CanvasRenderingContext2D | null => {
  if (typeof document === 'undefined') return null;
  return document.createElement('canvas').getContext('2d');
};

const getCanvasWidth = (text: string, font: string): number => {
  const ctx = getContext();
  if (!ctx) return 0;
  ctx.font = font;
  return ctx.measureText(text).width;
};

export const measureTextWithCanvas = (
  text: string,
  font = '16px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
): number => {
  const measured = getCanvasWidth(text, font);
  if (measured > 0) {
    return measured;
  }
  return text.length * CHAR_WIDTH_APPROX_PX;
};

interface LineAccumulator {
  readonly lines: readonly string[];
  readonly currentLine: string;
}

const appendWordToLines = (
  acc: LineAccumulator,
  word: string,
  maxWidth: number,
  measureFn: (str: string) => number
): LineAccumulator => {
  const candidate = acc.currentLine ? `${acc.currentLine} ${word}` : word;
  const width = measureFn(candidate);
  if (width <= maxWidth || !acc.currentLine) {
    return { lines: acc.lines, currentLine: candidate };
  }
  return {
    lines: [...acc.lines, acc.currentLine],
    currentLine: word
  };
};

const wrapSingleParagraph = (
  para: string,
  maxWidth: number,
  measureFn: (str: string) => number
): string => {
  const trimmed = para.trim();
  if (!trimmed) return '';
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';

  const initial: LineAccumulator = { lines: [], currentLine: '' };
  const result = words.reduce(
    (acc, word) => appendWordToLines(acc, word, maxWidth, measureFn),
    initial
  );
  const allLines = result.currentLine
    ? [...result.lines, result.currentLine]
    : result.lines;
  return allLines.join('\n');
};

export const splitTextToLines = (
  text: string,
  maxPixelWidth: number,
  measureFn: (str: string) => number = measureTextWithCanvas
): string => {
  const cleanText = text.replace(/\\n/g, '\n').replace(/<br\s*\/?>/gi, '\n');
  const paragraphs = cleanText.split('\n');
  return paragraphs
    .map((para) => wrapSingleParagraph(para, maxPixelWidth, measureFn))
    .join('\n');
};

export const replaceNodeLabelInCode = (
  code: string,
  nodeId: string,
  newLabelWithNewlines: string
): string => {
  const normalizedNewlines = newLabelWithNewlines.replace(/\\n/g, '\n');
  const escapedContent = normalizedNewlines
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, '\\n');

  const replacement = `"${escapedContent}"`;

  for (const { open, close } of DELIMITER_PAIRS) {
    const openEsc = escapeRegex(open);
    const closeEsc = escapeRegex(close);
    const idEsc = escapeRegex(nodeId);

    const pattern = new RegExp(
      `((?:^|[^\\w-]|^\\s*)${idEsc}\\s*${openEsc}\\s*)(?:"""|"|"\`?)?([\\s\\S]*?)(?:(?:\`?"|"""|")\\s*)?(\\s*${closeEsc})`
    );

    if (pattern.test(code)) {
      return code.replace(pattern, (_match, prefix, _oldContent, suffix) => {
        return `${prefix}${replacement}${suffix}`;
      });
    }
  }

  return code;
};

const extractNodeId = (el: Element): string => {
  const idAttr = el.getAttribute('id') || '';
  const match = idAttr.match(/flowchart-(.+?)-\d+$/);
  if (match?.[1]) {
    return match[1];
  }
  return el.getAttribute('data-id') || idAttr;
};

const getSvgBBoxWidth = (el: Element): number => {
  if (el instanceof SVGGraphicsElement && typeof el.getBBox === 'function') {
    try {
      return el.getBBox().width;
    } catch {
      return 0;
    }
  }
  return 0;
};

const getElementWidth = (el: Element): number => {
  const bboxWidth = getSvgBBoxWidth(el);
  if (bboxWidth > 0) {
    return bboxWidth;
  }
  if (typeof el.getBoundingClientRect === 'function') {
    return el.getBoundingClientRect().width;
  }
  return 0;
};

const extractNodeInfo = (el: Element): RenderedNodeInfo | null => {
  const nodeId = extractNodeId(el);
  if (!nodeId) return null;
  const textEl = el.querySelector(
    '.nodeLabel, .label, foreignObject div, text'
  );
  const label = textEl?.textContent?.trim() ?? '';
  return {
    nodeId,
    label,
    width: getElementWidth(el)
  };
};

export const extractRenderedNodes = (
  svgElement: Element
): readonly RenderedNodeInfo[] => {
  const nodeElements = Array.from(svgElement.querySelectorAll('.node'));
  return nodeElements
    .map(extractNodeInfo)
    .filter((node): node is RenderedNodeInfo => node !== null);
};

export interface AutoWrapOptions {
  readonly maxPixelWidth?: number;
}

const wrapSingleNode = (
  acc: AutoWrapResult,
  node: RenderedNodeInfo,
  targetWidth: number
): AutoWrapResult => {
  if (!node.label || node.width <= targetWidth) {
    return acc;
  }
  const wrappedText = splitTextToLines(node.label, targetWidth);
  if (!wrappedText.includes('\n')) {
    return acc;
  }
  const nextCode = replaceNodeLabelInCode(
    acc.updatedCode,
    node.nodeId,
    wrappedText
  );
  if (nextCode === acc.updatedCode) {
    return acc;
  }
  return {
    updatedCode: nextCode,
    wrappedCount: acc.wrappedCount + 1
  };
};

export const autoWrapDiagramFromSvg = (
  code: string,
  svgElement: Element | null,
  options?: AutoWrapOptions
): AutoWrapResult => {
  if (!code.trim() || !svgElement) {
    return { updatedCode: code, wrappedCount: 0 };
  }

  const targetWidth =
    options?.maxPixelWidth ?? parseWrappingWidthFromCode(code);
  const nodes = extractRenderedNodes(svgElement);
  const initial: AutoWrapResult = { updatedCode: code, wrappedCount: 0 };

  return nodes.reduce(
    (acc, node) => wrapSingleNode(acc, node, targetWidth),
    initial
  );
};
