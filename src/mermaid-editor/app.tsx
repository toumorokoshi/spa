import { JSX } from 'preact';
import { useMermaidEditor } from './lib/use-mermaid';
import { Editor } from './components/editor';
import { DiagramPreview } from './components/diagram-preview';

export const App = (): JSX.Element => {
  const {
    code,
    setCode,
    isCollapsed,
    toggleCollapse,
    renderResult,
    copiedLabel,
    selectPreset,
    clearCode,
    copyPngAction,
    copySvgAction,
    copyMarkdownAction,
    copyCodeAction
  } = useMermaidEditor();

  return (
    <div className="mermaid-app-layout">
      <Editor
        code={code}
        onCodeChange={setCode}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        onSelectPreset={selectPreset}
        onClear={clearCode}
      />
      <DiagramPreview
        renderResult={renderResult}
        onCopyPng={copyPngAction}
        onCopySvg={copySvgAction}
        onCopyMarkdown={copyMarkdownAction}
        onCopyCode={copyCodeAction}
        copiedLabel={copiedLabel}
        hasContent={code.trim().length > 0}
      />
    </div>
  );
};
