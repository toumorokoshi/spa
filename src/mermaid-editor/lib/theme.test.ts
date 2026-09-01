import { describe, it, expect } from 'vitest';
import { MERMAID_THEMES, DEFAULT_THEME, isMermaidTheme } from './theme';

describe('theme', () => {
  it('contains expected themes', () => {
    expect(MERMAID_THEMES.length).toBeGreaterThan(0);
    expect(DEFAULT_THEME).toBe('neutral');
  });

  it('validates theme values correctly', () => {
    expect(isMermaidTheme('neutral')).toBe(true);
    expect(isMermaidTheme('dark')).toBe(true);
    expect(isMermaidTheme('invalid-theme')).toBe(false);
  });
});
