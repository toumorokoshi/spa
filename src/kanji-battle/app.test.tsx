import { render, fireEvent } from '@testing-library/preact';
import { describe, it, expect } from 'vitest';
import { App } from './app';
import { APP_TITLE } from './constants';
import { SENTENCE_LIST } from './sentences-data';

describe('App rendering and navigation', () => {
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
});

describe('App memory writing mode and canvas interaction', () => {
  it('masks kanji for memory recall while displaying hiragana and readings', () => {
    const { container, getByText } = render(<App />);
    // Sentence 0: 日は山から出る -> Kanji (日, 山, 出) should be masked as '?' until written
    // Hiragana (は, か, ら, る) should be visible
    expect(getByText('は')).toBeTruthy();
    expect(getByText('か')).toBeTruthy();
    expect(getByText('ら')).toBeTruthy();
    expect(getByText('る')).toBeTruthy();

    // Check that target badge shows '?' for uncompleted kanji '日'
    const bigChar = container.querySelector('.big-char');
    expect(bigChar?.textContent).toBe('?');

    // Shows reading in hiragana and meaning
    expect(getByText(/\[ひ\] Sun \/ Day/)).toBeTruthy();
  });

  it('toggles hint visibility when clicking toggle hint button', () => {
    const { getByRole } = render(<App />);
    const hintBtn = getByRole('button', { name: /show hint/i });
    expect(hintBtn).toBeTruthy();

    fireEvent.click(hintBtn);
    expect(getByRole('button', { name: /hide hint/i })).toBeTruthy();
  });

  it('handles stylus pointer events on the canvas', () => {
    const { getByLabelText, getByRole } = render(<App />);
    const canvas = getByLabelText(/stylus handwriting practice canvas/i);

    canvas.setPointerCapture = () => {};

    fireEvent.pointerDown(canvas, { clientX: 50, clientY: 50, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 52, clientY: 52, pointerId: 1 });
    fireEvent.pointerUp(canvas, { pointerId: 1 });

    const alert = getByRole('alert');
    expect(alert).toBeTruthy();
  });
});
