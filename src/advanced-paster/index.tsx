import { h, render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { OutputColumn } from './components/OutputColumn';
import {
  convert,
  InputFormat,
  ClipboardDataPayload,
  ConvertedOutputs
} from './lib/converter';

// eslint-disable-next-line max-lines-per-function
const App = () => {
  const [formatOverride, setFormatOverride] = useState<InputFormat>('auto');
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
      // Don't intercept if they are pasting directly in the textarea,
      // as it has its own handler
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
      // Optional: a visual toast could be better, but alert is simple
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
          content={payload.plainText}
          onCopy={() => copyPlainText(payload.plainText)}
        />
        <OutputColumn
          title="Rendered HTML"
          content={outputs.html}
          onCopy={() => copyRichText(outputs.html)}
          isHtmlRender
        />
        <OutputColumn
          title="HTML Source"
          content={outputs.html}
          onCopy={() => copyPlainText(outputs.html)}
        />
        <OutputColumn
          title="Markdown"
          content={outputs.markdown}
          onCopy={() => copyPlainText(outputs.markdown)}
        />
        <OutputColumn
          title="Plaintext"
          content={outputs.plaintext}
          onCopy={() => copyPlainText(outputs.plaintext)}
        />
      </div>
    </div>
  );
};

render(<App />, document.getElementById('app') as HTMLElement);
