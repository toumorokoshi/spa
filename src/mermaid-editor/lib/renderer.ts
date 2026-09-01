import mermaid from 'mermaid';
import {
  MermaidTheme,
  DiagramLook,
  DEFAULT_THEME,
  DEFAULT_LOOK,
  getMermaidConfig
} from './theme';

export type RenderResult =
  | { readonly ok: true; readonly svg: string }
  | { readonly ok: false; readonly error: string };

export interface RenderOptions {
  readonly theme?: MermaidTheme;
  readonly look?: DiagramLook;
  readonly id?: string;
}

interface ResolvedRenderOptions {
  readonly theme: MermaidTheme;
  readonly look: DiagramLook;
  readonly id: string;
}

const RADIX_BASE_36 = 36;
const SUBSTRING_START_INDEX = 2;
const SUBSTRING_END_INDEX = 9;

mermaid.initialize(getMermaidConfig(DEFAULT_THEME, DEFAULT_LOOK));

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

const resolveRenderOptions = (
  options?: RenderOptions
): ResolvedRenderOptions => {
  if (!options) {
    return {
      theme: DEFAULT_THEME,
      look: DEFAULT_LOOK,
      id: generateRenderId()
    };
  }
  return {
    theme: options.theme ? options.theme : DEFAULT_THEME,
    look: options.look ? options.look : DEFAULT_LOOK,
    id: options.id ? options.id : generateRenderId()
  };
};

export const renderMermaid = async (
  code: string,
  options?: RenderOptions
): Promise<RenderResult> => {
  const trimmed = code.trim();
  if (!trimmed) {
    return { ok: true, svg: '' };
  }

  const { theme, look, id } = resolveRenderOptions(options);

  try {
    mermaid.initialize(getMermaidConfig(theme, look));
    const { svg } = await mermaid.render(id, trimmed);
    cleanDanglingMermaidElements(id);
    return { ok: true, svg };
  } catch (err) {
    cleanDanglingMermaidElements(id);
    return { ok: false, error: extractErrorMessage(err) };
  }
};
