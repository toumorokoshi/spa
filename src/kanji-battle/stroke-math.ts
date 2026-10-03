import {
  WEIGHT_AVG_DISTANCE,
  WEIGHT_ENDPOINT_DISTANCE,
  NORMALIZED_BOX_SIZE
} from './constants';
import { Point } from './types';

export const pointDistance = (p1: Point, p2: Point): number =>
  Math.hypot(p1.x - p2.x, p1.y - p2.y);

export const interpolatePoint = (
  p1: Point,
  p2: Point,
  ratio: number
): Point => ({
  x: p1.x + (p2.x - p1.x) * ratio,
  y: p1.y + (p2.y - p1.y) * ratio
});

export const strokeLength = (points: readonly Point[]): number => {
  if (points.length < 2) {
    return 0;
  }
  return points
    .slice(1)
    .reduce((sum, curr, idx) => sum + pointDistance(points[idx], curr), 0);
};

export const computeCumulativeDistances = (
  points: readonly Point[]
): readonly number[] =>
  points.reduce<readonly number[]>((acc, curr, idx) => {
    if (idx === 0) {
      return [0];
    }
    const previous = acc[acc.length - 1];
    return [...acc, previous + pointDistance(points[idx - 1], curr)];
  }, []);

const findSegmentIndex = (
  cumulative: readonly number[],
  target: number
): number => {
  const foundIndex = cumulative.findIndex((dist) => dist >= target);
  if (foundIndex <= 0) {
    return 0;
  }
  return foundIndex - 1;
};

const sampleAtDistance = (
  points: readonly Point[],
  cumulative: readonly number[],
  targetDist: number
): Point => {
  const segIdx = findSegmentIndex(cumulative, targetDist);
  const nextIdx = Math.min(points.length - 1, segIdx + 1);
  const dStart = cumulative[segIdx];
  const dEnd = cumulative[nextIdx];
  const span = dEnd - dStart;
  if (span <= 0) {
    return points[segIdx];
  }
  const ratio = (targetDist - dStart) / span;
  return interpolatePoint(points[segIdx], points[nextIdx], ratio);
};

export const resampleStroke = (
  points: readonly Point[],
  count: number
): readonly Point[] => {
  if (points.length === 0) {
    return [];
  }
  if (points.length === 1 || count <= 1) {
    return Array.from({ length: count }, () => points[0]);
  }

  const cumulative = computeCumulativeDistances(points);
  const totalLength = cumulative[cumulative.length - 1];
  const step = totalLength / (count - 1);

  return Array.from({ length: count }, (_, i) => {
    if (i === 0) {
      return points[0];
    }
    if (i === count - 1) {
      return points[points.length - 1];
    }
    return sampleAtDistance(points, cumulative, i * step);
  });
};

export const normalizePoints = (
  points: readonly Point[],
  width: number,
  height: number
): readonly Point[] => {
  if (width <= 0 || height <= 0) {
    return points;
  }
  return points.map((p) => ({
    x: (p.x / width) * NORMALIZED_BOX_SIZE,
    y: (p.y / height) * NORMALIZED_BOX_SIZE
  }));
};

export const strokeDistance = (
  strokeA: readonly Point[],
  strokeB: readonly Point[]
): number => {
  if (strokeA.length === 0 || strokeB.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  const avgPointDist =
    strokeA.reduce((sum, pt, idx) => sum + pointDistance(pt, strokeB[idx]), 0) /
    strokeA.length;

  const startDist = pointDistance(strokeA[0], strokeB[0]);
  const endDist = pointDistance(
    strokeA[strokeA.length - 1],
    strokeB[strokeB.length - 1]
  );

  return (
    avgPointDist * WEIGHT_AVG_DISTANCE +
    startDist * WEIGHT_ENDPOINT_DISTANCE +
    endDist * WEIGHT_ENDPOINT_DISTANCE
  );
};
