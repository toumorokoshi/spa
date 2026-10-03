import { useState } from 'preact/hooks';
import {
  APP_TITLE,
  APP_SUBTITLE,
  FIRST_INDEX,
  TARGET_KANJI_COUNT
} from './constants';
import { getCharacterData } from './character-data';
import { matchStroke } from './stroke-matcher';
import { SHOP_ITEMS, getShopItemById } from './shop-data';
import { awardSentencePoints, purchaseItem, equipItem } from './shop-logic';
import { loadProfile, saveProfile } from './profile-storage';
import { loadConfig, saveConfig } from './config-storage';
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
  startNewChallenge,
  selectYearConfig,
  toggleKanjiSelection,
  selectRandomKanjiForYear,
  getKanjiYearOption,
  openConfiguration,
  closeConfiguration,
  updateConfig,
  startGameWithConfig
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
  KanjiConfigView,
  KanjiConfigViewProps
} from './components/kanji-config-view';
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

const PracticeToolbar = ({
  selectedYear,
  onOpenConfig
}: {
  readonly selectedYear: number;
  readonly onOpenConfig: () => void;
}) => (
  <div className="practice-toolbar">
    <span className="current-year-indicator">Year {selectedYear} Practice</span>
    <button type="button" className="btn-open-config" onClick={onOpenConfig}>
      ⚙️ Change Kanji
    </button>
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
  readonly onOpenConfig: () => void;
  readonly onNextChallenge: () => void;
  readonly onCloseSubmission: () => void;
}

interface WritingArenaProps {
  readonly charData: CharacterData;
  readonly completedStrokeIndices: readonly number[];
  readonly totalStrokes: number;
  readonly showGuide: boolean;
  readonly onClearInk: () => void;
  readonly onToggleGuide: () => void;
  readonly onStroke: (pts: readonly Point[], w: number, h: number) => void;
}

const WritingArenaSection = ({
  charData,
  completedStrokeIndices,
  totalStrokes,
  showGuide,
  onClearInk,
  onToggleGuide,
  onStroke
}: WritingArenaProps) => (
  <section className="writing-section" aria-label="Writing Arena">
    <CharacterStatus
      character={charData}
      completedCount={completedStrokeIndices.length}
      totalStrokes={totalStrokes}
      showGuide={showGuide}
      onClearCharacter={onClearInk}
      onToggleGuide={onToggleGuide}
    />
    <WritingCanvas
      targetStrokes={charData.strokes}
      completedStrokeIndices={completedStrokeIndices}
      showGuide={showGuide}
      onStrokeFinished={onStroke}
    />
  </section>
);

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
  onOpenConfig,
  onNextChallenge,
  onCloseSubmission
}: PracticeAreaProps) => (
  <div className="practice-container">
    <PracticeToolbar
      selectedYear={state.config.selectedYear}
      onOpenConfig={onOpenConfig}
    />

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
      selectedChar={state.selectedChar}
      onSelectChar={onSelectTarget}
    />

    <FeedbackBanner feedback={state.feedback} />

    <WritingArenaSection
      charData={charData}
      completedStrokeIndices={state.completedStrokeIndices}
      totalStrokes={totalStrokes}
      showGuide={state.showGuide}
      onClearInk={onClearInk}
      onToggleGuide={onToggleGuide}
      onStroke={onStroke}
    />

    {state.submissionResult ? (
      <SubmissionModal
        result={state.submissionResult}
        totalTargets={state.targetKanji.length}
        onNextChallenge={onNextChallenge}
        onReconfigure={onOpenConfig}
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
  readonly isConfiguring: boolean;
  readonly profile: PlayerProfile;
  readonly onPurchase: (item: ShopItem) => void;
  readonly onEquip: (itemId: string) => void;
  readonly configProps: KanjiConfigViewProps;
  readonly practiceProps: PracticeAreaProps;
}

const ActiveView = ({
  activeTab,
  isConfiguring,
  profile,
  onPurchase,
  onEquip,
  configProps,
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
  if (isConfiguring) {
    return <KanjiConfigView {...configProps} />;
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

const createConfigProps = (
  state: GameState,
  setState: (updater: (prev: GameState) => GameState) => void
): KanjiConfigViewProps => ({
  config: state.config,
  onSelectYear: (year) =>
    setState((prev) => {
      const nextConfig = selectYearConfig(prev.config, year);
      saveConfig(nextConfig);
      return updateConfig(prev, nextConfig);
    }),
  onToggleKanji: (char) =>
    setState((prev) => {
      const nextConfig = toggleKanjiSelection(prev.config, char);
      saveConfig(nextConfig);
      return updateConfig(prev, nextConfig);
    }),
  onPickRandom: () =>
    setState((prev) => {
      const randomKanji = selectRandomKanjiForYear(prev.config.selectedYear);
      const nextConfig = { ...prev.config, selectedKanji: randomKanji };
      saveConfig(nextConfig);
      return updateConfig(prev, nextConfig);
    }),
  onSelectFirst: () =>
    setState((prev) => {
      const option = getKanjiYearOption(prev.config.selectedYear);
      const nextConfig = {
        ...prev.config,
        selectedKanji: option.kanji.slice(FIRST_INDEX, TARGET_KANJI_COUNT)
      };
      saveConfig(nextConfig);
      return updateConfig(prev, nextConfig);
    }),
  onStartGame: () =>
    setState((prev) => {
      saveConfig(prev.config);
      return startGameWithConfig(prev, prev.config);
    }),
  onCancel: () => setState(closeConfiguration)
});

const useKanjiGame = (onAwardPoints: (points: number) => void) => {
  const [state, setState] = useState<GameState>(() =>
    createInitialGameState(loadConfig(), true)
  );
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

  const configProps = createConfigProps(state, setState);

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
    onOpenConfig: () => setState(openConfiguration),
    onNextChallenge: () => setState((prev) => startNewChallenge(prev)),
    onCloseSubmission: () =>
      setState((prev) => ({ ...prev, submissionResult: null }))
  };

  return { state, setState, configProps, practiceProps };
};

export const App = () => {
  const { profile, onPurchase, onEquip, onAwardPoints } = useProfile();
  const { state, setState, configProps, practiceProps } =
    useKanjiGame(onAwardPoints);
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
        isConfiguring={state.isConfiguring}
        profile={profile}
        onPurchase={onPurchase}
        onEquip={onEquip}
        configProps={configProps}
        practiceProps={practiceProps}
      />
    </main>
  );
};
