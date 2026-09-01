import { useState, useEffect, useCallback } from 'preact/hooks';
import { DEFAULT_DIAGRAM_CODE, getPresetById } from './presets';
import { renderMermaid, RenderResult } from './renderer';
import { copyPng, copySvg, copyMarkdown, copyText } from './clipboard';
import {
  MermaidTheme,
  DiagramLook,
  DEFAULT_THEME,
  DEFAULT_LOOK
} from './theme';

const TOAST_DURATION_MS = 2000;

interface ClipboardActions {
  readonly copyPngAction: () => Promise<void>;
  readonly copySvgAction: () => Promise<void>;
  readonly copyMarkdownAction: () => Promise<void>;
  readonly copyCodeAction: () => Promise<void>;
}

const useClipboardActions = (
  code: string,
  renderResult: RenderResult,
  showToast: (label: string) => void
): ClipboardActions => {
  const copyPngAction = useCallback(async (): Promise<void> => {
    if (renderResult.ok && renderResult.svg) {
      const ok = await copyPng(renderResult.svg);
      if (ok) showToast('Copied PNG');
    }
  }, [renderResult, showToast]);

  const copySvgAction = useCallback(async (): Promise<void> => {
    if (renderResult.ok && renderResult.svg) {
      const ok = await copySvg(renderResult.svg);
      if (ok) showToast('Copied SVG');
    }
  }, [renderResult, showToast]);

  const copyMarkdownAction = useCallback(async (): Promise<void> => {
    const ok = await copyMarkdown(code);
    if (ok) showToast('Copied Markdown');
  }, [code, showToast]);

  const copyCodeAction = useCallback(async (): Promise<void> => {
    const ok = await copyText(code);
    if (ok) showToast('Copied Code');
  }, [code, showToast]);

  return {
    copyPngAction,
    copySvgAction,
    copyMarkdownAction,
    copyCodeAction
  };
};

export interface MermaidEditorState extends ClipboardActions {
  readonly code: string;
  readonly setCode: (code: string) => void;
  readonly theme: MermaidTheme;
  readonly setTheme: (theme: MermaidTheme) => void;
  readonly look: DiagramLook;
  readonly setLook: (look: DiagramLook) => void;
  readonly isCollapsed: boolean;
  readonly toggleCollapse: () => void;
  readonly renderResult: RenderResult;
  readonly copiedLabel: string | null;
  readonly selectPreset: (presetId: string) => void;
  readonly clearCode: () => void;
}

export const useMermaidEditor = (): MermaidEditorState => {
  const [code, setCode] = useState<string>(DEFAULT_DIAGRAM_CODE);
  const [theme, setTheme] = useState<MermaidTheme>(DEFAULT_THEME);
  const [look, setLook] = useState<DiagramLook>(DEFAULT_LOOK);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [renderResult, setRenderResult] = useState<RenderResult>({
    ok: true,
    svg: ''
  });
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const showToast = useCallback((label: string): void => {
    setCopiedLabel(label);
    setTimeout(() => {
      setCopiedLabel(null);
    }, TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    const active = { current: true };
    renderMermaid(code, { theme, look }).then((result) => {
      if (active.current) {
        setRenderResult(result);
      }
    });
    return () => {
      active.current = false;
    };
  }, [code, theme, look]);

  const toggleCollapse = useCallback(() => setIsCollapsed((prev) => !prev), []);
  const clearCode = useCallback(() => setCode(''), []);
  const selectPreset = useCallback((presetId: string): void => {
    const preset = getPresetById(presetId);
    if (preset) setCode(preset.code);
  }, []);

  const clipboardActions = useClipboardActions(code, renderResult, showToast);

  return {
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
    ...clipboardActions
  };
};
