import { FlashcardControls } from './flashcard-controls';
import { useFlashcardPractice } from './use-flashcard-practice';

export const App = () => {
  const {
    starredOnly,
    setStarredOnly,
    poolEmpty,
    word,
    isStarred,
    toggleStar,
    onNext
  } = useFlashcardPractice();

  return (
    <main>
      <h1>Random Japanese Flashcards</h1>
      <p className="hint">
        Read the kana aloud. Words are common spoken forms (mixed script).
      </p>
      <FlashcardControls
        starredOnly={starredOnly}
        onStarredOnlyChange={setStarredOnly}
        starPressed={isStarred}
        onStarToggle={toggleStar}
        starDisabled={poolEmpty}
      />
      <div className="card" lang="ja">
        {poolEmpty ? (
          <p className="empty-pool">
            Star at least one word (☆), or turn off &quot;Practice starred
            only&quot;.
          </p>
        ) : (
          <p className="kana" aria-live="polite">
            {word}
          </p>
        )}
      </div>
      <button
        type="button"
        className="next"
        onClick={onNext}
        disabled={poolEmpty}
      >
        Next card
      </button>
    </main>
  );
};
