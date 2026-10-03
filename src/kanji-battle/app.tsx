import { useState } from 'preact/hooks';
import { APP_TITLE, APP_SUBTITLE } from './constants';
import { getCharacterData } from './character-data';
import { matchStroke } from './stroke-matcher';
import { SHOP_ITEMS, getShopItemById } from './shop-data';
import { awardSentencePoints, purchaseItem, equipItem } from './shop-logic';
import { loadProfile, saveProfile } from './profile-storage';
import {
  createInitialGameState,
  processStrokeResult,
  resetCurrentCharacter,
  toggleGuide,
  switchTab,
  selectCell,
  setSelectedChar,
  clearCell,
  submitSentence,
  startNewChallenge
} from './game-logic';
import { TabNavigation } from './components/tab-navigation';
import { ShopView } from './components/shop-view';
import { CharacterStatus } from './components/character-status';
import { WritingCanvas } from './components/writing-canvas';
import { TargetKanjiBanner } from './components/target-kanji-banner';
import { VerticalSentenceGrid } from './components/vertical-sentence-grid';
import { CharacterPalette } from './components/character-palette';
import { SubmissionModal } from './components/submission-modal';
import {
  CharacterData,
  FeedbackState,
  GameState,
  PlayerProfile,
  Point,
  ShopItem
} from './types';

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

interface PracticeAreaProps {
  readonly state: GameState;
  readonly charData: CharacterData;
  readonly totalStrokes: number;
  readonly usedTargetsCount: number;
  readonly hasWrittenAny: boolean;
  readonly onSelectTarget: (char: string) => void;
  readonly onSelectCell: (index: number) => void;
  readonly onClearActiveCell: () => void;
  readonly onSubmitSentence: () => void;
  readonly onStroke: (pts: readonly Point[], w: number, h: number) => void;
  readonly onClearInk: () => void;
  readonly onToggleGuide: () => void;
  readonly onNextChallenge: () => void;
  readonly onCloseSubmission: () => void;
}

const PracticeArea = ({
  state,
  charData,
  totalStrokes,
  usedTargetsCount,
  hasWrittenAny,
  onSelectTarget,
  onSelectCell,
  onClearActiveCell,
  onSubmitSentence,
  onStroke,
  onClearInk,
  onToggleGuide,
  onNextChallenge,
  onCloseSubmission
}: PracticeAreaProps) => (
  <div className="practice-container">
    <TargetKanjiBanner
      targetKanji={state.targetKanji}
      gridCells={state.gridCells}
      selectedChar={state.selectedChar}
      onSelectTarget={onSelectTarget}
    />

    <VerticalSentenceGrid
      cells={state.gridCells}
      activeCellIndex={state.activeCellIndex}
      usedCount={usedTargetsCount}
      totalTargets={state.targetKanji.length}
      hasWrittenAny={hasWrittenAny}
      onSelectCell={onSelectCell}
      onClearActiveCell={onClearActiveCell}
      onSubmitSentence={onSubmitSentence}
    />

    <CharacterPalette
      targetKanji={state.targetKanji}
      selectedChar={state.selectedChar}
      onSelectChar={onSelectTarget}
    />

    <FeedbackBanner feedback={state.feedback} />

    <section className="writing-section" aria-label="Writing Arena">
      <CharacterStatus
        character={charData}
        completedCount={state.completedStrokeIndices.length}
        totalStrokes={totalStrokes}
        showGuide={state.showGuide}
        onClearCharacter={onClearInk}
        onToggleGuide={onToggleGuide}
      />
      <WritingCanvas
        targetStrokes={charData.strokes}
        completedStrokeIndices={state.completedStrokeIndices}
        showGuide={state.showGuide}
        onStrokeFinished={onStroke}
      />
    </section>

    {state.submissionResult ? (
      <SubmissionModal
        result={state.submissionResult}
        totalTargets={state.targetKanji.length}
        onNextChallenge={onNextChallenge}
        onClose={onCloseSubmission}
      />
    ) : null}
  </div>
);

