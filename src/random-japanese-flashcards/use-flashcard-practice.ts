import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { initialIndexFromPool, nextIndexInPool, poolIndices } from './pool';
import { readStars, writeStars } from './stars-storage';
import { useNextCardShortcut } from './use-next-card-shortcut';
import { ALL_WORD_INDICES, KANA_WORDS } from './words';

const getStorage = (): Storage | null =>
  typeof globalThis !== 'undefined' && 'localStorage' in globalThis
    ? globalThis.localStorage
    : null;

export const useFlashcardPractice = () => {
  const [starredList, setStarredList] = useState<string[]>(() => {
    const st = getStorage();
    return st ? readStars(st) : [];
  });
  const [starredOnly, setStarredOnly] = useState(false);
  const starred = useMemo(() => new Set(starredList), [starredList]);

  const pool = useMemo(
    () => poolIndices(KANA_WORDS, starred, starredOnly),
    [starred, starredOnly]
  );

  const [index, setIndex] = useState(() =>
    initialIndexFromPool(ALL_WORD_INDICES, Math.random)
  );

  const poolEmpty = starredOnly && pool.length === 0;

  useEffect(() => {
    if (pool.length === 0) {
      return;
    }
    setIndex((i) =>
      pool.includes(i) ? i : initialIndexFromPool(pool, Math.random)
    );
  }, [starredOnly, starredList, pool]);

  const onNext = useCallback(() => {
    setIndex((current) => {
      if (pool.length === 0) {
        return current;
      }
      return nextIndexInPool(pool, current, Math.random);
    });
  }, [pool]);

  useNextCardShortcut(onNext);

  const word = poolEmpty ? '' : (KANA_WORDS[index] ?? '');
  const isStarred = word.length > 0 && starred.has(word);

  const toggleStar = useCallback(() => {
    if (poolEmpty || word.length === 0) {
      return;
    }
    setStarredList((prev) => {
      const next = prev.includes(word)
        ? prev.filter((x) => x !== word)
        : [...prev, word];
      const st = getStorage();
      if (st) {
        writeStars(st, next);
      }
      return next;
    });
  }, [poolEmpty, word]);

  return {
    starredOnly,
    setStarredOnly,
    poolEmpty,
    word,
    isStarred,
    toggleStar,
    onNext
  };
};
