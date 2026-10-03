interface NavigationControlsProps {
  readonly currentSentenceIndex: number;
  readonly totalSentences: number;
  readonly isSentenceComplete: boolean;
  readonly onPreviousSentence: () => void;
  readonly onNextSentence: () => void;
}

export const NavigationControls = ({
  currentSentenceIndex,
  totalSentences,
  isSentenceComplete,
  onPreviousSentence,
  onNextSentence
}: NavigationControlsProps) => {
  const sentenceNumber = currentSentenceIndex + 1;

  return (
    <div className="nav-controls">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onPreviousSentence}
        aria-label="Previous sentence"
      >
        ← Previous
      </button>

      <span className="sentence-indicator">
        Sentence {sentenceNumber} of {totalSentences}
      </span>

      <button
        type="button"
        className={`btn ${isSentenceComplete ? 'btn-primary' : 'btn-secondary'}`}
        onClick={onNextSentence}
        aria-label="Next sentence"
      >
        {isSentenceComplete ? 'Next Sentence →' : 'Skip →'}
      </button>
    </div>
  );
};
