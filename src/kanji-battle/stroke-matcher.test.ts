import { describe, it, expect } from 'vitest';
import { matchStroke } from './stroke-matcher';
import { CHARACTER_DICTIONARY } from './character-data';
import { CANVAS_SIZE } from './constants';
import { Point } from './types';

describe('single stroke matching and order detection', () => {
  const charJu = CHARACTER_DICTIONARY['十'];

  it('matches correct stroke in order', () => {
    const userPoints: Point[] = [
      { x: (20 / 100) * CANVAS_SIZE, y: (50 / 100) * CANVAS_SIZE },
      { x: (50 / 100) * CANVAS_SIZE, y: (50 / 100) * CANVAS_SIZE },
      { x: (80 / 100) * CANVAS_SIZE, y: (50 / 100) * CANVAS_SIZE }
    ];

    const result = matchStroke(
      userPoints,
      CANVAS_SIZE,
      CANVAS_SIZE,
      charJu.strokes,
      0
    );
    expect(result.status).toBe('correct');
    expect(result.expectedIndex).toBe(0);
  });

  it('detects incorrect stroke order when drawing a later stroke first', () => {
    const userPoints: Point[] = [
      { x: (50 / 100) * CANVAS_SIZE, y: (18 / 100) * CANVAS_SIZE },
      { x: (50 / 100) * CANVAS_SIZE, y: (50 / 100) * CANVAS_SIZE },
      { x: (50 / 100) * CANVAS_SIZE, y: (84 / 100) * CANVAS_SIZE }
    ];

    const result = matchStroke(
      userPoints,
      CANVAS_SIZE,
      CANVAS_SIZE,
      charJu.strokes,
      0
    );
    expect(result.status).toBe('wrong-order');
    expect(result.expectedIndex).toBe(0);
    expect(result.matchedIndex).toBe(1);
  });
});

describe('second stroke matching for multi-stroke kanji', () => {
  const charJu = CHARACTER_DICTIONARY['十'];

  it('matches second stroke of multi-stroke kanji after first stroke is complete', () => {
    const stroke1Points: Point[] = [
      { x: (50 / 100) * CANVAS_SIZE, y: (18 / 100) * CANVAS_SIZE },
      { x: (50 / 100) * CANVAS_SIZE, y: (50 / 100) * CANVAS_SIZE },
      { x: (50 / 100) * CANVAS_SIZE, y: (84 / 100) * CANVAS_SIZE }
    ];

    const result = matchStroke(
      stroke1Points,
      CANVAS_SIZE,
      CANVAS_SIZE,
      charJu.strokes,
      1
    );
    expect(result.status).toBe('correct');
    expect(result.expectedIndex).toBe(1);
  });

  it('matches consecutive strokes for two-stroke kanji 二', () => {
    const charNi = CHARACTER_DICTIONARY['二'];
    const stroke0Points: Point[] = [
      { x: (28 / 100) * CANVAS_SIZE, y: (36 / 100) * CANVAS_SIZE },
      { x: (50 / 100) * CANVAS_SIZE, y: (36 / 100) * CANVAS_SIZE },
      { x: (72 / 100) * CANVAS_SIZE, y: (36 / 100) * CANVAS_SIZE }
    ];
    const stroke1Points: Point[] = [
      { x: (18 / 100) * CANVAS_SIZE, y: (68 / 100) * CANVAS_SIZE },
      { x: (50 / 100) * CANVAS_SIZE, y: (68 / 100) * CANVAS_SIZE },
      { x: (82 / 100) * CANVAS_SIZE, y: (68 / 100) * CANVAS_SIZE }
    ];

    const res0 = matchStroke(
      stroke0Points,
      CANVAS_SIZE,
      CANVAS_SIZE,
      charNi.strokes,
      0
    );
    expect(res0.status).toBe('correct');
    expect(res0.expectedIndex).toBe(0);

    const res1 = matchStroke(
      stroke1Points,
      CANVAS_SIZE,
      CANVAS_SIZE,
      charNi.strokes,
      1
    );
    expect(res1.status).toBe('correct');
    expect(res1.expectedIndex).toBe(1);
  });
});

describe('subsequent stroke ordering in multi-stroke kanji', () => {
  it('detects incorrect stroke order when drawing stroke 3 instead of stroke 2 in 三', () => {
    const charSan = CHARACTER_DICTIONARY['三'];
    const bottomStrokePoints: Point[] = [
      { x: (18 / 100) * CANVAS_SIZE, y: (72 / 100) * CANVAS_SIZE },
      { x: (50 / 100) * CANVAS_SIZE, y: (72 / 100) * CANVAS_SIZE },
      { x: (82 / 100) * CANVAS_SIZE, y: (72 / 100) * CANVAS_SIZE }
    ];

    const result = matchStroke(
      bottomStrokePoints,
      CANVAS_SIZE,
      CANVAS_SIZE,
      charSan.strokes,
      1
    );
    expect(result.status).toBe('wrong-order');
    expect(result.expectedIndex).toBe(1);
    expect(result.matchedIndex).toBe(2);
  });
});

describe('stroke rejection and errors', () => {
  const charJu = CHARACTER_DICTIONARY['十'];

  it('detects reversed stroke direction', () => {
    const userPoints: Point[] = [
      { x: (80 / 100) * CANVAS_SIZE, y: (50 / 100) * CANVAS_SIZE },
      { x: (50 / 100) * CANVAS_SIZE, y: (50 / 100) * CANVAS_SIZE },
      { x: (20 / 100) * CANVAS_SIZE, y: (50 / 100) * CANVAS_SIZE }
    ];

    const result = matchStroke(
      userPoints,
      CANVAS_SIZE,
      CANVAS_SIZE,
      charJu.strokes,
      0
    );
    expect(result.status).toBe('wrong-direction');
  });

  it('rejects strokes that are too short or jittery', () => {
    const jitterPoints: Point[] = [
      { x: 50, y: 50 },
      { x: 51, y: 51 }
    ];
    const result = matchStroke(
      jitterPoints,
      CANVAS_SIZE,
      CANVAS_SIZE,
      charJu.strokes,
      0
    );
    expect(result.status).toBe('too-short');
  });

  it('rejects unrecognized strokes', () => {
    const diagonalPoints: Point[] = [
      { x: 10, y: 10 },
      { x: 50, y: 90 },
      { x: 90, y: 10 }
    ];
    const result = matchStroke(
      diagonalPoints,
      CANVAS_SIZE,
      CANVAS_SIZE,
      charJu.strokes,
      0
    );
    expect(result.status).toBe('unrecognized');
  });
});
