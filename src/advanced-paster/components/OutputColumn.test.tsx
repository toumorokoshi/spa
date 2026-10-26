import { render } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { OutputColumn } from './OutputColumn';

const contentBox = (container: HTMLElement, text: string) =>
  [...container.querySelectorAll('div')].find(
    (el) => el.style.overflowY === 'auto' && el.textContent === text
  ) as HTMLElement;

describe('OutputColumn', () => {
  it('renders HTML without a background color', () => {
    const { container } = render(
      <OutputColumn
        title="Rendered HTML"
        content="<p>Hello</p>"
        onCopy={() => {}}
        isHtmlRender
      />
    );
    expect(contentBox(container, 'Hello').style.backgroundColor).toBe(
      'transparent'
    );
  });

  it('copies a selection of the rendered HTML without page styling', () => {
    const { getByText } = render(
      <OutputColumn
        title="Rendered HTML"
        content='<p class="x">Hello</p>'
        onCopy={() => {}}
        isHtmlRender
      />
    );
    const paragraph = getByText('Hello');
    const range = document.createRange();
    range.selectNode(paragraph);
    const selection = window.getSelection() as Selection;
    selection.removeAllRanges();
    selection.addRange(range);

    const setData = vi.fn();
    const event = new Event('copy', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { setData } });
    paragraph.dispatchEvent(event);

    expect(setData).toHaveBeenCalledWith('text/html', '<p>Hello</p>');
    expect(event.defaultPrevented).toBe(true);
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
