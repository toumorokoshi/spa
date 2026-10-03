import { describe, it, expect } from 'vitest';
import { matchStroke } from './stroke-matcher';
import { CHARACTER_DICTIONARY } from './character-data';
import { CANVAS_SIZE } from './constants';
import { Point } from './types';

describe('stroke order and matching', () => {
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
