import { describe, it, expect } from 'vitest';
import {
  parseWrappingWidthFromCode,
  splitTextToLines,
  replaceNodeLabelInCode,
  extractRenderedNodes,
  autoWrapDiagramFromSvg,
  DEFAULT_WRAPPING_WIDTH
} from './auto-wrap';

describe('parseWrappingWidthFromCode', () => {
  it('returns default width when no wrappingWidth config is present', () => {
    const code = 'graph TD\nA-->B';
    expect(parseWrappingWidthFromCode(code)).toBe(DEFAULT_WRAPPING_WIDTH);
  });

  it('parses wrappingWidth from YAML front matter', () => {
    const code = `---
config:
  flowchart:
    wrappingWidth: 350
---
graph TD
A-->B`;
    expect(parseWrappingWidthFromCode(code)).toBe(350);
  });

  it('handles inline directives', () => {
    const code = `%%{init: {"flowchart": {"wrappingWidth": 280}}}%%
graph TD
A-->B`;
    expect(parseWrappingWidthFromCode(code)).toBe(280);
  });
});

describe('splitTextToLines', () => {
  it('keeps short text on a single line', () => {
    const text = 'Short label';
    const result = splitTextToLines(text, 200, (s) => s.length * 8);
    expect(result).toBe('Short label');
  });

  it('wraps long text at word boundaries', () => {
    const text = 'This is an extraordinarily long sentence that needs wrapping';
    // With width 100 and char width 8 => max chars approx 12 per line
    const result = splitTextToLines(text, 100, (s) => s.length * 8);
    expect(result).toContain('\n');
    const lines = result.split('\n');
    expect(lines.length).toBeGreaterThan(2);
    expect(lines.join(' ')).toBe(text);
  });

  it('handles existing newlines and br tags', () => {
    const text = 'Line 1\\nLine 2<br/>Line 3';
    const result = splitTextToLines(text, 300, (s) => s.length * 8);
    expect(result).toBe('Line 1\nLine 2\nLine 3');
  });
});

describe('replaceNodeLabelInCode - standard shapes', () => {
  it('replaces square bracket node labels', () => {
    const code = 'graph TD\n  A[Very long label here] --> B';
    const updated = replaceNodeLabelInCode(code, 'A', 'Very long\\nlabel here');
    expect(updated).toBe('graph TD\n  A["Very long\\nlabel here"] --> B');
  });

  it('replaces rounded parenthesis node labels', () => {
    const code = 'graph TD\n  step1(Rounded long label) --> B';
    const updated = replaceNodeLabelInCode(
      code,
      'step1',
      'Rounded\\nlong label'
    );
    expect(updated).toBe('graph TD\n  step1("Rounded\\nlong label") --> B');
  });

  it('replaces diamond/curly brace node labels', () => {
    const code = 'graph TD\n  decision{Decision label with long text} --> B';
    const updated = replaceNodeLabelInCode(
      code,
      'decision',
      'Decision label\\nwith long text'
    );
    expect(updated).toBe(
      'graph TD\n  decision{"Decision label\\nwith long text"} --> B'
    );
  });

  it('replaces stadium node labels', () => {
    const code = 'graph TD\n  A([Stadium node label]) --> B';
    const updated = replaceNodeLabelInCode(code, 'A', 'Stadium\\nnode label');
    expect(updated).toBe('graph TD\n  A(["Stadium\\nnode label"]) --> B');
  });
});

describe('replaceNodeLabelInCode - containers, quotes, and references', () => {
  it('replaces cylinder node labels', () => {
    const code = 'graph TD\n  DB[(Database storage label)] --> B';
    const updated = replaceNodeLabelInCode(
      code,
      'DB',
      'Database\\nstorage label'
    );
    expect(updated).toBe('graph TD\n  DB[("Database\\nstorage label")] --> B');
  });

  it('replaces subroutine node labels', () => {
    const code = 'graph TD\n  Sub[[Subroutine process]] --> B';
    const updated = replaceNodeLabelInCode(code, 'Sub', 'Subroutine\\nprocess');
    expect(updated).toBe('graph TD\n  Sub[["Subroutine\\nprocess"]] --> B');
  });

  it('replaces already quoted node labels', () => {
    const code = 'graph TD\n  A["Existing quoted label"] --> B';
    const updated = replaceNodeLabelInCode(
      code,
      'A',
      'Existing\\nquoted label'
    );
    expect(updated).toBe('graph TD\n  A["Existing\\nquoted label"] --> B');
  });

  it('does not touch downstream references without delimiters', () => {
    const code = 'graph TD\n  A[Long label] --> B\n  B --> A';
    const updated = replaceNodeLabelInCode(code, 'A', 'Long\\nlabel');
    expect(updated).toBe('graph TD\n  A["Long\\nlabel"] --> B\n  B --> A');
  });
});

describe('autoWrapDiagramFromSvg', () => {
  it('returns original code when svgElement is null or code is empty', () => {
    expect(autoWrapDiagramFromSvg('', null)).toEqual({
      updatedCode: '',
      wrappedCount: 0
    });
    expect(autoWrapDiagramFromSvg('graph TD\nA-->B', null)).toEqual({
      updatedCode: 'graph TD\nA-->B',
      wrappedCount: 0
    });
  });

  it('traverses mock SVG elements and wraps nodes that exceed target width', () => {
    const container = document.createElement('div');
    container.innerHTML = `
        <svg id="mermaid-test">
          <g class="node default" id="flowchart-A-0">
            <rect width="350" height="40"></rect>
            <g class="label">
              <foreignObject width="350" height="20">
                <div class="nodeLabel">This is an extraordinarily long sentence inside node A</div>
              </foreignObject>
            </g>
          </g>
          <g class="node default" id="flowchart-B-1">
            <rect width="60" height="40"></rect>
            <g class="label">
              <foreignObject width="60" height="20">
                <div class="nodeLabel">Short</div>
              </foreignObject>
            </g>
          </g>
        </svg>
      `;

    // Mock bounding boxes
    const nodeA = container.querySelector(
      '#flowchart-A-0'
    ) as SVGGraphicsElement;
    const nodeB = container.querySelector(
      '#flowchart-B-1'
    ) as SVGGraphicsElement;
    nodeA.getBBox = () => ({ x: 0, y: 0, width: 350, height: 40 }) as DOMRect;
    nodeB.getBBox = () => ({ x: 0, y: 0, width: 60, height: 40 }) as DOMRect;

    const nodes = extractRenderedNodes(container);
    expect(nodes).toHaveLength(2);
    expect(nodes[0].nodeId).toBe('A');
    expect(nodes[0].width).toBe(350);
    expect(nodes[1].nodeId).toBe('B');
    expect(nodes[1].width).toBe(60);

    const code =
      'graph TD\n  A[This is an extraordinarily long sentence inside node A] --> B[Short]';
    const result = autoWrapDiagramFromSvg(code, container, {
      maxPixelWidth: 150
    });

    expect(result.wrappedCount).toBe(1);
    expect(result.updatedCode).toContain('A["');
    expect(result.updatedCode).toContain('\\n');
    expect(result.updatedCode).toContain('--> B[Short]');
  });
});
