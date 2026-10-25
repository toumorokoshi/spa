import { render } from '@testing-library/preact';
import { describe, it, expect } from 'vitest';
import { OutputColumn } from './OutputColumn';

const contentBox = (container: HTMLElement, text: string) =>
  [...container.querySelectorAll('div')].find(
    (el) => el.style.overflowY === 'auto' && el.textContent === text
  ) as HTMLElement;

describe('OutputColumn', () => {
  it('renders HTML on a white background so selections copy without gray', () => {
    const { container } = render(
      <OutputColumn
        title="Rendered HTML"
        content="<p>Hello</p>"
        onCopy={() => {}}
        isHtmlRender
      />
    );
    expect(contentBox(container, 'Hello').style.backgroundColor).toBe(
      'rgb(255, 255, 255)'
    );
  });

  it('keeps the gray background for source text columns', () => {
    const { container } = render(
      <OutputColumn title="Markdown" content="# Hi" onCopy={() => {}} />
    );
    expect(contentBox(container, '# Hi').style.backgroundColor).toBe(
      'rgb(249, 249, 249)'
    );
  });
});
