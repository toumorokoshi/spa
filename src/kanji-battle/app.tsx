import { useState } from 'preact/hooks';
import {
  APP_TITLE,
  APP_SUBTITLE,
  NAV_DIR_PREV,
  NAV_DIR_NEXT
} from './constants';
import { SENTENCE_LIST } from './sentences-data';
import { getCharacterData } from './character-data';
import { matchStroke } from './stroke-matcher';
import {
  createInitialGameState,
  processStrokeResult,
  advanceSentence,
  resetCurrentCharacter,
  toggleGuide
} from './game-logic';
import { SentenceDisplay } from './components/sentence-display';
import { CharacterStatus } from './components/character-status';
import { WritingCanvas } from './components/writing-canvas';
import { NavigationControls } from './components/navigation-controls';
import { FeedbackState, GameState, Point } from './types';

const AppHeader = () => (
  <header className="game-header">
    <h1>{APP_TITLE}</h1>
    <p className="subtitle">{APP_SUBTITLE}</p>
  </header>
);

const FeedbackBanner = ({ feedback }: { readonly feedback: FeedbackState }) => (
  <div className={`feedback-banner feedback-${feedback.type}`} role="alert">
    <p>{feedback.message}</p>
  </div>
);

export const App = () => {
  const [state, setState] = useState<GameState>(createInitialGameState);

  const currentSentence = SENTENCE_LIST[state.sentenceIndex];
  const currentChar =
    currentSentence.text[state.charIndex] ?? currentSentence.text[0];
  const charData = getCharacterData(currentChar);
  const totalStrokes = charData.strokes.length;
  const currentExpectedStroke = state.completedStrokeIndices.length;

  const handleStroke = (pts: readonly Point[], w: number, h: number) => {
    if (state.isSentenceComplete) return;
    const res = matchStroke(pts, w, h, charData.strokes, currentExpectedStroke);
    setState((prev) =>
      processStrokeResult(prev, res, totalStrokes, currentSentence.text.length)
    );
  };

  return (
    <main className="kanji-battle-app">
      <AppHeader />
      <SentenceDisplay
        sentence={currentSentence}
        currentCharIndex={state.charIndex}
        isSentenceComplete={state.isSentenceComplete}
      />
      <FeedbackBanner feedback={state.feedback} />
      <section className="writing-section" aria-label="Writing Arena">
        <CharacterStatus
          character={charData}
          completedCount={state.completedStrokeIndices.length}
          totalStrokes={totalStrokes}
          showGuide={state.showGuide}
          isSentenceComplete={state.isSentenceComplete}
          onClearCharacter={() => setState(resetCurrentCharacter)}
          onToggleGuide={() => setState(toggleGuide)}
        />
        <WritingCanvas
          targetStrokes={charData.strokes}
          completedStrokeIndices={state.completedStrokeIndices}
          showGuide={state.showGuide}
          onStrokeFinished={handleStroke}
        />
      </section>
      <NavigationControls
        currentSentenceIndex={state.sentenceIndex}
        totalSentences={SENTENCE_LIST.length}
        isSentenceComplete={state.isSentenceComplete}
        onPreviousSentence={() =>
          setState((prev) =>
            advanceSentence(prev, NAV_DIR_PREV, SENTENCE_LIST.length)
          )
        }
        onNextSentence={() =>
          setState((prev) =>
            advanceSentence(prev, NAV_DIR_NEXT, SENTENCE_LIST.length)
          )
        }
      />
    </main>
  );
};
