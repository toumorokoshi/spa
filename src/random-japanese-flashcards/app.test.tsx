import { render } from '@testing-library/preact';
import { describe, it, expect } from 'vitest';
import { App } from './app';

describe('App', () => {
  it('renders the heading', () => {
    const { getByText } = render(<App />);
    expect(getByText('Random Japanese Flashcards')).toBeTruthy();
  });
});
