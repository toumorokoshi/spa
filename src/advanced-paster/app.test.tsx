import { render } from '@testing-library/preact';
import { describe, it, expect } from 'vitest';
import { App } from './index';

describe('Advanced Paster App component', () => {
  it('renders heading, description, format selector, and textarea input without throwing runtime errors', () => {
    const { getByText, getByLabelText, getByPlaceholderText } = render(<App />);
    expect(getByText('Advanced Paster')).toBeTruthy();
    expect(getByLabelText('Input Format:')).toBeTruthy();
    expect(getByPlaceholderText('Paste your content here...')).toBeTruthy();
  });
});
