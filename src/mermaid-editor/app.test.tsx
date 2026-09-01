import { render, fireEvent, waitFor } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App } from './app';
import mermaid from 'mermaid';

describe('Mermaid Editor App - Controls and Initial Render', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(mermaid, 'render').mockImplementation(async (_id, code) => {
      if (code.includes('invalid')) {
        throw new Error('Lexical error on line 2');
      }
      return {
        svg: '<svg id="diagram"><g><text>Flowchart</text></g></svg>',
        bindFunctions: undefined
      };
    });
  });

  it('renders editor and preview panels with initial controls', async () => {
    const { getByRole, getByLabelText, getByText } = render(<App />);

    expect(getByText('Editor')).toBeTruthy();
    expect(getByText('Preview')).toBeTruthy();

    const textarea = getByLabelText(
      'Mermaid diagram code'
    ) as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();
    expect(textarea.value).toContain('graph TD');

    expect(getByRole('button', { name: /collapse sidebar/i })).toBeTruthy();
    expect(getByRole('button', { name: /copy png/i })).toBeTruthy();
    expect(getByRole('button', { name: /copy svg/i })).toBeTruthy();
    expect(getByRole('button', { name: /copy markdown/i })).toBeTruthy();
    expect(getByRole('button', { name: /copy code/i })).toBeTruthy();
    expect(getByLabelText('Choose a diagram theme')).toBeTruthy();
    expect(getByLabelText('Choose a diagram style')).toBeTruthy();

    await waitFor(() => {
      expect(document.querySelector('.svg-viewport')).toBeTruthy();
    });
  });

  it('collapses and expands the editor sidebar', () => {
    const { getByRole } = render(<App />);
    const collapseBtn = getByRole('button', { name: /collapse sidebar/i });
    const editorPanel = document.querySelector('.editor-panel');

    expect(editorPanel?.classList.contains('collapsed')).toBe(false);

    fireEvent.click(collapseBtn);
    expect(editorPanel?.classList.contains('collapsed')).toBe(true);

    const expandBtn = getByRole('button', { name: /expand sidebar/i });
    fireEvent.click(expandBtn);
    expect(editorPanel?.classList.contains('collapsed')).toBe(false);
  });
});

describe('Mermaid Editor App - Actions and Presets', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(mermaid, 'render').mockImplementation(async (_id, code) => {
      if (code.includes('invalid')) {
        throw new Error('Lexical error on line 2');
      }
      return {
        svg: '<svg id="diagram"><g><text>Flowchart</text></g></svg>',
        bindFunctions: undefined
      };
    });
  });

  it('clears code when Clear button is clicked', () => {
    const { getByRole, getByLabelText } = render(<App />);
    const clearBtn = getByRole('button', { name: /clear editor/i });
    const textarea = getByLabelText(
      'Mermaid diagram code'
    ) as HTMLTextAreaElement;

    expect(textarea.value.length).toBeGreaterThan(0);
    fireEvent.click(clearBtn);
    expect(textarea.value).toBe('');
  });

  it('loads a selected preset template', () => {
    const { getByLabelText } = render(<App />);
    const select = getByLabelText(
      'Choose a diagram preset'
    ) as HTMLSelectElement;
    const textarea = getByLabelText(
      'Mermaid diagram code'
    ) as HTMLTextAreaElement;

    fireEvent.change(select, { target: { value: 'sequence' } });
    expect(textarea.value).toContain('sequenceDiagram');
  });
});

describe('Mermaid Editor App - Themes, Styles, and Errors', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(mermaid, 'render').mockImplementation(async (_id, code) => {
      if (code.includes('invalid')) {
        throw new Error('Lexical error on line 2');
      }
      return {
        svg: '<svg id="diagram"><g><text>Flowchart</text></g></svg>',
        bindFunctions: undefined
      };
    });
  });

  it('changes diagram theme when selected', async () => {
    const initSpy = vi.spyOn(mermaid, 'initialize');
    const { getByLabelText } = render(<App />);
    const themeSelect = getByLabelText(
      'Choose a diagram theme'
    ) as HTMLSelectElement;

    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    expect(themeSelect.value).toBe('dark');

    await waitFor(() => {
      expect(initSpy).toHaveBeenCalledWith(
        expect.objectContaining({ theme: 'dark' })
      );
    });
  });

  it('changes diagram style look when selected', async () => {
    const initSpy = vi.spyOn(mermaid, 'initialize');
    const { getByLabelText } = render(<App />);
    const lookSelect = getByLabelText(
      'Choose a diagram style'
    ) as HTMLSelectElement;

    fireEvent.change(lookSelect, { target: { value: 'handDrawn' } });
    expect(lookSelect.value).toBe('handDrawn');

    await waitFor(() => {
      expect(initSpy).toHaveBeenCalledWith(
        expect.objectContaining({ look: 'handDrawn' })
      );
    });
  });

  it('displays syntax error alert when mermaid fails to render', async () => {
    const { getByLabelText, findByRole } = render(<App />);
    const textarea = getByLabelText('Mermaid diagram code');

    fireEvent.input(textarea, { target: { value: 'invalid-syntax!!!' } });

    const errorAlert = await findByRole('alert');
    expect(errorAlert).toBeTruthy();
    expect(errorAlert.textContent).toContain('Lexical error');
  });
});
