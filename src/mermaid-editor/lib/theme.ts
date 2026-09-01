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

const ROUNDED_CSS = `
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
`;

const getRoundedConfig = (theme: MermaidTheme): MermaidConfig => ({
  startOnLoad: false,
  theme,
  look: 'classic',
  securityLevel: 'loose',
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  themeCSS: ROUNDED_CSS,
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
