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
import { SHOP_ITEMS, getShopItemById } from './shop-data';
import { awardSentencePoints, purchaseItem, equipItem } from './shop-logic';
import { loadProfile, saveProfile } from './profile-storage';
import {
  createInitialGameState,
  processStrokeResult,
  advanceSentence,
  resetCurrentCharacter,
  toggleGuide,
  switchTab
} from './game-logic';
import { TabNavigation } from './components/tab-navigation';
import { ShopView } from './components/shop-view';
import { SentenceDisplay } from './components/sentence-display';
import { CharacterStatus } from './components/character-status';
import { WritingCanvas } from './components/writing-canvas';
import { NavigationControls } from './components/navigation-controls';
import {
  CharacterData,
  FeedbackState,
  GameState,
  PlayerProfile,
  Point,
  SentencePrompt,
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
  readonly sentence: SentencePrompt;
  readonly charData: CharacterData;
  readonly totalStrokes: number;
  readonly state: GameState;
  readonly onStroke: (pts: readonly Point[], w: number, h: number) => void;
  readonly onClearCharacter: () => void;
  readonly onToggleGuide: () => void;
  readonly onPrevSentence: () => void;
  readonly onNextSentence: () => void;
}

const PracticeArea = ({
  sentence,
  charData,
  totalStrokes,
  state,
  onStroke,
  onClearCharacter,
  onToggleGuide,
  onPrevSentence,
  onNextSentence
}: PracticeAreaProps) => (
  <div className="practice-container">
    <SentenceDisplay
      sentence={sentence}
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
        onClearCharacter={onClearCharacter}
        onToggleGuide={onToggleGuide}
      />
      <WritingCanvas
        targetStrokes={charData.strokes}
        completedStrokeIndices={state.completedStrokeIndices}
        showGuide={state.showGuide}
        onStrokeFinished={onStroke}
      />
    </section>
    <NavigationControls
      currentSentenceIndex={state.sentenceIndex}
      totalSentences={SENTENCE_LIST.length}
      isSentenceComplete={state.isSentenceComplete}
      onPreviousSentence={onPrevSentence}
      onNextSentence={onNextSentence}
    />
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

const getCurrentChar = (sentence: SentencePrompt, charIndex: number): string =>
  sentence.text[charIndex] ?? sentence.text[0];

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

export const App = () => {
  const [state, setState] = useState<GameState>(createInitialGameState);
  const { profile, onPurchase, onEquip, onAwardPoints } = useProfile();

  const currentSentence = SENTENCE_LIST[state.sentenceIndex];
  const currentChar = getCurrentChar(currentSentence, state.charIndex);
  const charData = getCharacterData(currentChar);
  const totalStrokes = charData.strokes.length;
  const equippedItem = resolveEquippedItem(profile.equippedItemId);

  const handleStroke = (pts: readonly Point[], w: number, h: number) => {
    if (state.isSentenceComplete) return;
    const res = matchStroke(
      pts,
      w,
      h,
      charData.strokes,
      state.completedStrokeIndices.length
    );
    setState((prev) => {
      const next = processStrokeResult(
        prev,
        res,
        totalStrokes,
        currentSentence.text.length
      );
      if (next.isSentenceComplete && !prev.isSentenceComplete) {
        onAwardPoints(currentSentence.points);
      }
      return next;
    });
  };

  const practiceProps: PracticeAreaProps = {
    sentence: currentSentence,
    charData,
    totalStrokes,
    state,
    onStroke: handleStroke,
    onClearCharacter: () => setState(resetCurrentCharacter),
    onToggleGuide: () => setState(toggleGuide),
    onPrevSentence: () =>
      setState((prev) =>
        advanceSentence(prev, NAV_DIR_PREV, SENTENCE_LIST.length)
      ),
    onNextSentence: () =>
      setState((prev) =>
        advanceSentence(prev, NAV_DIR_NEXT, SENTENCE_LIST.length)
      )
  };

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
