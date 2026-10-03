import { CellEvaluation, SentenceSubmissionResult } from '../types';

interface StatsProps {
  readonly result: SentenceSubmissionResult;
  readonly totalTargets: number;
}

const CellEvaluationsBreakdown = ({
  evaluations
}: {
  readonly evaluations: readonly CellEvaluation[];
}) => {
  if (evaluations.length === 0) return null;
  return (
    <div className="evaluations-breakdown">
      <p className="evaluations-title">Characters Evaluated:</p>
      <div className="evaluations-chips">
        {evaluations.map((ev) => (
          <span
            key={ev.cellIndex}
            className={`eval-chip ${ev.isTargetKanji ? 'eval-kanji' : 'eval-kana'}`}
          >
            <span className="chip-cell">#{ev.cellIndex + 1}</span>
            <span className="chip-char">
              {ev.char ?? ev.recognizedKana ?? '✏️'}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

const SubmissionStats = ({ result, totalTargets }: StatsProps) => (
  <div className="submission-details">
    <p className="submission-sentence">
      Written Sentence: <strong>{result.sentenceText}</strong>
    </p>

    <div className="submission-stats">
      <div className="stat-box">
        <span className="stat-label">Target Kanji Used</span>
        <span className="stat-val">
          {result.usedTargetKanji.length} / {totalTargets}
        </span>
      </div>
      <div className="stat-box highlight">
        <span className="stat-label">Points Earned</span>
        <span className="stat-val">+{result.pointsAwarded} pts</span>
      </div>
    </div>

    {result.usedTargetKanji.length > 0 ? (
      <p className="used-kanji-list">
        Kanji matched: {result.usedTargetKanji.join(' ')}
      </p>
    ) : (
      <p className="used-kanji-list muted">
        No target kanji used in this sentence. Try including target kanji in
        your next sentence!
      </p>
    )}

    <CellEvaluationsBreakdown evaluations={result.cellEvaluations ?? []} />
  </div>
);

interface ActionProps {
  readonly onNextChallenge: () => void;
  readonly onReconfigure?: () => void;
  readonly onClose: () => void;
}

const SubmissionActions = ({
  onNextChallenge,
  onReconfigure,
  onClose
}: ActionProps) => (
  <div className="submission-actions">
    <button type="button" className="btn btn-primary" onClick={onNextChallenge}>
      Practice Again
    </button>
    {onReconfigure ? (
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onReconfigure}
      >
        ⚙️ Configure Kanji
      </button>
    ) : null}
    <button type="button" className="btn btn-secondary" onClick={onClose}>
      Edit Sentence
    </button>
  </div>
);

interface SubmissionModalProps {
  readonly result: SentenceSubmissionResult;
  readonly totalTargets: number;
  readonly onNextChallenge: () => void;
  readonly onReconfigure?: () => void;
  readonly onClose: () => void;
}

export const SubmissionModal = ({
  result,
  totalTargets,
  onNextChallenge,
  onReconfigure,
  onClose
}: SubmissionModalProps) => (
  <div
    className="submission-modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-label="Sentence Submission Results"
  >
    <div className="submission-card">
      <div className="submission-icon" aria-hidden="true">
        🎉
      </div>
      <h2>Sentence Submitted!</h2>
      <SubmissionStats result={result} totalTargets={totalTargets} />
      <SubmissionActions
        onNextChallenge={onNextChallenge}
        onReconfigure={onReconfigure}
        onClose={onClose}
      />
    </div>
  </div>
);
