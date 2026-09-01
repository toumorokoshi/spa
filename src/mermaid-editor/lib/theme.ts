export type MermaidTheme = 'neutral' | 'default' | 'dark' | 'forest' | 'base';

export interface ThemeOption {
  readonly id: MermaidTheme;
  readonly label: string;
}

export const MERMAID_THEMES: readonly ThemeOption[] = [
  { id: 'neutral', label: 'Neutral' },
  { id: 'default', label: 'Default' },
  { id: 'dark', label: 'Dark' },
  { id: 'forest', label: 'Forest' },
  { id: 'base', label: 'Base' }
];

export const DEFAULT_THEME: MermaidTheme = 'neutral';

export const isMermaidTheme = (value: string): value is MermaidTheme => {
  return MERMAID_THEMES.some((theme) => theme.id === value);
};
