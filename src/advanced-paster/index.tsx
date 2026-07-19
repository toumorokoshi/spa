import { h, render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import 'temml/dist/Temml-Local.css';
import { OutputColumn } from './components/OutputColumn';
import {
  convert,
  InputFormat,
  ClipboardDataPayload,
  ConvertedOutputs
} from './lib/converter';

const HEX_RADIX = 16;
const HEX_PAD_LEN = 4;
const CONTROL_MIN = 32;
const CONTROL_MID_START = 127;
const CONTROL_MID_END = 160;

const SPECIAL_CHARS: Record<number, { name: string; char: string }> = {
  0x200b: { name: 'Zero-Width Space (ZWSP)', char: '[ZWSP]' },
  0x200c: { name: 'Zero-Width Non-Joiner (ZWNJ)', char: '[ZWNJ]' },
  0x200d: { name: 'Zero-Width Joiner (ZWJ)', char: '[ZWJ]' },
  0x200e: { name: 'Left-to-Right Mark (LRM)', char: '[LRM]' },
  0x200f: { name: 'Right-to-Left Mark (RLM)', char: '[RLM]' },
  0xfeff: { name: 'Byte Order Mark (BOM)', char: '[BOM]' },
  0x2060: { name: 'Word Joiner (WJ)', char: '[WJ]' },
  0x00ad: { name: 'Soft Hyphen (SHY)', char: '[SHY]' },
  0x00a0: { name: 'Non-Breaking Space (NBSP)', char: '[NBSP]' },
  0x000a: { name: 'Newline (LF)', char: '\\n' },
  0x000d: { name: 'Carriage Return (CR)', char: '\\r' },
  0x0009: { name: 'Tab', char: '\\t' },
  0x0020: { name: 'Space', char: '[space]' }
};

const escapeInvisibleChars = (str: string | undefined): string => {
  if (!str) return '';
  return str
    .replace(/\u200b/g, '[ZWSP]')
    .replace(/\u200c/g, '[ZWNJ]')
    .replace(/\u200d/g, '[ZWJ]')
    .replace(/\u200e/g, '[LRM]')
    .replace(/\u200f/g, '[RLM]')
    .replace(/\ufeff/g, '[BOM]')
    .replace(/\u2060/g, '[WJ]')
    .replace(/\u00ad/g, '[SHY]')
    .replace(/\u00a0/g, '[NBSP]');
};

interface CharInfo {
  index: number;
  char: string;
  codePoint: string;
  name: string;
}

const isControlChar = (code: number): boolean =>
  code < CONTROL_MIN || (code >= CONTROL_MID_START && code < CONTROL_MID_END);

const getCharDetails = (
  char: string,
  code: number
): { name: string; char: string } => {
  if (SPECIAL_CHARS[code]) {
    return SPECIAL_CHARS[code];
  }
  if (isControlChar(code)) {
    return {
      name: 'Control Character',
      char: `[0x${code.toString(HEX_RADIX)}]`
    };
  }
  return {
    name: 'Character',
    char
  };
};

const analyzeCharacters = (str: string): CharInfo[] => {
  return str.split('').map((char, index) => {
    const codePointNum = char.charCodeAt(0);
    const hex = `U+${codePointNum
      .toString(HEX_RADIX)
      .toUpperCase()
      .padStart(HEX_PAD_LEN, '0')}`;
    const details = getCharDetails(char, codePointNum);
    return {
      index,
      char: details.char,
      codePoint: hex,
      name: details.name
    };
  });
};

interface OutputGridProps {
  plainText: string;
  html: string;
  markdown: string;
  plaintext: string;
  copyPlainText: (text: string) => void;
  copyRichText: (html: string) => void;
}

const OutputGrid = ({
  plainText,
  html,
  markdown,
  plaintext,
  copyPlainText,
  copyRichText
}: OutputGridProps) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        alignItems: 'stretch'
      }}
    >
      <OutputColumn
        title="Raw Format"
        content={plainText}
        onCopy={() => copyPlainText(plainText)}
      />
      <OutputColumn
        title="Rendered HTML"
        content={html}
        onCopy={() => copyRichText(html)}
        isHtmlRender
      />
      <OutputColumn
        title="HTML Source"
        content={html}
        onCopy={() => copyPlainText(html)}
      />
      <OutputColumn
        title="Markdown"
        content={markdown}
        onCopy={() => copyPlainText(markdown)}
      />
      <OutputColumn
        title="Plaintext"
        content={plaintext}
        onCopy={() => copyPlainText(plaintext)}
      />
    </div>
  );
};