const useProfile = () => {
  const [profile, setProfile] = useState<PlayerProfile>(loadProfile);

  const onPurchase = (item: ShopItem) => {
    setProfile((prev) => {
      const next = purchaseItem(prev, item);
      saveProfile(next);
      return next;
    });
  };

  const onEquip = (itemId: string) => {
    setProfile((prev) => {
      const next = equipItem(prev, itemId);
      saveProfile(next);
      return next;
    });
  };

  const onAwardPoints = (points: number) => {
    setProfile((prev) => {
      const next = awardSentencePoints(prev, points);
      saveProfile(next);
      return next;
    });
  };

  return { profile, onPurchase, onEquip, onAwardPoints };
};

const resolveEquippedItem = (id: string | null): ShopItem | null => {
  if (!id) return null;
  return getShopItemById(id) ?? null;
};

interface ActiveViewProps {
  readonly activeTab: 'practice' | 'shop';
  readonly profile: PlayerProfile;
  readonly onPurchase: (item: ShopItem) => void;
  readonly onEquip: (itemId: string) => void;
  readonly practiceProps: PracticeAreaProps;
}

const ActiveView = ({
  activeTab,
  profile,
  onPurchase,
  onEquip,
  practiceProps
}: ActiveViewProps) => {
  if (activeTab === 'shop') {
    return (
      <ShopView
        items={SHOP_ITEMS}
        profile={profile}
        onPurchase={onPurchase}
        onEquip={onEquip}
      />
    );
  }
  return <PracticeArea {...practiceProps} />;
};

const computeGridStats = (state: GameState) => {
  const writtenChars = state.gridCells
    .map((c) => c.char)
    .filter((c): c is string => c !== null);
  const usedTargetsCount = state.targetKanji.filter((t) =>
    writtenChars.includes(t.char)
  ).length;
  const hasWrittenAny = writtenChars.length > 0;
  return { usedTargetsCount, hasWrittenAny };
};

const useKanjiGame = (onAwardPoints: (points: number) => void) => {
  const [state, setState] = useState<GameState>(createInitialGameState);
  const charData = getCharacterData(state.selectedChar);
  const totalStrokes = charData.strokes.length;
  const { usedTargetsCount, hasWrittenAny } = computeGridStats(state);

  const handleStroke = (pts: readonly Point[], w: number, h: number) => {
    const res = matchStroke(
      pts,
      w,
      h,
      charData.strokes,
      state.completedStrokeIndices.length
    );
    setState((prev) => processStrokeResult(prev, res, totalStrokes));
  };

  const handleSubmit = () => {
    setState((prev) => {
      const next = submitSentence(prev);
      if (next.submissionResult && next.submissionResult.pointsAwarded > 0) {
        onAwardPoints(next.submissionResult.pointsAwarded);
      }
      return next;
    });
  };

  const practiceProps: PracticeAreaProps = {
    state,
    charData,
    totalStrokes,
    usedTargetsCount,
    hasWrittenAny,
    onSelectTarget: (char) => setState((prev) => setSelectedChar(prev, char)),
    onSelectCell: (idx) => setState((prev) => selectCell(prev, idx)),
    onClearActiveCell: () =>
      setState((prev) => clearCell(prev, prev.activeCellIndex)),
    onSubmitSentence: handleSubmit,
    onStroke: handleStroke,
    onClearInk: () => setState(resetCurrentCharacter),
    onToggleGuide: () => setState(toggleGuide),
    onNextChallenge: () => setState((prev) => startNewChallenge(prev)),
    onCloseSubmission: () =>
      setState((prev) => ({ ...prev, submissionResult: null }))
  };

  return { state, setState, practiceProps };
};

export const App = () => {
  const { profile, onPurchase, onEquip, onAwardPoints } = useProfile();
  const { state, setState, practiceProps } = useKanjiGame(onAwardPoints);
  const equippedItem = resolveEquippedItem(profile.equippedItemId);

  return (
    <main className="kanji-battle-app">
      <AppHeader />
      <TabNavigation
        activeTab={state.activeTab}
        points={profile.points}
        equippedItem={equippedItem}
        onTabChange={(tab) => setState((prev) => switchTab(prev, tab))}
      />
      <ActiveView
        activeTab={state.activeTab}
        profile={profile}
        onPurchase={onPurchase}
        onEquip={onEquip}
        practiceProps={practiceProps}
      />
    </main>
  );
};
