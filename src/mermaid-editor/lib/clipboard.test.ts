import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyText, copyMarkdown, copySvg } from './clipboard';

describe('clipboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('copies plain text successfully', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    const result = await copyText('test message');
    expect(result).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith('test message');
  });

  it('copies markdown wrapped mermaid block', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    const result = await copyMarkdown('graph TD\nA-->B');
    expect(result).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith(
      '```mermaid\ngraph TD\nA-->B\n```'
    );
  });

  it('copies svg via fallback when ClipboardItem is not available', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
        write: undefined
      }
    });

    const result = await copySvg('<svg><g></g></svg>');
    expect(result).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith('<svg><g></g></svg>');
  });
});
