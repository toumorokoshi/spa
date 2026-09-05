import type { MermaidConfig } from 'mermaid';

export type MermaidTheme = 'neutral' | 'default' | 'dark' | 'forest' | 'base';
export type DiagramLook = 'rounded' | 'handDrawn' | 'classic';

export interface ThemeOption {
  readonly id: MermaidTheme;
  readonly label: string;
}

export interface LookOption {
  readonly id: DiagramLook;
  readonly label: string;
}

export const MERMAID_THEMES: readonly ThemeOption[] = [
  { id: 'neutral', label: 'Neutral' },
  { id: 'default', label: 'Default' },
  { id: 'dark', label: 'Dark' },
  { id: 'forest', label: 'Forest' },
  { id: 'base', label: 'Base' }
];

export const LOOK_OPTIONS: readonly LookOption[] = [
  { id: 'rounded', label: 'Modern (Rounded)' },
  { id: 'handDrawn', label: 'Hand-Drawn (Sketch)' },
  { id: 'classic', label: 'Classic' }
];

export const DEFAULT_THEME: MermaidTheme = 'neutral';
export const DEFAULT_LOOK: DiagramLook = 'rounded';

export const isMermaidTheme = (value: string): value is MermaidTheme => {
  return MERMAID_THEMES.some((theme) => theme.id === value);
};

export const isDiagramLook = (value: string): value is DiagramLook => {
  return LOOK_OPTIONS.some((look) => look.id === value);
};

const getDarkEdgeLabelCss = (): string => `
  .edgeLabel,
  .edgeLabel .label,
  .edgeLabel foreignObject,
  .edgeLabel div,
  .edgeLabel p,
  .labelBkg {
    background-color: transparent !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .edgeLabel:empty,
  .edgeLabel:not(:has(span:not(:empty))),
  .edgeLabel span:empty,
  .edgeLabel span.edgeLabel:empty {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    width: 0 !important;
    height: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
  }
  .edgeLabel span.edgeLabel:not(:empty),
  .edgeLabel span:not(:empty) {
    background-color: #1e293b !important;
    color: #f8fafc !important;
    border: 1px solid #475569 !important;
    border-radius: 9999px !important;
    padding: 3px 10px !important;
    font-size: 0.8rem !important;
    font-weight: 500 !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
    display: inline-block !important;
    line-height: 1.2 !important;
  }
  .edgeLabel rect[width]:not([width="0"]) {
    rx: 6px !important;
    ry: 6px !important;
    fill: #1e293b !important;
    stroke: #475569 !important;
    stroke-width: 1px !important;
  }
  .edgeLabel rect:not([width]),
  .edgeLabel rect[width="0"] {
    display: none !important;
  }
`;

const getLightEdgeLabelCss = (): string => `
  .edgeLabel,
  .edgeLabel .label,
  .edgeLabel foreignObject,
  .edgeLabel div,
  .edgeLabel p,
  .labelBkg {
    background-color: transparent !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .edgeLabel:empty,
  .edgeLabel:not(:has(span:not(:empty))),
  .edgeLabel span:empty,
  .edgeLabel span.edgeLabel:empty {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    width: 0 !important;
    height: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
  }
  .edgeLabel span.edgeLabel:not(:empty),
  .edgeLabel span:not(:empty) {
    background-color: #ffffff !important;
    color: #1e293b !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 9999px !important;
    padding: 3px 10px !important;
    font-size: 0.8rem !important;
    font-weight: 500 !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06) !important;
    display: inline-block !important;
    line-height: 1.2 !important;
  }
  .edgeLabel rect[width]:not([width="0"]) {
    rx: 6px !important;
    ry: 6px !important;
    fill: #ffffff !important;
    stroke: #cbd5e1 !important;
    stroke-width: 1px !important;
  }
  .edgeLabel rect:not([width]),
  .edgeLabel rect[width="0"] {
    display: none !important;
  }
`;

const getEdgeLabelCss = (theme: MermaidTheme): string => {
  if (theme === 'dark') {
    return getDarkEdgeLabelCss();
  }
  return getLightEdgeLabelCss();
};

const getRoundedThemeCss = (theme: MermaidTheme): string => `
  .node rect, .node circle, .node ellipse, .node polygon {
    rx: 8px !important;
    ry: 8px !important;
    stroke-width: 2px !important;
  }
  .edgePath .path {
    stroke-width: 2px !important;
  }
  .cluster rect {
    rx: 10px !important;
    ry: 10px !important;
    stroke-width: 1.5px !important;
  }
  ${getEdgeLabelCss(theme)}
`;

const getRoundedConfig = (theme: MermaidTheme): MermaidConfig => ({
  startOnLoad: false,
  theme,
  look: 'classic',
  securityLevel: 'loose',
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  themeVariables: {
    edgeLabelBackground: 'transparent'
  },
  themeCSS: getRoundedThemeCss(theme),
  flowchart: {
    curve: 'basis',
    htmlLabels: true
  }
});

const getHandDrawnConfig = (theme: MermaidTheme): MermaidConfig => ({
  startOnLoad: false,
  theme,
  look: 'handDrawn',
  securityLevel: 'loose',
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  themeVariables: {
    edgeLabelBackground: 'transparent'
  },
  themeCSS: getEdgeLabelCss(theme),
  flowchart: {
    curve: 'basis',
    htmlLabels: true
  }
});

const getClassicConfig = (theme: MermaidTheme): MermaidConfig => ({
  startOnLoad: false,
  theme,
  look: 'classic',
  securityLevel: 'loose',
  themeVariables: {
    edgeLabelBackground: 'transparent'
  },
  themeCSS: getEdgeLabelCss(theme),
  flowchart: {
    curve: 'linear',
    htmlLabels: true
  }
});

export const getMermaidConfig = (
  theme: MermaidTheme,
  look: DiagramLook
): MermaidConfig => {
  if (look === 'handDrawn') {
    return getHandDrawnConfig(theme);
  }
  if (look === 'classic') {
    return getClassicConfig(theme);
  }
  return getRoundedConfig(theme);
};
