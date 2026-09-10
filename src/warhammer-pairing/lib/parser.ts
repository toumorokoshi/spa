import type { ScoreMatrix } from './types';

const MIN_SCORE = 0;
const MAX_SCORE = 20;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 16;

export interface ParseResult {
  readonly matrix: ScoreMatrix | null;
  readonly error: string | null;
}

const detectDelimiter = (text: string): string => {
  const firstLine = text.split('\n')[0] ?? '';
  if (firstLine.includes('\t')) return '\t';
  if (firstLine.includes(';')) return ';';
  return ',';
};

const splitRows = (
  text: string,
  delimiter: string
): readonly (readonly string[])[] => {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\r$/, ''))
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split(delimiter).map((cell) => cell.trim()));
};

const isNumericCell = (cell: string): boolean => {
  const trimmed = cell.trim();
  return trimmed.length > 0 && !Number.isNaN(Number(trimmed));
};

const isNumericRow = (row: readonly string[]): boolean => {
  return row.length > 0 && row.every(isNumericCell);
};

const parseScoreCell = (cell: string): number | null => {
  if (!isNumericCell(cell)) return null;
  const num = Number(cell);
  if (num < MIN_SCORE || num > MAX_SCORE) {
    return null;
  }
  return num;
};

interface MatrixComponents {
  readonly namesA: readonly string[];
  readonly namesB: readonly string[];
  readonly scores: readonly (readonly number[])[];
}

const parseWithHeaders = (
  rawRows: readonly (readonly string[])[]
): MatrixComponents | null => {
  const headerRow = rawRows[0];
  const hasLeadingCorner = !isNumericCell(headerRow[0]);
  const namesB = (hasLeadingCorner ? headerRow.slice(1) : headerRow).filter(
    (n) => n.length > 0
  );

  const dataRows = rawRows.slice(1);
  const namesA = dataRows.map((r, i) =>
    hasLeadingCorner && r[0].length > 0 ? r[0] : `A${i + 1}`
  );

  const scores: number[][] = [];
  const isValid = dataRows.every((r) => {
    const cells = hasLeadingCorner ? r.slice(1) : r;
    if (cells.length < namesB.length) return false;
    const parsedRow: number[] = [];
    const rowValid = cells.slice(0, namesB.length).every((c) => {
      const s = parseScoreCell(c);
      if (s === null) return false;
      parsedRow.push(s);
      return true;
    });
    if (rowValid) scores.push(parsedRow);
    return rowValid;
  });

  return isValid ? { namesA, namesB, scores } : null;
};

const parsePureNumbers = (
  rawRows: readonly (readonly string[])[]
): MatrixComponents | null => {
  const colCount = rawRows[0].length;
  const scores: number[][] = [];
  const isValid = rawRows.every((r) => {
    if (r.length !== colCount) return false;
    const parsedRow: number[] = [];
    const rowValid = r.every((c) => {
      const s = parseScoreCell(c);
      if (s === null) return false;
      parsedRow.push(s);
      return true;
    });
    if (rowValid) scores.push(parsedRow);
    return rowValid;
  });

  if (!isValid) return null;
  const namesA = Array.from({ length: rawRows.length }, (_, i) => `A${i + 1}`);
  const namesB = Array.from({ length: colCount }, (_, j) => `B${j + 1}`);
  return { namesA, namesB, scores };
};

const isCountInRange = (count: number): boolean =>
  count >= MIN_PLAYERS && count <= MAX_PLAYERS;

const validatePlayerCounts = (
  countA: number,
  countB: number
): string | null => {
  if (!isCountInRange(countA) || !isCountInRange(countB)) {
    return `Matrix size must be between ${MIN_PLAYERS} and ${MAX_PLAYERS} players per side.`;
  }
  if (countA !== countB) {
    return `Matrix must be square: Team A has ${countA} players, Team B has ${countB}.`;
  }
  return null;
};

const validateComponents = (comp: MatrixComponents): string | null => {
  const countErr = validatePlayerCounts(comp.namesA.length, comp.namesB.length);
  if (countErr) return countErr;
  if (comp.scores.length !== comp.namesA.length) {
    return 'Scores row count does not match Team A players.';
  }
  return null;
};

const sanitizeInputText = (text: string): string => {
  return text.replace(/^[\r\n]+/, '').replace(/[\r\n\s]+$/, '');
};

const extractRows = (
  rawText: string
): readonly (readonly string[])[] | null => {
  const sanitized = sanitizeInputText(rawText);
  if (sanitized.length === 0) return null;
  const delimiter = detectDelimiter(sanitized);
  const rows = splitRows(sanitized, delimiter);
  return rows.length === 0 ? null : rows;
};

export const parseScoreMatrix = (rawText: string): ParseResult => {
  const rows = extractRows(rawText);
  if (!rows) {
    return { matrix: null, error: 'Input text contains no valid data rows.' };
  }

  const parsed = isNumericRow(rows[0])
    ? parsePureNumbers(rows)
    : parseWithHeaders(rows);

  if (!parsed) {
    return {
      matrix: null,
      error: 'Failed to parse scores. Scores must be numbers between 0 and 20.'
    };
  }

  const validationError = validateComponents(parsed);
  if (validationError) {
    return { matrix: null, error: validationError };
  }

  return {
    matrix: {
      namesA: parsed.namesA,
      namesB: parsed.namesB,
      scores: parsed.scores
    },
    error: null
  };
};

export const serializeScoreMatrix = (
  matrix: ScoreMatrix,
  delimiter = '\t'
): string => {
  const header = ['', ...matrix.namesB].join(delimiter);
  const rows = matrix.namesA.map((nameA, i) =>
    [nameA, ...matrix.scores[i]].join(delimiter)
  );
  return [header, ...rows].join('\n');
};
