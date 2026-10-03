import { describe, it, expect, beforeEach } from 'vitest';
import {
  createDefaultConfig,
  parseStoredConfig,
  serializeConfig,
  loadConfig,
  saveConfig
} from './config-storage';
import {
  DEFAULT_SELECTED_YEAR,
  SECOND_YEAR,
  STORAGE_CONFIG_KEY
} from './constants';
import { KanjiConfig } from './types';

describe('config-storage: pure serialization and parsing', () => {
  it('creates default configuration with default year and target count', () => {
    const config = createDefaultConfig();
    expect(config.selectedYear).toBe(DEFAULT_SELECTED_YEAR);
    expect(config.selectedKanji.length).toBe(5);
  });

  it('serializes and parses valid configuration roundtrip', () => {
    const original: KanjiConfig = {
      selectedYear: SECOND_YEAR,
      selectedKanji: ['行', '今', '午', '古', '万']
    };
    const json = serializeConfig(original);
    const parsed = parseStoredConfig(json);
    expect(parsed).toEqual(original);
  });

  it('falls back to default configuration when stored data is invalid or empty', () => {
    expect(parseStoredConfig(null)).toEqual(createDefaultConfig());
    expect(parseStoredConfig('invalid json')).toEqual(createDefaultConfig());
    expect(parseStoredConfig('{"selectedYear":"bad"}')).toEqual(
      createDefaultConfig()
    );
    expect(
      parseStoredConfig('{"selectedYear":1,"selectedKanji":["木"]}')
    ).toEqual(createDefaultConfig());
  });
});

describe('config-storage: IO integration test with localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads and saves configuration to localStorage', () => {
    const sample: KanjiConfig = {
      selectedYear: SECOND_YEAR,
      selectedKanji: ['行', '今', '午', '古', '万']
    };
    saveConfig(sample);
    expect(localStorage.getItem(STORAGE_CONFIG_KEY)).toBe(
      serializeConfig(sample)
    );

    const loaded = loadConfig();
    expect(loaded).toEqual(sample);
  });
});
