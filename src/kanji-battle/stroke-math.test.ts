import { describe, it, expect } from 'vitest';
import {
  pointDistance,
  interpolatePoint,
  strokeLength,
  computeCumulativeDistances,
  resampleStroke,
  normalizePoints,
  strokeDistance
} from './stroke-math';
import { Point } from './types';

describe('point and segment geometry', () => {
  it('calculates Euclidean distance between two points', () => {
    const p1: Point = { x: 0, y: 0 };
    const p2: Point = { x: 3, y: 4 };
    expect(pointDistance(p1, p2)).toBe(5);
  });

  it('interpolates point along a segment', () => {
    const p1: Point = { x: 0, y: 10 };
    const p2: Point = { x: 10, y: 20 };
    const mid = interpolatePoint(p1, p2, 0.5);
    expect(mid.x).toBe(5);
    expect(mid.y).toBe(15);
  });

  it('calculates total length of a polyline stroke', () => {
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 }
    ];
    expect(strokeLength(points)).toBe(20);
    expect(strokeLength([])).toBe(0);
    expect(strokeLength([{ x: 1, y: 1 }])).toBe(0);
  });

  it('computes cumulative distances along points', () => {
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 10 }
    ];
    const cumulative = computeCumulativeDistances(points);
    expect(cumulative).toEqual([0, 5, 15]);
  });
});

describe('stroke resampling and normalization', () => {
  it('resamples stroke into equidistant points', () => {
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 }
    ];
    const resampled = resampleStroke(points, 5);
    expect(resampled.length).toBe(5);
    expect(resampled[0]).toEqual({ x: 0, y: 0 });
    expect(resampled[2].x).toBeCloseTo(50);
    expect(resampled[4]).toEqual({ x: 100, y: 0 });
  });

  it('handles edge cases in resampleStroke', () => {
    expect(resampleStroke([], 5)).toEqual([]);
    const single = [{ x: 5, y: 5 }];
    const resampledSingle = resampleStroke(single, 3);
    expect(resampledSingle.length).toBe(3);
    expect(resampledSingle[0]).toEqual({ x: 5, y: 5 });
  });

  it('normalizes points to 100x100 space', () => {
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 150, y: 150 },
      { x: 300, y: 300 }
    ];
    const normalized = normalizePoints(points, 300, 300);
    expect(normalized[0]).toEqual({ x: 0, y: 0 });
    expect(normalized[1]).toEqual({ x: 50, y: 50 });
    expect(normalized[2]).toEqual({ x: 100, y: 100 });
  });

  it('computes weighted distance between two strokes', () => {
    const strokeA: Point[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 }
    ];
    const strokeB: Point[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 }
    ];
    expect(strokeDistance(strokeA, strokeB)).toBe(0);
    expect(strokeDistance([], strokeB)).toBe(Number.POSITIVE_INFINITY);
  });
});
