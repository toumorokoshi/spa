/* eslint-disable complexity, max-lines-per-function */
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

interface TextTypeBannerProps {
  detectedFormat?: string;
  explanation?: string;
  selectedFormat: InputFormat;
}

const TextTypeBanner = ({
  detectedFormat,
  explanation,
  selectedFormat
}: TextTypeBannerProps) => {
  const badgeColor =
    detectedFormat === 'html'
      ? '#28a745'
      : detectedFormat === 'latex'
        ? '#6f42c1'
        : '#007bff';

  return (
    <div
      style={{
        backgroundColor: '#eef6ff',
        border: '1px solid #b6d4fe',
        borderRadius: '8px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{ fontWeight: 'bold', fontSize: '1rem', color: '#1a1a2e' }}
          >
            Detected Input Type:
          </span>
          <span
            style={{
              backgroundColor: badgeColor,
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              textTransform: 'uppercase'
            }}
          >
            {detectedFormat || 'Unknown'}
          </span>
          {selectedFormat !== 'auto' && (
            <span style={{ color: '#666', fontSize: '0.85rem' }}>
              (Override active: <strong>{selectedFormat}</strong>)
            </span>
          )}
        </div>
        {explanation && (
          <p style={{ margin: '6px 0 0 0', color: '#444', fontSize: '0.9rem' }}>
            {explanation}
          </p>
        )}
      </div>
    </div>
  );
};

interface RawInputsRowProps {
  payload: ClipboardDataPayload;
  copyPlainText: (text: string) => void;
}

const RawInputsRow = ({ payload, copyPlainText }: RawInputsRowProps) => {
  const hasHtml = Boolean(payload.htmlText && payload.htmlText.length > 0);

  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#222' }}>
        Raw Clipboard Inputs
      </h2>
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '16px' }}>
        Inspect the exact raw input streams received from the clipboard. If HTML
        content was pasted, the raw HTML markup is displayed alongside raw plain
        text.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: hasHtml
            ? 'repeat(auto-fit, minmax(320px, 1fr))'
            : '1fr',
          gap: '20px',
          alignItems: 'stretch'
        }}
      >
        <OutputColumn
          title="Raw Plain Text (plainText)"
          content={payload.plainText || '(Empty)'}
          onCopy={() => copyPlainText(payload.plainText || '')}
        />

        {hasHtml && (
          <OutputColumn
            title="Raw HTML Source (htmlText)"
            content={payload.htmlText || ''}
            onCopy={() => copyPlainText(payload.htmlText || '')}
          />
        )}
      </div>
    </div>
  );
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
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#222' }}>
        Converted Output Formats
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}
      >
        <OutputColumn
          title="Raw Input Format"
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
    </div>
  );
};

interface DebugPipelineProps {
  debugSteps?: Array<{ stepName: string; output: string }>;
}

const DebugPipeline = ({ debugSteps }: DebugPipelineProps) => {
  if (!debugSteps || debugSteps.length === 0) return null;

  return (
    <div
      style={{
        marginTop: '32px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        marginBottom: '32px'
      }}
    >
      <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#222' }}>
        Debug Pipeline Transformation Stages
      </h2>
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
        Inspect how the input text is transformed step-by-step through every
        stage of the curated pipeline.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {debugSteps.map((step, idx) => (
          <details
            key={idx}
            open={idx === 0 || idx === debugSteps.length - 1}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              backgroundColor: '#fafafa'
            }}
          >
            <summary
              style={{
                padding: '12px 16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                userSelect: 'none',
                outline: 'none',
                color: '#333'
              }}
            >
              {step.stepName}
            </summary>
            <div
              style={{
                padding: '16px',
                borderTop: '1px solid #eee',
                backgroundColor: '#fff',
                maxHeight: '300px',
                overflowY: 'auto'
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  color: '#111'
                }}
              >
                {step.output}
              </pre>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

interface CharInspectorProps {
  payload: ClipboardDataPayload;
}

const CharInspector = ({ payload }: CharInspectorProps) => {
  const [target, setTarget] = useState<'plainText' | 'htmlText'>('plainText');

  const textToAnalyze =
    target === 'htmlText' ? payload.htmlText || '' : payload.plainText;
  const charInfos = analyzeCharacters(textToAnalyze);

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        marginBottom: '32px'
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
        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#222' }}>
          Character-by-Character Inspector
        </h2>
        {payload.htmlText && (
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', gap: '6px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="inspectTargetSelect2"
                checked={target === 'plainText'}
                onChange={() => setTarget('plainText')}
              />
              plainText
            </label>
            <label style={{ display: 'flex', gap: '6px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="inspectTargetSelect2"
                checked={target === 'htmlText'}
                onChange={() => setTarget('htmlText')}
              />
              htmlText
            </label>
          </div>
        )}
      </div>

      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '16px' }}>
        Escaped Invisible Characters View:
      </p>
      <div
        style={{
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '6px',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          marginBottom: '20px',
          border: '1px solid #e0e0e0'
        }}
      >
        {escapeInvisibleChars(textToAnalyze) || '(Empty)'}
      </div>

      <div
        style={{
          maxHeight: '350px',
          overflowY: 'auto',
          border: '1px solid #eee',
          borderRadius: '6px',
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
              <th style={{ padding: '8px 12px' }}>Glyph / Marker</th>
              <th style={{ padding: '8px 12px' }}>Unicode Hex</th>
              <th style={{ padding: '8px 12px' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {charInfos.map((c) => (
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
                <td style={{ padding: '6px 12px', color: '#555' }}>{c.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const App = () => {
  const [formatOverride, setFormatOverride] = useState<InputFormat>('auto');
  const [payload, setPayload] = useState<ClipboardDataPayload>({
    plainText: ''
  });
  const [outputs, setOutputs] = useState<ConvertedOutputs>({
    html: '',
    markdown: '',
    plaintext: '',
    debugSteps: []
  });

  useEffect(() => {
    if (payload.plainText || payload.htmlText) {
      setOutputs(convert(payload, formatOverride));
    } else {
      setOutputs({ html: '', markdown: '', plaintext: '', debugSteps: [] });
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
      <h1 style={{ marginBottom: '10px', color: '#1a1a2e' }}>
        Advanced Paster 2
      </h1>
      <p style={{ color: '#555', marginBottom: '24px' }}>
        Curated clipboard pipeline with raw input inspection, text type
        detection, and stage-by-stage transformation debugging.
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

      {(payload.plainText || payload.htmlText) && (
        <>
          <TextTypeBanner
            detectedFormat={outputs.detectedFormat}
            explanation={outputs.detectionExplanation}
            selectedFormat={formatOverride}
          />

          <RawInputsRow payload={payload} copyPlainText={copyPlainText} />

          <DebugPipeline debugSteps={outputs.debugSteps} />

          <CharInspector payload={payload} />
        </>
      )}

      <OutputGrid
        plainText={payload.plainText}
        html={outputs.html}
        markdown={outputs.markdown}
        plaintext={outputs.plaintext}
        copyPlainText={copyPlainText}
        copyRichText={copyRichText}
      />
    </div>
  );
};

const appElement = document.getElementById('app');
if (appElement) {
  render(<App />, appElement);
}
