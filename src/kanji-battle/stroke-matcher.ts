import {
  MIN_POINTS_FOR_STROKE,
  MIN_STROKE_PIXEL_LENGTH,
  RESAMPLE_SAMPLE_COUNT,
  STROKE_MATCH_THRESHOLD,
  REVERSE_MATCH_THRESHOLD
} from './constants';
import {
  normalizePoints,
  strokeLength,
  resampleStroke,
  strokeDistance
} from './stroke-math';
import { Point, Stroke, StrokeMatchResult } from './types';

interface CandidateEvaluation {
  readonly index: number;
  readonly distance: number;
  readonly reverseDistance: number;
}

const evaluateCandidate = (
  resampledUser: readonly Point[],
  targetStroke: Stroke,
  index: number
): CandidateEvaluation => {
  const resampledTarget = resampleStroke(targetStroke, RESAMPLE_SAMPLE_COUNT);
  const forwardDist = strokeDistance(resampledUser, resampledTarget);
  const reversedUser = [...resampledUser].reverse();
  const reverseDist = strokeDistance(reversedUser, resampledTarget);

  return {
    index,
    distance: forwardDist,
    reverseDistance: reverseDist
  };
};

const findRemainingBestMatch = (
  resampledUser: readonly Point[],
  characterStrokes: readonly Stroke[],
  currentStrokeIndex: number
): CandidateEvaluation => {
  const remainingStrokes = characterStrokes.slice(currentStrokeIndex);
  const initial = evaluateCandidate(
    resampledUser,
    remainingStrokes[0],
    currentStrokeIndex
  );

  return remainingStrokes
    .slice(1)
    .reduce<CandidateEvaluation>((best, target, offset) => {
      const candidateIndex = currentStrokeIndex + 1 + offset;
      const candidate = evaluateCandidate(
        resampledUser,
        target,
        candidateIndex
      );
      const minCandidate = Math.min(
        candidate.distance,
        candidate.reverseDistance
      );
      const minBest = Math.min(best.distance, best.reverseDistance);
      return minCandidate < minBest ? candidate : best;
    }, initial);
};

const classifyMatch = (
  best: CandidateEvaluation,
  currentStrokeIndex: number
): StrokeMatchResult => {
  if (best.distance <= STROKE_MATCH_THRESHOLD) {
    if (best.index === currentStrokeIndex) {
      return { status: 'correct', expectedIndex: currentStrokeIndex };
    }
    return {
      status: 'wrong-order',
      expectedIndex: currentStrokeIndex,
      matchedIndex: best.index
    };
  }

  if (best.reverseDistance <= REVERSE_MATCH_THRESHOLD) {
    if (best.index === currentStrokeIndex) {
      return {
        status: 'wrong-direction',
        expectedIndex: currentStrokeIndex,
        matchedIndex: currentStrokeIndex
      };
    }
    return {
      status: 'wrong-order',
      expectedIndex: currentStrokeIndex,
      matchedIndex: best.index
    };
  }

  return { status: 'unrecognized', expectedIndex: currentStrokeIndex };
};

export const matchStroke = (
  userPoints: readonly Point[],
  canvasWidth: number,
  canvasHeight: number,
  characterStrokes: readonly Stroke[],
  currentStrokeIndex: number
): StrokeMatchResult => {
  if (userPoints.length < MIN_POINTS_FOR_STROKE) {
    return { status: 'too-short' };
  }

  const normalized = normalizePoints(userPoints, canvasWidth, canvasHeight);
  if (strokeLength(normalized) < MIN_STROKE_PIXEL_LENGTH) {
    return { status: 'too-short' };
  }

  if (!characterStrokes[currentStrokeIndex]) {
    return { status: 'unrecognized', expectedIndex: currentStrokeIndex };
  }

  const resampledUser = resampleStroke(normalized, RESAMPLE_SAMPLE_COUNT);
  const best = findRemainingBestMatch(
    resampledUser,
    characterStrokes,
    currentStrokeIndex
  );
  return classifyMatch(best, currentStrokeIndex);
};

export interface CandidateCharacter {
  readonly char: string;
  readonly strokes: readonly Stroke[];
}

const computeCharacterStrokesDistance = (
  userStrokes: readonly Stroke[],
  targetStrokes: readonly Stroke[]
): number => {
  const strokeDistances = userStrokes.map((uStroke, i) => {
    const resampledUser = resampleStroke(uStroke, RESAMPLE_SAMPLE_COUNT);
    const resampledTarget = resampleStroke(
      targetStrokes[i],
      RESAMPLE_SAMPLE_COUNT
    );
    return strokeDistance(resampledUser, resampledTarget);
  });
  const total = strokeDistances.reduce((acc, d) => acc + d, 0);
  return total / userStrokes.length;
};

export const recognizeKanaFromStrokes = (
  userStrokes: readonly Stroke[],
  candidates: readonly CandidateCharacter[]
): string | null => {
  if (userStrokes.length === 0) {
    return null;
  }
  const lengthMatches = candidates.filter(
    (c) => c.strokes.length === userStrokes.length
  );
  if (lengthMatches.length === 0) {
    return null;
  }
  const scored = lengthMatches.map((cand) => ({
    char: cand.char,
    distance: computeCharacterStrokesDistance(userStrokes, cand.strokes)
  }));
  const best = scored.reduce((min, curr) =>
    curr.distance < min.distance ? curr : min
  );
  return best.distance <= STROKE_MATCH_THRESHOLD ? best.char : null;
};
