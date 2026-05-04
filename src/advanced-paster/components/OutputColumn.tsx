interface OutputColumnProps {
  title: string;
  content: string;
  onCopy: () => void;
  isHtmlRender?: boolean;
}

export const OutputColumn = ({
  title,
  content,
  onCopy,
  isHtmlRender
}: OutputColumnProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        height: '400px',
        gap: '8px'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h3>
        <button
          onClick={onCopy}
          style={{
            padding: '6px 12px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#0056b3')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#007bff')}
        >
          Copy
        </button>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          border: '1px solid #eee',
          padding: '12px',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9',
          fontFamily: isHtmlRender ? 'inherit' : 'monospace',
          whiteSpace: isHtmlRender ? 'normal' : 'pre-wrap',
          fontSize: '0.95rem'
        }}
      >
        {isHtmlRender ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          content
        )}
      </div>
    </div>
  );
};
