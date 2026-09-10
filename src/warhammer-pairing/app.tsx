import { useState } from 'preact/hooks';
import type { FunctionalComponent } from 'preact';
import type { ScoreMatrix, Solution } from './lib/types';
import { SAMPLE_8V8_MATRIX, SAMPLE_4V4_MATRIX } from './lib/sample-data';
import { createSolver } from './lib/solver';
import { ScoreMatrixTable } from './components/score-matrix-table';
import { PasteModal } from './components/paste-modal';
import { SolutionOverview } from './components/solution-overview';
import { DraftAssistant } from './components/draft-assistant';
import { ExplanationGuide } from './components/explanation-guide';

export type TabType = 'matrix' | 'solution' | 'assistant' | 'guide';
const ASYNC_DELAY_MS = 10;

interface AppNavProps {
  readonly activeTab: TabType;
  readonly hasSolution: boolean;
  readonly onSelectTab: (tab: TabType) => void;
}

const AppNav: FunctionalComponent<AppNavProps> = ({
  activeTab,
  hasSolution,
  onSelectTab
}) => (
  <nav className="app-nav">
    <button
      className={`nav-btn ${activeTab === 'matrix' ? 'active' : ''}`}
      onClick={(): void => onSelectTab('matrix')}
    >
      Score Matrix
    </button>
    <button
      className={`nav-btn ${activeTab === 'solution' ? 'active' : ''}`}
      onClick={(): void => onSelectTab('solution')}
      disabled={!hasSolution}
    >
      Solution Analysis
    </button>
    <button
      className={`nav-btn ${activeTab === 'assistant' ? 'active' : ''}`}
      onClick={(): void => onSelectTab('assistant')}
    >
      Draft Assistant
    </button>
    <button
      className={`nav-btn ${activeTab === 'guide' ? 'active' : ''}`}
      onClick={(): void => onSelectTab('guide')}
    >
      About &amp; Guide
    </button>
  </nav>
);

interface AppHeaderProps {
  readonly activeTab: TabType;
  readonly hasSolution: boolean;
  readonly onSelectTab: (tab: TabType) => void;
}

const AppHeader: FunctionalComponent<AppHeaderProps> = ({
  activeTab,
  hasSolution,
  onSelectTab
}) => (
  <header className="app-header">
    <div className="header-brand">
      <a href="/spa/" className="back-link">
        ← Home
      </a>
      <div className="brand-text">
        <h1>Warhammer Pairing Solver</h1>
        <p>WTC 8v8 Team Draft Minimax Game-Theory Optimizer</p>
      </div>
    </div>
    <AppNav
      activeTab={activeTab}
      hasSolution={hasSolution}
      onSelectTab={onSelectTab}
    />
  </header>
);

interface TabContentProps {
  readonly activeTab: TabType;
  readonly matrix: ScoreMatrix;
  readonly solution: Solution | null;
  readonly isSolving: boolean;
  readonly onChangeMatrix: (m: ScoreMatrix) => void;
  readonly onSolve: () => void;
  readonly onLoad8v8: () => void;
  readonly onLoad4v4: () => void;
  readonly onOpenPaste: () => void;
  readonly onGoToDraft: () => void;
}

const TabContent: FunctionalComponent<TabContentProps> = ({
  activeTab,
  matrix,
  solution,
  isSolving,
  onChangeMatrix,
  onSolve,
  onLoad8v8,
  onLoad4v4,
  onOpenPaste,
  onGoToDraft
}) => {
  if (activeTab === 'matrix') {
    return (
      <ScoreMatrixTable
        matrix={matrix}
        onChangeMatrix={onChangeMatrix}
        onSolve={onSolve}
        onLoad8v8={onLoad8v8}
        onLoad4v4={onLoad4v4}
        onOpenPaste={onOpenPaste}
        isSolving={isSolving}
      />
    );
  }
  if (activeTab === 'solution' && solution) {
    return <SolutionOverview solution={solution} onGoToDraft={onGoToDraft} />;
  }
  if (activeTab === 'assistant') {
    return <DraftAssistant matrix={matrix} />;
  }
  return <ExplanationGuide />;
};

export const App: FunctionalComponent = () => {
  const [matrix, setMatrix] = useState<ScoreMatrix>(SAMPLE_8V8_MATRIX);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('matrix');
  const [isPasteModalOpen, setIsPasteModalOpen] = useState<boolean>(false);

  const handleSolve = (): void => {
    setIsSolving(true);
    setTimeout(() => {
      const solver = createSolver(matrix.scores);
      const sol = solver.solve(matrix.namesA, matrix.namesB);
      setSolution(sol);
      setIsSolving(false);
      setActiveTab('solution');
    }, ASYNC_DELAY_MS);
  };

  return (
    <div className="app-shell">
      <AppHeader
        activeTab={activeTab}
        hasSolution={solution !== null}
        onSelectTab={setActiveTab}
      />
      <main className="app-main">
        <TabContent
          activeTab={activeTab}
          matrix={matrix}
          solution={solution}
          isSolving={isSolving}
          onChangeMatrix={(m): void => {
            setMatrix(m);
            setSolution(null);
          }}
          onSolve={handleSolve}
          onLoad8v8={(): void => {
            setMatrix(SAMPLE_8V8_MATRIX);
            setSolution(null);
          }}
          onLoad4v4={(): void => {
            setMatrix(SAMPLE_4V4_MATRIX);
            setSolution(null);
          }}
          onOpenPaste={(): void => setIsPasteModalOpen(true)}
          onGoToDraft={(): void => setActiveTab('assistant')}
        />
      </main>

      <PasteModal
        isOpen={isPasteModalOpen}
        onClose={(): void => setIsPasteModalOpen(false)}
        onImport={(imported): void => {
          setMatrix(imported);
          setSolution(null);
        }}
      />
    </div>
  );
};
