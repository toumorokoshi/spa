/* eslint-disable complexity */
import { describe, it, expect } from 'vitest';
import { parseScoreMatrix, serializeScoreMatrix } from './parser';
import { SAMPLE_8V8_CSV } from './sample-data';

describe('score matrix parser', () => {
  it('parses sample 8v8 CSV with headers', () => {
    const res = parseScoreMatrix(SAMPLE_8V8_CSV);
    expect(res.error).toBeNull();
    expect(res.matrix).not.toBeNull();
    expect(res.matrix?.namesA).toHaveLength(8);
    expect(res.matrix?.namesB).toHaveLength(8);
    expect(res.matrix?.namesA[0]).toBe('Alice');
    expect(res.matrix?.namesB[0]).toBe('Karl');
    expect(res.matrix?.scores[0][0]).toBe(12);
  });

  it('parses tab-separated data from spreadsheet copy-paste', () => {
    const tsvData = ['\tB1\tB2', 'A1\t10\t12', 'A2\t8\t10'].join('\n');
    const res = parseScoreMatrix(tsvData);
    expect(res.error).toBeNull();
    expect(res.matrix?.namesA).toEqual(['A1', 'A2']);
    expect(res.matrix?.namesB).toEqual(['B1', 'B2']);
    expect(res.matrix?.scores[0]).toEqual([10, 12]);
  });

  it('parses pure numeric matrix without headers', () => {
    const raw = ['10,12', '8,10'].join('\n');
    const res = parseScoreMatrix(raw);
    expect(res.error).toBeNull();
    expect(res.matrix?.namesA).toEqual(['A1', 'A2']);
    expect(res.matrix?.namesB).toEqual(['B1', 'B2']);
    expect(res.matrix?.scores[1]).toEqual([8, 10]);
  });

  it('rejects non-square matrix', () => {
    const raw = ['10,12,14', '8,10,12'].join('\n');
    const res = parseScoreMatrix(raw);
    expect(res.matrix).toBeNull();
    expect(res.error).toContain('Matrix must be square');
  });

  it('rejects out of bounds scores', () => {
    const raw = ['10,25', '8,10'].join('\n');
    const res = parseScoreMatrix(raw);
    expect(res.matrix).toBeNull();
    expect(res.error).toContain('Scores must be numbers between 0 and 20');
  });

  it('serializes matrix back to TSV format', () => {
    const res = parseScoreMatrix(SAMPLE_8V8_CSV);
    expect(res.matrix).not.toBeNull();
    if (!res.matrix) return;
    const serialized = serializeScoreMatrix(res.matrix, '\t');
    const reparsed = parseScoreMatrix(serialized);
    expect(reparsed.error).toBeNull();
    expect(reparsed.matrix?.scores).toEqual(res.matrix.scores);
  });
});
