import {
  DEFAULT_CHALLENGE_KANJI,
  DEFAULT_SELECTED_YEAR,
  STORAGE_CONFIG_KEY,
  TARGET_KANJI_COUNT
} from './constants';
import { KanjiConfig } from './types';

export const createDefaultConfig = (): KanjiConfig => ({
  selectedYear: DEFAULT_SELECTED_YEAR,
  selectedKanji: [...DEFAULT_CHALLENGE_KANJI]
});

const isStringArray = (val: unknown): val is readonly string[] =>
  Array.isArray(val) && val.every((item) => typeof item === 'string');

const isValidConfig = (data: Partial<KanjiConfig>): data is KanjiConfig =>
  typeof data.selectedYear === 'number' && isStringArray(data.selectedKanji);

export const parseStoredConfig = (raw: string | null): KanjiConfig => {
  if (!raw) return createDefaultConfig();
  try {
    const parsed = JSON.parse(raw) as Partial<KanjiConfig>;
    if (
      isValidConfig(parsed) &&
      parsed.selectedKanji.length === TARGET_KANJI_COUNT
    ) {
      return {
        selectedYear: parsed.selectedYear,
        selectedKanji: parsed.selectedKanji
      };
    }
    return createDefaultConfig();
  } catch {
    return createDefaultConfig();
  }
};

export const serializeConfig = (config: KanjiConfig): string =>
  JSON.stringify(config);

export const loadConfig = (): KanjiConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
    return parseStoredConfig(raw);
  } catch {
    return createDefaultConfig();
  }
};

export const saveConfig = (config: KanjiConfig): void => {
  try {
    localStorage.setItem(STORAGE_CONFIG_KEY, serializeConfig(config));
  } catch {
    // Ignored in restricted environments
  }
};
