import { JSX } from 'preact';
import { DIAGRAM_PRESETS } from '../lib/presets';

export interface EditorProps {
  readonly code: string;
  readonly onCodeChange: (code: string) => void;
  readonly isCollapsed: boolean;
  readonly onToggleCollapse: () => void;
  readonly onSelectPreset: (presetId: string) => void;
  readonly onClear: () => void;
}

interface CollapseButtonProps {
  readonly isCollapsed: boolean;
  readonly onToggle: () => void;
}

const CollapseButton = ({
  isCollapsed,
  onToggle
}: CollapseButtonProps): JSX.Element => {
  const label = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';
  const icon = isCollapsed ? '▶' : '◀';

  return (
    <button
      type="button"
      className="collapse-btn"
      onClick={onToggle}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
};

interface EditorControlsProps {
  readonly onSelectPreset: (presetId: string) => void;
  readonly onClear: () => void;
}

const EditorControls = ({
  onSelectPreset,
  onClear
}: EditorControlsProps): JSX.Element => {
  const handlePresetChange = (
    e: JSX.TargetedEvent<HTMLSelectElement>
  ): void => {
    const val = e.currentTarget.value;
    if (val) {
      onSelectPreset(val);
    }
  };

  return (
    <div className="editor-controls">
      <label htmlFor="preset-select" className="visually-hidden">
        Load Preset
      </label>
      <select
        id="preset-select"
        className="preset-select"
        onChange={handlePresetChange}
        defaultValue=""
        aria-label="Choose a diagram preset"
      >
        <option value="" disabled>
          Select a template...
        </option>
        {DIAGRAM_PRESETS.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="btn btn-secondary clear-btn"
        onClick={onClear}
        title="Clear editor"
        aria-label="Clear editor"
      >
        Clear
      </button>
    </div>
  );
};

interface EditorBodyProps {
  readonly code: string;
  readonly onCodeChange: (code: string) => void;
}

const EditorBody = ({ code, onCodeChange }: EditorBodyProps): JSX.Element => {
  const handleInput = (e: JSX.TargetedEvent<HTMLTextAreaElement>): void => {
    onCodeChange(e.currentTarget.value);
  };

  return (
    <div className="editor-body">
      <textarea
        className="code-textarea"
        value={code}
        onInput={handleInput}
        placeholder="Enter Mermaid diagram markup here..."
        spellcheck={false}
        aria-label="Mermaid diagram code"
      />
    </div>
  );
};

export const Editor = ({
  code,
  onCodeChange,
  isCollapsed,
  onToggleCollapse,
  onSelectPreset,
  onClear
}: EditorProps): JSX.Element => {
  const panelClass = isCollapsed ? 'editor-panel collapsed' : 'editor-panel';

  return (
    <aside className={panelClass} aria-label="Mermaid Diagram Editor">
      <div className="editor-header">
        <div className="editor-title-row">
          <h2 className="editor-title">Editor</h2>
          <CollapseButton
            isCollapsed={isCollapsed}
            onToggle={onToggleCollapse}
          />
        </div>
        {!isCollapsed && (
          <EditorControls onSelectPreset={onSelectPreset} onClear={onClear} />
        )}
      </div>
      {!isCollapsed && <EditorBody code={code} onCodeChange={onCodeChange} />}
    </aside>
  );
};
