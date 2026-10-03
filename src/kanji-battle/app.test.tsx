import { render, fireEvent } from '@testing-library/preact';
import { describe, it, expect, beforeEach } from 'vitest';
import { App } from './app';
import {
  APP_TITLE,
  SHOP_PRICE_TIER_1,
  SHOP_PRICE_TIER_3,
  STORAGE_PROFILE_KEY
} from './constants';

const startPracticeSession = (rendered: ReturnType<typeof render>) => {
  const startBtn = rendered.getByRole('button', { name: /start game/i });
  fireEvent.click(startBtn);
};

describe('App configuration workflow and practice start', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders 3-step configuration workflow before game mode begins', () => {
    const rendered = render(<App />);
    expect(rendered.getByText(APP_TITLE)).toBeTruthy();
    expect(
      rendered.getByRole('region', { name: /step 1: select year of kanji/i })
    ).toBeTruthy();
    expect(
      rendered.getByRole('region', {
        name: /step 2: select kanji to practice/i
      })
    ).toBeTruthy();
    expect(
      rendered.getByRole('region', { name: /step 3: start the game/i })
    ).toBeTruthy();
    expect(rendered.getByRole('button', { name: /start game/i })).toBeTruthy();
  });

  it('selects year 2 and custom kanji, then starts game mode', () => {
    const rendered = render(<App />);
    const year2Btn = rendered.getByRole('button', { name: /year 2/i });
    fireEvent.click(year2Btn);

    expect(rendered.getByText(/行/)).toBeTruthy();
    expect(rendered.getByText(/今/)).toBeTruthy();

    startPracticeSession(rendered);

    expect(
      rendered.getByRole('region', { name: /japanese vertical writing grid/i })
    ).toBeTruthy();
    expect(
      rendered.getByRole('region', { name: /required target kanji/i })
    ).toBeTruthy();
    expect(rendered.getByText(/Year 2 Practice/)).toBeTruthy();
  });

  it('allows returning to configuration from practice toolbar', () => {
    const rendered = render(<App />);
    startPracticeSession(rendered);

    const changeBtn = rendered.getByRole('button', {
      name: /change kanji/i
    });
    fireEvent.click(changeBtn);

    expect(
      rendered.getByRole('region', { name: /step 1: select year of kanji/i })
    ).toBeTruthy();
  });
});

describe('App rendering and challenge display', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders 5 target kanji in hiragana and vertical grid once game starts', () => {
    const rendered = render(<App />);
    startPracticeSession(rendered);

    expect(
      rendered.getByRole('region', { name: /required target kanji/i })
    ).toBeTruthy();
    expect(
      rendered.getByRole('region', { name: /japanese vertical writing grid/i })
    ).toBeTruthy();
    expect(
      rendered.getByRole('region', { name: /character selection/i })
    ).toBeTruthy();
    expect(
      rendered.getByRole('region', { name: /writing arena/i })
    ).toBeTruthy();
    expect(
      rendered.getByLabelText(/stylus handwriting practice canvas/i)
    ).toBeTruthy();

    expect(rendered.getAllByText('ひ').length).toBeGreaterThan(0);
    expect(rendered.getAllByText('やま').length).toBeGreaterThan(0);
    expect(rendered.getAllByText('き').length).toBeGreaterThan(0);
    expect(rendered.getAllByText('みず').length).toBeGreaterThan(0);
  });

  it('masks kanji on writing arena while showing reading and meaning', () => {
    const rendered = render(<App />);
    startPracticeSession(rendered);

    const bigChar = rendered.container.querySelector('.big-char');
    expect(bigChar?.textContent).toBe('?');
    expect(rendered.getByText(/\[ひ\] Sun \/ Day/)).toBeTruthy();
  });
});

describe('App interactions and canvas writing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('selects cells and changes character from palette', () => {
    const rendered = render(<App />);
    startPracticeSession(rendered);

    const cell2 = rendered.getByRole('gridcell', { name: /cell 2/i });
    fireEvent.click(cell2);

    const kanaChip = rendered.getByRole('button', {
      name: /select kana は/i
    });
    fireEvent.click(kanaChip);

    expect(rendered.getByText(/Topic marker \(ha\)/)).toBeTruthy();
  });

  it('toggles hint visibility when clicking toggle hint button', () => {
    const rendered = render(<App />);
    startPracticeSession(rendered);

    const hintBtn = rendered.getByRole('button', { name: /show hint/i });
    expect(hintBtn).toBeTruthy();

    fireEvent.click(hintBtn);
    expect(rendered.getByRole('button', { name: /hide hint/i })).toBeTruthy();
  });

  it('handles stylus pointer events on the canvas', () => {
    const rendered = render(<App />);
    startPracticeSession(rendered);

    const canvas = rendered.getByLabelText(
      /stylus handwriting practice canvas/i
    );
    canvas.setPointerCapture = () => {};

    fireEvent.pointerDown(canvas, { clientX: 50, clientY: 50, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 52, clientY: 52, pointerId: 1 });
    fireEvent.pointerUp(canvas, { pointerId: 1 });

    const alert = rendered.getByRole('alert');
    expect(alert).toBeTruthy();
  });
});

describe('App tabs and shop view interactions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('switches between practice and minifig shop tabs', () => {
    const rendered = render(<App />);
    expect(
      rendered.getByRole('region', { name: /step 1: select year of kanji/i })
    ).toBeTruthy();

    const shopTabBtn = rendered.getByRole('button', { name: /minifig shop/i });
    fireEvent.click(shopTabBtn);

    expect(
      rendered.getByRole('heading', { name: /lego minifigure shop/i })
    ).toBeTruthy();
    expect(
      rendered.queryByRole('region', {
        name: /step 1: select year of kanji/i
      })
    ).toBeNull();

    const practiceTabBtn = rendered.getByRole('button', { name: /practice/i });
    fireEvent.click(practiceTabBtn);

    expect(
      rendered.getByRole('region', { name: /step 1: select year of kanji/i })
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

    const rendered = render(<App />);
    fireEvent.click(rendered.getByRole('button', { name: /minifig shop/i }));

    expect(rendered.getByText('Ninja Minifig')).toBeTruthy();
    const buyBtn = rendered.getByRole('button', {
      name: new RegExp(`buy for ${SHOP_PRICE_TIER_1} pts`, 'i')
    });
    fireEvent.click(buyBtn);

    expect(rendered.getByText('Equipped')).toBeTruthy();
    expect(
      rendered.getByLabelText(
        new RegExp(
          `points balance: ${SHOP_PRICE_TIER_3 - SHOP_PRICE_TIER_1}`,
          'i'
        )
      )
    ).toBeTruthy();
  });
});
