import { describe, it, expect } from 'vitest';
import { toClipboardHtml } from './clipboard';

describe('toClipboardHtml', () => {
  it('wraps the content in a white, black-text container', () => {
    const doc = new DOMParser().parseFromString(
      toClipboardHtml('<p>Hello <b>world</b></p>'),
      'text/html'
    );
    const wrapper = doc.body.firstElementChild as HTMLElement;

    expect(doc.body.style.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(wrapper.style.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(wrapper.style.color).toBe('rgb(0, 0, 0)');
    expect(wrapper.innerHTML).toBe('<p>Hello <b>world</b></p>');
  });
});
