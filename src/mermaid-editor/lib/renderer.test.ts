import { describe, it, expect, vi } from 'vitest';
import { renderMermaid, generateRenderId } from './renderer';
import mermaid from 'mermaid';

describe('renderer', () => {
  it('returns empty svg for blank input', async () => {
    const result = await renderMermaid('   ');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.svg).toBe('');
    }
  });

  it('generates unique render id', () => {
    const id1 = generateRenderId();
    const id2 = generateRenderId();
    expect(id1).toMatch(/^mermaid-diagram-/);
    expect(id1).not.toBe(id2);
  });

  it('handles successful rendering from mermaid', async () => {
    vi.spyOn(mermaid, 'render').mockResolvedValueOnce({
      svg: '<svg><text>Sample Diagram</text></svg>',
      bindFunctions: undefined
    });

    const result = await renderMermaid('graph TD\nA-->B', 'test-id');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.svg).toContain('Sample Diagram');
    }
  });

  it('handles syntax or render errors cleanly', async () => {
    vi.spyOn(mermaid, 'render').mockRejectedValueOnce(
      new Error('Parse error on line 1: syntax error')
    );

    const result = await renderMermaid('invalid code', 'test-id');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Parse error');
    }
  });
});
