import { describe, it, expect, vi } from 'vitest';
import { copySelectionUnstyled, toUnstyledHtml } from './clipboard';

describe('toUnstyledHtml', () => {
  it('returns unstyled HTML unchanged', () => {
    const html = '<p>Hello <b>world</b></p>';
    expect(toUnstyledHtml(html)).toBe(html);
  });

  it('removes style, class, and color attributes and style elements', () => {
    expect(
      toUnstyledHtml(
        '<style>p{color:red}</style><p style="background:#ccc" class="x">' +
          '<font color="red">Hi</font></p>' +
          '<table><tbody><tr><td bgcolor="gray">c</td></tr></tbody></table>'
      )
    ).toBe(
      '<p><font>Hi</font></p><table><tbody><tr><td>c</td></tr></tbody></table>'
    );
  });

  it('leaves MathML attributes intact', () => {
    const math =
      '<math xmlns="http://www.w3.org/1998/Math/MathML" class="tml-display">' +
      '<mi style="font-style:normal">x</mi></math>';
    expect(toUnstyledHtml(`<p style="color:red">${math}</p>`)).toBe(
      `<p>${math}</p>`
    );
  });
});

describe('copySelectionUnstyled', () => {
  const selectContents = (html: string) => {
    const host = document.createElement('div');
    host.innerHTML = html;
    document.body.appendChild(host);
    const range = document.createRange();
    range.selectNodeContents(host);
    const selection = window.getSelection() as Selection;
    selection.removeAllRanges();
    selection.addRange(range);
    return selection;
  };

  const clipboardEvent = () => {
    const data = new Map<string, string>();
    const event = {
      clipboardData: {
        setData: (type: string, value: string) => data.set(type, value)
      },
      preventDefault: vi.fn()
    } as unknown as ClipboardEvent;
    return { event, data };
  };

  it('writes unstyled HTML and plain text for the selection', () => {
    const selection = selectContents(
      '<p style="color:red">Hello <b>there</b></p>'
    );
    const { event, data } = clipboardEvent();

    copySelectionUnstyled(event, selection);

    expect(data.get('text/html')).toBe('<p>Hello <b>there</b></p>');
    expect(data.get('text/plain')).toBe('Hello there');
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('falls back to the default copy when nothing is selected', () => {
    const selection = window.getSelection() as Selection;
    selection.removeAllRanges();
    const { event, data } = clipboardEvent();

    copySelectionUnstyled(event, selection);

    expect(data.size).toBe(0);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
