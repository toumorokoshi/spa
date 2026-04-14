import { useEffect } from 'preact/hooks';
import { isNextCardShortcut } from './next-card-key';

export const useNextCardShortcut = (onNext: () => void) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isNextCardShortcut(e)) {
        return;
      }
      e.preventDefault();
      onNext();
    };
    globalThis.addEventListener('keydown', onKey);
    return () => globalThis.removeEventListener('keydown', onKey);
  }, [onNext]);
};
