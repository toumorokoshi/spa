import { describe, it, expect } from 'vitest';
import {
  MERMAID_THEMES,
  LOOK_OPTIONS,
  DEFAULT_THEME,
  DEFAULT_LOOK,
  isMermaidTheme,
  isDiagramLook,
  getMermaidConfig
} from './theme';

describe('theme and look definitions', () => {
  it('contains expected themes and looks', () => {
    expect(MERMAID_THEMES.length).toBeGreaterThan(0);
    expect(LOOK_OPTIONS.length).toBeGreaterThan(0);
    expect(DEFAULT_THEME).toBe('neutral');
    expect(DEFAULT_LOOK).toBe('rounded');
  });

  it('validates theme and look values correctly', () => {
    expect(isMermaidTheme('neutral')).toBe(true);
    expect(isMermaidTheme('dark')).toBe(true);
    expect(isMermaidTheme('invalid-theme')).toBe(false);

    expect(isDiagramLook('rounded')).toBe(true);
    expect(isDiagramLook('handDrawn')).toBe(true);
    expect(isDiagramLook('classic')).toBe(true);
    expect(isDiagramLook('invalid-look')).toBe(false);
  });
});

describe('MermaidConfig builder', () => {
  it('builds rounded look configuration with transparent edge background', () => {
    const roundedCfg = getMermaidConfig('neutral', 'rounded');
    expect(roundedCfg.theme).toBe('neutral');
    expect(roundedCfg.themeVariables?.edgeLabelBackground).toBe('transparent');
    expect(roundedCfg.themeCSS).toContain('rx: 8px');
    expect(roundedCfg.themeCSS).toContain('.edgeLabel');
    expect(roundedCfg.themeCSS).toContain('border-radius: 9999px');
    expect(roundedCfg.flowchart?.curve).toBe('basis');
  });

  it('builds handDrawn and classic look configurations', () => {
    const handDrawnCfg = getMermaidConfig('dark', 'handDrawn');
    expect(handDrawnCfg.look).toBe('handDrawn');
    expect(handDrawnCfg.theme).toBe('dark');
    expect(handDrawnCfg.themeCSS).toContain('#1e293b');

    const classicCfg = getMermaidConfig('default', 'classic');
    expect(classicCfg.look).toBe('classic');
    expect(classicCfg.themeVariables?.edgeLabelBackground).toBe('transparent');
    expect(classicCfg.flowchart?.curve).toBe('linear');
  });

  it('hides empty edge label containers and styles only non-empty labels in light theme', () => {
    const lightCfg = getMermaidConfig('neutral', 'rounded');
    expect(lightCfg.themeCSS).toContain('.edgeLabel span:empty');
    expect(lightCfg.themeCSS).toContain('display: none !important');
    expect(lightCfg.themeCSS).toContain('.edgeLabel span:not(:empty)');
    expect(lightCfg.themeCSS).toContain('.labelBkg');
  });

  it('hides empty edge label containers and styles only non-empty labels in dark theme', () => {
    const darkCfg = getMermaidConfig('dark', 'rounded');
    expect(darkCfg.themeCSS).toContain('.edgeLabel span:empty');
    expect(darkCfg.themeCSS).toContain('display: none !important');
    expect(darkCfg.themeCSS).toContain('.edgeLabel span:not(:empty)');
    expect(darkCfg.themeCSS).toContain('#1e293b');
    expect(darkCfg.themeCSS).toContain('.labelBkg');
  });
});
