import { useCallback, useState } from 'preact/hooks';
import { initialIndex, nextIndex } from './pick';
import { KANA_WORDS } from './words';

const wordCount = KANA_WORDS.length;

export const App = () => {
  const [index, setIndex] = useState(() =>
    initialIndex(wordCount, Math.random)
  );

  const onNext = useCallback(() => {
    setIndex((current) => nextIndex(wordCount, current, Math.random));
  }, []);

  const word = KANA_WORDS[index] ?? '';

  return (
    <main>
      <h1>Random Japanese Flashcards</h1>
      <p className="hint">
        Read the kana aloud. Words are common spoken forms (mixed script).
      </p>
      <div className="card" lang="ja">
        <p className="kana" aria-live="polite">
          {word}
        </p>
      </div>
      <button type="button" className="next" onClick={onNext}>
        Next card
      </button>
    </main>
  );
};