interface DebugSectionProps {
  payload: ClipboardDataPayload;
  inspectTarget: 'plainText' | 'htmlText';
  setInspectTarget: (t: 'plainText' | 'htmlText') => void;
  copyPlainText: (text: string) => void;
  debugSteps?: Array<{ stepName: string; output: string }>;
}

const renderHtmlColumns = (
  htmlText: string | undefined,
  copyPlainText: (text: string) => void
) => {
  if (htmlText === undefined) {
    return null;
  }
  return [
    <OutputColumn
      key="html-unescaped"
      title="Raw htmlText (unescaped)"
      content={htmlText}
      onCopy={() => copyPlainText(htmlText)}
    />,
    <OutputColumn
      key="html-escaped"
      title="Raw htmlText (escaped)"
      content={escapeInvisibleChars(htmlText)}
      onCopy={() => copyPlainText(htmlText)}
    />
  ];
};

const renderInspectSelector = (
  htmlText: string | undefined,
  inspectTarget: 'plainText' | 'htmlText',
  setInspectTarget: (t: 'plainText' | 'htmlText') => void
) => {
  if (htmlText === undefined) {
    return null;
  }
  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <label style={{ display: 'flex', gap: '6px', cursor: 'pointer' }}>
        <input
          type="radio"
          name="inspectTargetSelect"
          checked={inspectTarget === 'plainText'}
          onChange={() => setInspectTarget('plainText')}
        />
        plainText
      </label>
      <label style={{ display: 'flex', gap: '6px', cursor: 'pointer' }}>
        <input
          type="radio"
          name="inspectTargetSelect"
          checked={inspectTarget === 'htmlText'}
          onChange={() => setInspectTarget('htmlText')}
        />
        htmlText
      </label>
    </div>
  );
};

const renderPipelineStepItem = (
  step: { stepName: string; output: string },
  idx: number
) => {
  return (
    <details
      key={idx}
      style={{
        border: '1px solid #eee',
        borderRadius: '4px',
        backgroundColor: '#fafafa'
      }}
    >
      <summary
        style={{
          padding: '10px 14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          userSelect: 'none',
          outline: 'none'
        }}
      >
        {step.stepName}
      </summary>
      <div
        style={{
          padding: '14px',
          borderTop: '1px solid #eee',
          backgroundColor: '#fff',
          maxHeight: '250px',
          overflowY: 'auto'
        }}
      >
        <pre
          style={{
            margin: 0,
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}
        >
          {step.output}
        </pre>
      </div>
    </details>
  );
};

const renderPipelineSteps = (
  debugSteps: Array<{ stepName: string; output: string }> | undefined
) => {
  if (!debugSteps || debugSteps.length === 0) {
    return null;
  }
  return (
    <div
      style={{
        marginTop: '32px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        marginBottom: '32px'
      }}
    >
      <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>
        HTML Conversion Pipeline Steps
      </h3>
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '16px' }}>
        View the raw intermediate output of each sequential step executed within
        the HTML conversion pipeline.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {debugSteps.map((step, idx) => renderPipelineStepItem(step, idx))}
      </div>
    </div>
  );
};

