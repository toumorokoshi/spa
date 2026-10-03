import { SentenceSubmissionResult } from '../types';

interface SubmissionModalProps {
  readonly result: SentenceSubmissionResult;
  readonly totalTargets: number;
  readonly onNextChallenge: () => void;
  readonly onClose: () => void;
}

export const SubmissionModal = ({
  result,
  totalTargets,
  onNextChallenge,
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
      </div>

      <div className="submission-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNextChallenge}
        >
          Next Challenge
        </button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Edit Sentence
        </button>
      </div>
    </div>
  </div>
);
