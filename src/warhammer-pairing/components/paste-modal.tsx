import { useState } from 'preact/hooks';
import type { FunctionalComponent } from 'preact';
import { parseScoreMatrix } from '../lib/parser';
import type { ScoreMatrix } from '../lib/types';

const DEFAULT_ROWS = 8;

interface PasteModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onImport: (matrix: ScoreMatrix) => void;
}

export const PasteModal: FunctionalComponent<PasteModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [text, setText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInput = (e: Event): void => {
    const val = (e.target as HTMLTextAreaElement).value;
    setText(val);
    setParseError(val.trim().length > 0 ? parseScoreMatrix(val).error : null);
  };

  const handleImport = (): void => {
    const res = parseScoreMatrix(text);
    if (!res.matrix) {
      setParseError(res.error ?? 'Invalid input data.');
      return;
    }
    onImport(res.matrix);
    setText('');
    setParseError(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e): void => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Paste from Google Sheets or Excel</h3>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <p className="modal-desc">
          Paste TSV or CSV from Excel/Sheets. Rows: Team A, Cols: Team B,
          Scores: 0–20.
        </p>
        <textarea
          className="paste-textarea"
          value={text}
          onInput={handleInput}
          placeholder="Paste TSV or CSV here..."
          rows={DEFAULT_ROWS}
          autoFocus
        />
        {parseError && <div className="parse-error-banner">{parseError}</div>}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleImport}
            disabled={text.trim().length === 0 || parseError !== null}
          >
            Import Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
