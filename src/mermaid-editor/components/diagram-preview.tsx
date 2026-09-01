import { JSX } from 'preact';
import { RenderResult } from '../lib/renderer';

export interface DiagramPreviewProps {
  readonly renderResult: RenderResult;
  readonly onCopyPng: () => void;
  readonly onCopySvg: () => void;
  readonly onCopyMarkdown: () => void;
  readonly onCopyCode: () => void;
  readonly copiedLabel: string | null;
  readonly hasContent: boolean;
}

interface PreviewHeaderProps {
  readonly onCopyPng: () => void;
  readonly onCopySvg: () => void;
  readonly onCopyMarkdown: () => void;
  readonly onCopyCode: () => void;
  readonly copiedLabel: string | null;
  readonly isRenderSuccess: boolean;
  readonly hasContent: boolean;
}

const PreviewHeader = ({
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
      {copiedLabel && (
        <span className="copy-toast" role="status" aria-live="polite">
          ✓ {copiedLabel}
        </span>
      )}
    </div>
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
  </header>
);

interface PreviewContentProps {
  readonly renderResult: RenderResult;
  readonly isRenderSuccess: boolean;
}

const PreviewContent = ({
  renderResult,
  isRenderSuccess
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
    return (
      <div
        className="svg-viewport"
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
        />
      </div>
    </main>
  );
};
