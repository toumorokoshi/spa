import { describe, it, expect } from 'vitest';
import { isNextCardShortcut } from './next-card-key';

describe('isNextCardShortcut', () => {
  it('matches Space and Enter outside text fields', () => {
    expect(isNextCardShortcut(new KeyboardEvent('keydown', { key: ' ' }))).toBe(
      true
    );
    expect(
      isNextCardShortcut(new KeyboardEvent('keydown', { key: 'Enter' }))
    ).toBe(true);
  });

  it('ignores other keys', () => {
    expect(isNextCardShortcut(new KeyboardEvent('keydown', { key: 'a' }))).toBe(
      false
    );
  });

  it('ignores Space when target is an input', () => {
    const input = document.createElement('input');
    const e = { key: ' ', target: input } as unknown as KeyboardEvent;
    expect(isNextCardShortcut(e)).toBe(false);
  });
});
