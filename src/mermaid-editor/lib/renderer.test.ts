import { describe, it, expect, vi } from 'vitest';
import { renderMermaid, generateRenderId, cleanRenderedSvg } from './renderer';
import mermaid from 'mermaid';

describe('generateRenderId', () => {
  it('generates unique render id', () => {
    const id1 = generateRenderId();
    const id2 = generateRenderId();
    expect(id1).toMatch(/^mermaid-diagram-/);
    expect(id1).not.toBe(id2);
  });
});

describe('renderMermaid', () => {
  it('returns empty svg for blank input', async () => {
    const result = await renderMermaid('   ');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.svg).toBe('');
    }
  });

  it('handles successful rendering with chosen theme and look', async () => {
    const initSpy = vi.spyOn(mermaid, 'initialize');
    vi.spyOn(mermaid, 'render').mockResolvedValueOnce({
      svg: '<svg><text>Sample Diagram</text></svg>',
      bindFunctions: undefined
    });

    const result = await renderMermaid('graph TD\nA-->B', {
      theme: 'forest',
      look: 'handDrawn',
      id: 'test-id'
    });
    expect(result.ok).toBe(true);
    expect(initSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'forest',
        look: 'handDrawn'
      })
    );
    if (result.ok) {
      expect(result.svg).toContain('Sample Diagram');
    }
  });

  it('automatically cleans empty edge labels from rendered svg', async () => {
    vi.spyOn(mermaid, 'render').mockResolvedValueOnce({
      svg: '<svg><g class="edgeLabels"><g class="edgeLabel"><foreignObject width="0" height="0"><div class="labelBkg"><span class="edgeLabel "></span></div></foreignObject></g><g class="edgeLabel"><foreignObject width="20" height="20"><div class="labelBkg"><span class="edgeLabel "><p>Active</p></span></div></foreignObject></g></g></svg>',
      bindFunctions: undefined
    });

    const result = await renderMermaid('graph TD\nA-->B', {
      theme: 'neutral',
      look: 'rounded',
      id: 'test-clean-id'
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.svg).toContain('Active');
      expect(result.svg).not.toContain('width="0"');
    }
  });

  it('handles syntax or render errors cleanly', async () => {
    vi.spyOn(mermaid, 'render').mockRejectedValueOnce(
      new Error('Parse error on line 1: syntax error')
    );

    const result = await renderMermaid('invalid code', {
      theme: 'neutral',
      look: 'rounded',
      id: 'test-id'
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Parse error');
    }
  });
});

describe('cleanRenderedSvg', () => {
  it('removes empty edgeLabel elements while preserving labels with text', () => {
    const inputSvg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <g class="edgeLabels">
          <g class="edgeLabel">
            <g class="label" transform="translate(0, 0)">
              <foreignObject width="0" height="0">
                <div class="labelBkg"><span class="edgeLabel "></span></div>
              </foreignObject>
            </g>
          </g>
          <g class="edgeLabel" transform="translate(50, 50)">
            <g class="label">
              <foreignObject width="30" height="20">
                <div class="labelBkg"><span class="edgeLabel "><p>Yes</p></span></div>
              </foreignObject>
            </g>
          </g>
          <g class="edgeLabel">
            <g class="label" transform="translate(0, 0)">
              <foreignObject width="0" height="0">
                <div class="labelBkg"><span class="edgeLabel ">   </span></div>
              </foreignObject>
            </g>
          </g>
        </g>
      </svg>
    `.trim();

    const cleaned = cleanRenderedSvg(inputSvg);
    expect(cleaned).toContain('Yes');
    expect(cleaned).not.toContain('width="0"');
  });

  it('returns raw svg if input is unchanged or has no edge labels', () => {
    const inputSvg = '<svg><g class="nodes"><text>A</text></g></svg>';
    const cleaned = cleanRenderedSvg(inputSvg);
    expect(cleaned).toContain('<text>A</text>');
  });
});
