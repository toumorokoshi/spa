import { parseScoreMatrix } from './parser';
import type { ScoreMatrix } from './types';

export const SAMPLE_8V8_CSV = `,Karl,Ludwig,Mannfred,Nagash,Orion,Phoenix,Queek,Rakarth
Alice,12,8,10,14,9,11,7,13
Bruno,6,11,9,13,12,8,14,10
Clara,15,7,10,8,11,13,9,6
Dieter,9,12,11,10,14,7,8,15
Elke,10,14,8,9,7,12,11,13
Franz,13,9,12,7,10,14,6,11
Greta,8,10,14,11,13,9,12,7
Hans,11,13,7,12,8,10,15,9`;

export const SAMPLE_4V4_CSV = `,Karl,Ludwig,Mannfred,Nagash
Alice,12,8,10,14
Bruno,6,11,9,13
Clara,15,7,10,8
Dieter,9,12,11,10`;

const parsed8v8 = parseScoreMatrix(SAMPLE_8V8_CSV);
const parsed4v4 = parseScoreMatrix(SAMPLE_4V4_CSV);

if (!parsed8v8.matrix || !parsed4v4.matrix) {
  throw new Error('Failed to parse built-in sample matrices');
}

export const SAMPLE_8V8_MATRIX: ScoreMatrix = parsed8v8.matrix;
export const SAMPLE_4V4_MATRIX: ScoreMatrix = parsed4v4.matrix;