// eslint-disable-next-line max-lines-per-function
const DebugClipboardSection = ({
  payload,
  inspectTarget,
  setInspectTarget,
  copyPlainText,
  debugSteps
}: DebugSectionProps) => {
  return (
    <div
      style={{
        marginTop: '40px',
        borderTop: '2px solid #eee',
        paddingTop: '20px'
      }}
    >
      <h2 style={{ marginBottom: '8px' }}>Debug Clipboard Payload</h2>
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '16px' }}>
        Inspect raw clipboard payload (both unescaped and escaped) and view a
        character-by-character analysis.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
          alignItems: 'stretch'
        }}
      >
        <OutputColumn
          title="Raw plainText (unescaped)"
          content={payload.plainText}
          onCopy={() => copyPlainText(payload.plainText)}
        />
        <OutputColumn
          title="Raw plainText (escaped)"
          content={escapeInvisibleChars(payload.plainText)}
          onCopy={() => copyPlainText(payload.plainText)}
        />
        {renderHtmlColumns(payload.htmlText, copyPlainText)}
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            Character-by-Character Inspector
          </h3>
          {renderInspectSelector(
            payload.htmlText,
            inspectTarget,
            setInspectTarget
          )}
        </div>

        <div
          style={{
            maxHeight: '350px',
            overflowY: 'auto',
            border: '1px solid #eee',
            borderRadius: '4px',
            backgroundColor: '#fafafa'
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9rem',
              textAlign: 'left'
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#eee',
                  borderBottom: '2px solid #ddd'
                }}
              >
                <th style={{ padding: '8px 12px' }}>Index</th>
                <th style={{ padding: '8px 12px' }}>Glyph / Code Point</th>
                <th style={{ padding: '8px 12px' }}>Unicode Hex</th>
                <th style={{ padding: '8px 12px' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {analyzeCharacters(
                inspectTarget === 'htmlText'
                  ? payload.htmlText || ''
                  : payload.plainText
              ).map((c) => (
                <tr
                  key={c.index}
                  style={{
                    borderBottom: '1px solid #eee',
                    fontFamily: 'monospace',
                    backgroundColor: c.char.startsWith('[')
                      ? '#fff5f5'
                      : 'transparent'
                  }}
                >
                  <td style={{ padding: '6px 12px', color: '#888' }}>
                    {c.index}
                  </td>
                  <td
                    style={{
                      padding: '6px 12px',
                      fontWeight: 'bold',
                      color: c.char.startsWith('[') ? '#d9534f' : '#222'
                    }}
                  >
                    {c.char}
                  </td>
                  <td style={{ padding: '6px 12px', color: '#31708f' }}>
                    {c.codePoint}
                  </td>
                  <td style={{ padding: '6px 12px', color: '#555' }}>
                    {c.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {renderPipelineSteps(debugSteps)}
    </div>
  );
};

// eslint-disable-next-line max-lines-per-function
export const App = () => {
  const [formatOverride, setFormatOverride] = useState<InputFormat>('auto');
  const [inspectTarget, setInspectTarget] = useState<'plainText' | 'htmlText'>(
    'plainText'
  );
  const [payload, setPayload] = useState<ClipboardDataPayload>({
    plainText: ''
  });
  const [outputs, setOutputs] = useState<ConvertedOutputs>({
    html: '',
    markdown: '',
    plaintext: ''
  });

  useEffect(() => {
    if (payload.plainText || payload.htmlText) {
      setOutputs(convert(payload, formatOverride));
    } else {
      setOutputs({ html: '', markdown: '', plaintext: '' });
    }
  }, [payload, formatOverride]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return;

      if (e.clipboardData) {
        e.preventDefault();
        const plainText = e.clipboardData.getData('text/plain');
        const htmlText = e.clipboardData.getData('text/html');
        setPayload({ plainText, htmlText: htmlText || undefined });
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleTextareaPaste = (
    e: h.JSX.TargetedClipboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.clipboardData) {
      e.preventDefault();
      const plainText = e.clipboardData.getData('text/plain');
      const htmlText = e.clipboardData.getData('text/html');
      setPayload({ plainText, htmlText: htmlText || undefined });
    }
  };

  const copyRichText = async (html: string) => {
    try {
      const blobHtml = new Blob([html], { type: 'text/html' });
      const blobText = new Blob([outputs.plaintext], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText
        })
      ]);
      alert('Copied HTML as Rich Text!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy rich text.');
    }
  };

  const copyPlainText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '30px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <h1 style={{ marginBottom: '10px' }}>Advanced Paster</h1>
      <p style={{ color: '#555', marginBottom: '30px' }}>
        Paste anywhere on the page, or into the box below. It will be converted
        into multiple formats.
      </p>

      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}
      >
        <label htmlFor="formatSelect" style={{ fontWeight: '600' }}>
          Input Format:
        </label>
        <select
          id="formatSelect"
          value={formatOverride}
          onChange={(e) =>
            setFormatOverride(
              (e.target as HTMLSelectElement).value as InputFormat
            )
          }
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            background: '#fff'
          }}
        >
          <option value="auto">Auto-detect</option>
          <option value="html">HTML</option>
          <option value="markdown">Markdown</option>
          <option value="latex">LaTeX</option>
        </select>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <textarea
          style={{
            width: '100%',
            height: '150px',
            padding: '16px',
            borderRadius: '8px',
            border: '2px dashed #bbb',
            background: '#fafafa',
            fontSize: '1rem',
            fontFamily: 'monospace',
            resize: 'vertical'
          }}
          placeholder="Paste your content here..."
          onPaste={handleTextareaPaste}
          value={payload.plainText}
          onInput={(e) =>
            setPayload({
              plainText: (e.target as HTMLTextAreaElement).value,
              htmlText: undefined
            })
          }
        />
      </div>

      <OutputGrid
        plainText={payload.plainText}
        html={outputs.html}
        markdown={outputs.markdown}
        plaintext={outputs.plaintext}
        copyPlainText={copyPlainText}
        copyRichText={copyRichText}
      />

      <DebugClipboardSection
        payload={payload}
        inspectTarget={inspectTarget}
        setInspectTarget={setInspectTarget}
        copyPlainText={copyPlainText}
        debugSteps={outputs.debugSteps}
      />
    </div>
  );
};

const appElement = document.getElementById('app');
if (appElement) {
  render(<App />, appElement);
}
