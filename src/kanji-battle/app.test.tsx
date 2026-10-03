import { render, fireEvent } from '@testing-library/preact';
import { describe, it, expect } from 'vitest';
import { App } from './app';
import { APP_TITLE } from './constants';
import { SENTENCE_LIST } from './sentences-data';

describe('App', () => {
  it('renders heading, prompt, character tiles, and canvas', () => {
    const { getByText, getByRole, getByLabelText } = render(<App />);
    expect(getByText(APP_TITLE)).toBeTruthy();
    expect(getByText(SENTENCE_LIST[0].english)).toBeTruthy();
    expect(getByRole('region', { name: /writing arena/i })).toBeTruthy();
    expect(getByLabelText(/stylus handwriting practice canvas/i)).toBeTruthy();
    expect(getByRole('button', { name: /previous sentence/i })).toBeTruthy();
    expect(getByRole('button', { name: /next sentence/i })).toBeTruthy();
  });

  it('cycles to the next sentence when clicking next', () => {
    const { getByRole, getByText } = render(<App />);
    const nextBtn = getByRole('button', { name: /next sentence/i });
    fireEvent.click(nextBtn);

    expect(getByText(SENTENCE_LIST[1].english)).toBeTruthy();
    expect(getByText('Sentence 2 of 6')).toBeTruthy();
  });

  it('toggles guide visibility when clicking toggle guide button', () => {
    const { getByRole } = render(<App />);
    const guideBtn = getByRole('button', { name: /hide guide/i });
    expect(guideBtn).toBeTruthy();

    fireEvent.click(guideBtn);
    expect(getByRole('button', { name: /show guide/i })).toBeTruthy();
  });

  it('handles stylus pointer events on the canvas', () => {
    const { getByLabelText, getByRole } = render(<App />);
    const canvas = getByLabelText(/stylus handwriting practice canvas/i);

    // Mock setPointerCapture
    canvas.setPointerCapture = () => {};

    // Simulate drawing a short stroke
    fireEvent.pointerDown(canvas, { clientX: 50, clientY: 50, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 52, clientY: 52, pointerId: 1 });
    fireEvent.pointerUp(canvas, { pointerId: 1 });

    const alert = getByRole('alert');
    expect(alert).toBeTruthy();
  });
});
