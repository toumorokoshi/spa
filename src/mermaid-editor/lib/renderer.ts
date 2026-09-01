import mermaid from 'mermaid';
import { MermaidTheme, DEFAULT_THEME } from './theme';

export type RenderResult =
  | { readonly ok: true; readonly svg: string }
  | { readonly ok: false; readonly error: string };

const RADIX_BASE_36 = 36;
const SUBSTRING_START_INDEX = 2;
const SUBSTRING_END_INDEX = 9;

mermaid.initialize({
  startOnLoad: false,
  theme: DEFAULT_THEME,
  securityLevel: 'loose'
});

export const generateRenderId = (): string => {
  const randomSuffix = Math.random()
    .toString(RADIX_BASE_36)
    .substring(SUBSTRING_START_INDEX, SUBSTRING_END_INDEX);
  return `mermaid-diagram-${Date.now()}-${randomSuffix}`;
};

const cleanDanglingMermaidElements = (id: string): void => {
  const errorElement = document.getElementById(`d${id}`);
  if (errorElement) {
    errorElement.remove();
  }
};

const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

export const renderMermaid = async (
  code: string,
  theme: MermaidTheme = DEFAULT_THEME,
  id: string = generateRenderId()
): Promise<RenderResult> => {
  const trimmed = code.trim();
  if (!trimmed) {
    return { ok: true, svg: '' };
  }

  try {
    mermaid.initialize({
      startOnLoad: false,
      theme,
      securityLevel: 'loose'
    });
    const { svg } = await mermaid.render(id, trimmed);
    cleanDanglingMermaidElements(id);
    return { ok: true, svg };
  } catch (err) {
    cleanDanglingMermaidElements(id);
    return { ok: false, error: extractErrorMessage(err) };
  }
};
