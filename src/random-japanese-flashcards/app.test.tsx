import { render } from '@testing-library/preact';
import { describe, it, expect } from 'vitest';
import { App } from './app';
import { KANA_WORDS } from './words';

describe('App', () => {
  it('renders heading, a listed kana word, and next control', () => {
    const { getByText, getByRole } = render(<App />);
    expect(getByText('Random Japanese Flashcards')).toBeTruthy();
    const wordEl = document.querySelector('.kana');
    const shown = wordEl?.textContent ?? '';
    expect(shown.length).toBeGreaterThan(0);
    expect(KANA_WORDS.includes(shown)).toBe(true);
    expect(getByRole('button', { name: /next card/i })).toBeTruthy();
    expect(
      getByRole('checkbox', { name: /practice starred only/i })
    ).toBeTruthy();
    expect(getByRole('button', { name: /star this word/i })).toBeTruthy();
  });
});
