import { JSX } from 'preact';
import { RenderResult } from '../lib/renderer';
import { MermaidTheme, MERMAID_THEMES, isMermaidTheme } from '../lib/theme';

export interface DiagramPreviewProps {
  readonly renderResult: RenderResult;
  readonly theme: MermaidTheme;
  readonly onThemeChange: (theme: MermaidTheme) => void;
  readonly onCopyPng: () => void;
  readonly onCopySvg: () => void;
  readonly onCopyMarkdown: () => void;
  readonly onCopyCode: () => void;
  readonly copiedLabel: string | null;
  readonly hasContent: boolean;
}

interface ThemeSelectorProps {
  readonly theme: MermaidTheme;
  readonly onThemeChange: (theme: MermaidTheme) => void;
}

const ThemeSelector = ({
  theme,
  onThemeChange
}: ThemeSelectorProps): JSX.Element => {
  const handleThemeSelect = (e: JSX.TargetedEvent<HTMLSelectElement>): void => {
    const val = e.currentTarget.value;
    if (isMermaidTheme(val)) {
      onThemeChange(val);
    }
  };

  return (
    <div className="theme-selector-wrap">
      <label htmlFor="theme-select" className="theme-label">
        Theme:
      </label>
      <select
        id="theme-select"
        className="theme-select"
        value={theme}
        onChange={handleThemeSelect}
        aria-label="Choose a diagram theme"
      >
        {MERMAID_THEMES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface PreviewActionsProps {
  readonly onCopyPng: () => void;
  readonly onCopySvg: () => void;
  readonly onCopyMarkdown: () => void;
  readonly onCopyCode: () => void;
  readonly isRenderSuccess: boolean;
  readonly hasContent: boolean;
}

const PreviewActions = ({
  onCopyPng,
  onCopySvg,
  onCopyMarkdown,
  onCopyCode,
  isRenderSuccess,
  hasContent
}: PreviewActionsProps): JSX.Element => (
  <div className="preview-actions">
    <button
      type="button"
      className="btn btn-primary"
      onClick={onCopyPng}
      disabled={!isRenderSuccess}
      title="Copy as PNG Image"
    >
      Copy PNG
    </button>
    <button
      type="button"
      className="btn btn-secondary"
      onClick={onCopySvg}
      disabled={!isRenderSuccess}
      title="Copy SVG"
    >
      Copy SVG
    </button>
    <button
      type="button"
      className="btn btn-secondary"
      onClick={onCopyMarkdown}
      disabled={!hasContent}
      title="Copy as Markdown codeblock"
    >
      Copy Markdown
    </button>
    <button
      type="button"
      className="btn btn-secondary"
      onClick={onCopyCode}
      disabled={!hasContent}
      title="Copy raw Mermaid code"
    >
      Copy Code
    </button>
  </div>
);

interface PreviewHeaderProps {
  readonly theme: MermaidTheme;
  readonly onThemeChange: (theme: MermaidTheme) => void;
  readonly onCopyPng: () => void;
  readonly onCopySvg: () => void;
  readonly onCopyMarkdown: () => void;
  readonly onCopyCode: () => void;
  readonly copiedLabel: string | null;
  readonly isRenderSuccess: boolean;
  readonly hasContent: boolean;
}

const PreviewHeader = ({
  theme,
  onThemeChange,
  onCopyPng,
  onCopySvg,
  onCopyMarkdown,
  onCopyCode,
  copiedLabel,
  isRenderSuccess,
  hasContent
}: PreviewHeaderProps): JSX.Element => (
  <header className="preview-header">
    <div className="preview-title-row">
      <h2 className="preview-title">Preview</h2>
      <ThemeSelector theme={theme} onThemeChange={onThemeChange} />
      {copiedLabel && (
        <span className="copy-toast" role="status" aria-live="polite">
          ✓ {copiedLabel}
        </span>
      )}
    </div>
    <PreviewActions
      onCopyPng={onCopyPng}
      onCopySvg={onCopySvg}
      onCopyMarkdown={onCopyMarkdown}
      onCopyCode={onCopyCode}
      isRenderSuccess={isRenderSuccess}
      hasContent={hasContent}
    />
  </header>
);

interface PreviewContentProps {
  readonly renderResult: RenderResult;
  readonly isRenderSuccess: boolean;
  readonly isDarkTheme: boolean;
}

const PreviewContent = ({
  renderResult,
  isRenderSuccess,
  isDarkTheme
}: PreviewContentProps): JSX.Element => {
  if (!renderResult.ok) {
    return (
      <div className="error-banner" role="alert">
        <h3 className="error-title">Diagram Syntax Error</h3>
        <pre className="error-message">{renderResult.error}</pre>
      </div>
    );
  }

  if (isRenderSuccess) {
    const viewportClass = isDarkTheme
      ? 'svg-viewport theme-dark'
      : 'svg-viewport';
    return (
      <div
        className={viewportClass}
        dangerouslySetInnerHTML={{ __html: renderResult.svg }}
      />
    );
  }

  return (
    <div className="empty-state">
      <p>Enter Mermaid syntax in the editor to render a diagram.</p>
    </div>
  );
};

export const DiagramPreview = ({
  renderResult,
  theme,
  onThemeChange,
  onCopyPng,
  onCopySvg,
  onCopyMarkdown,
  onCopyCode,
  copiedLabel,
  hasContent
}: DiagramPreviewProps): JSX.Element => {
  const isRenderSuccess = renderResult.ok && renderResult.svg.length > 0;

  return (
    <main className="preview-panel" aria-label="Mermaid Diagram Preview">
      <PreviewHeader
        theme={theme}
        onThemeChange={onThemeChange}
        onCopyPng={onCopyPng}
        onCopySvg={onCopySvg}
        onCopyMarkdown={onCopyMarkdown}
        onCopyCode={onCopyCode}
        copiedLabel={copiedLabel}
        isRenderSuccess={isRenderSuccess}
        hasContent={hasContent}
      />
      <div className="preview-content">
        <PreviewContent
          renderResult={renderResult}
          isRenderSuccess={isRenderSuccess}
          isDarkTheme={theme === 'dark'}
        />
      </div>
    </main>
  );
};
