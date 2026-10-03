import { render, fireEvent } from '@testing-library/preact';
import { describe, it, expect, beforeEach } from 'vitest';
import { App } from './app';
import {
  APP_TITLE,
  SHOP_PRICE_TIER_1,
  SHOP_PRICE_TIER_3,
  STORAGE_PROFILE_KEY
} from './constants';

describe('App rendering and challenge display', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders brand heading, 5 target kanji in hiragana, and vertical grid', () => {
    const { getByText, getAllByText, getByRole, getByLabelText } = render(
      <App />
    );
    expect(getByText(APP_TITLE)).toBeTruthy();
    expect(
      getByRole('region', { name: /required target kanji/i })
    ).toBeTruthy();
    expect(
      getByRole('region', { name: /japanese vertical writing grid/i })
    ).toBeTruthy();
    expect(getByRole('region', { name: /character selection/i })).toBeTruthy();
    expect(getByRole('region', { name: /writing arena/i })).toBeTruthy();
    expect(getByLabelText(/stylus handwriting practice canvas/i)).toBeTruthy();

    // Challenge shows 5 target kanji in hiragana readings
    expect(getAllByText('ひ').length).toBeGreaterThan(0);
    expect(getAllByText('やま').length).toBeGreaterThan(0);
    expect(getAllByText('き').length).toBeGreaterThan(0);
    expect(getAllByText('みず').length).toBeGreaterThan(0);
  });

  it('masks kanji on writing arena while showing reading and meaning', () => {
    const { container, getByText } = render(<App />);
    const bigChar = container.querySelector('.big-char');
    expect(bigChar?.textContent).toBe('?');
    expect(getByText(/\[ひ\] Sun \/ Day/)).toBeTruthy();
  });
});

describe('App interactions and canvas writing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('selects cells and changes character from palette', () => {
    const { getByRole, getByText } = render(<App />);
    const cell2 = getByRole('gridcell', { name: /cell 2/i });
    fireEvent.click(cell2);

    const kanaChip = getByRole('button', { name: /select kana は/i });
    fireEvent.click(kanaChip);

    expect(getByText(/Topic marker \(ha\)/)).toBeTruthy();
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

describe('App tabs and shop view interactions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('switches between practice and minifig shop tabs', () => {
    const { getByRole, queryByRole } = render(<App />);
    expect(
      getByRole('region', { name: /japanese vertical writing grid/i })
    ).toBeTruthy();

    const shopTabBtn = getByRole('button', { name: /minifig shop/i });
    fireEvent.click(shopTabBtn);

    expect(
      getByRole('heading', { name: /lego minifigure shop/i })
    ).toBeTruthy();
    expect(
      queryByRole('region', { name: /japanese vertical writing grid/i })
    ).toBeNull();

    const practiceTabBtn = getByRole('button', { name: /practice/i });
    fireEvent.click(practiceTabBtn);

    expect(
      getByRole('region', { name: /japanese vertical writing grid/i })
    ).toBeTruthy();
  });

  it('displays minifigures in the shop and allows buying when funded', () => {
    localStorage.setItem(
      STORAGE_PROFILE_KEY,
      JSON.stringify({
        points: SHOP_PRICE_TIER_3,
        purchasedItemIds: [],
        equippedItemId: null
      })
    );

    const { getByRole, getByText, getByLabelText } = render(<App />);
    fireEvent.click(getByRole('button', { name: /minifig shop/i }));

    expect(getByText('Ninja Minifig')).toBeTruthy();
    const buyBtn = getByRole('button', {
      name: new RegExp(`buy for ${SHOP_PRICE_TIER_1} pts`, 'i')
    });
    fireEvent.click(buyBtn);

    expect(getByText('Equipped')).toBeTruthy();
    expect(
      getByLabelText(
        new RegExp(
          `points balance: ${SHOP_PRICE_TIER_3 - SHOP_PRICE_TIER_1}`,
          'i'
        )
      )
    ).toBeTruthy();
  });
});
