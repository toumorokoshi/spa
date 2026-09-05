import { JSX } from 'preact';
import { useMermaidEditor } from './lib/use-mermaid';
import { Editor } from './components/editor';
import { DiagramPreview } from './components/diagram-preview';

export const App = (): JSX.Element => {
  const {
    code,
    setCode,
    theme,
    setTheme,
    look,
    setLook,
    isCollapsed,
    toggleCollapse,
    renderResult,
    copiedLabel,
    selectPreset,
    clearCode,
    autoWrapAction,
    canAutoWrap,
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
        onAutoWrap={autoWrapAction}
        canAutoWrap={canAutoWrap}
      />
      <DiagramPreview
        renderResult={renderResult}
        theme={theme}
        onThemeChange={setTheme}
        look={look}
        onLookChange={setLook}
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
