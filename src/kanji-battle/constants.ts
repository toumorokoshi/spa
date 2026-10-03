export const APP_TITLE = 'Kanji Battle';
export const APP_SUBTITLE = 'Sentence Writing Practice & Minifig Shop';

export const CANVAS_SIZE = 300;
export const HALF_FACTOR = 0.5;
export const NORMALIZED_BOX_SIZE = 100;
export const RESAMPLE_SAMPLE_COUNT = 16;
export const STROKE_MATCH_THRESHOLD = 26;
export const REVERSE_MATCH_THRESHOLD = 22;
export const MIN_POINTS_FOR_STROKE = 3;
export const MIN_STROKE_PIXEL_LENGTH = 12;

export const INK_STROKE_WIDTH = 8;
export const DRAWING_STROKE_WIDTH = 7;
export const GUIDE_STROKE_WIDTH = 5;
export const GRID_LINE_WIDTH = 1;

export const GRID_DASH_LEN = 4;
export const GUIDE_DASH_LEN = 6;

export const WEIGHT_AVG_DISTANCE = 0.5;
export const WEIGHT_ENDPOINT_DISTANCE = 0.25;

export const FIRST_INDEX = 0;
export const PERCENT_FACTOR = 100;

export const NAV_DIR_PREV = -1;
export const NAV_DIR_NEXT = 1;

export const INITIAL_PLAYER_POINTS = 0;
export const SENTENCE_POINTS_SHORT = 50;
export const SENTENCE_POINTS_MEDIUM = 75;
export const SENTENCE_POINTS_LONG = 100;

export const SHOP_PRICE_TIER_1 = 100;
export const SHOP_PRICE_TIER_2 = 150;
export const SHOP_PRICE_TIER_3 = 200;
export const SHOP_PRICE_TIER_4 = 250;
export const SHOP_PRICE_TIER_5 = 300;
export const SHOP_PRICE_TIER_6 = 400;

import { KanjiYearOption } from './types';

export const STORAGE_PROFILE_KEY = 'kanji-battle:profile';
export const STORAGE_CONFIG_KEY = 'kanji-battle:config';

export const DEFAULT_SELECTED_YEAR = 1;
export const SECOND_YEAR = 2;

export const KANJI_YEAR_1 = [
  '一',
  '二',
  '三',
  '四',
  '五',
  '十',
  '日',
  '月',
  '山',
  '川',
  '木',
  '本',
  '大',
  '口',
  '目',
  '手',
  '火',
  '水',
  '出'
] as const;

export const KANJI_YEAR_2 = [
  '行',
  '今',
  '午',
  '古',
  '万',
  '元',
  '牛',
  '毛',
  '方',
  '分',
  '心'
] as const;

export const KANJI_YEAR_OPTIONS: readonly KanjiYearOption[] = [
  {
    year: DEFAULT_SELECTED_YEAR,
    label: 'Year 1 (小学1年)',
    description:
      'Foundational elementary kanji: numbers, nature, and body parts',
    kanji: KANJI_YEAR_1
  },
  {
    year: SECOND_YEAR,
    label: 'Year 2 (小学2年)',
    description: 'Second-grade kanji: time, movement, directions, and concepts',
    kanji: KANJI_YEAR_2
  }
];

export const ALLOWED_SENTENCE_KANJI = [
  ...KANJI_YEAR_1,
  ...KANJI_YEAR_2
] as const;

export const ALLOWED_KANJI = ALLOWED_SENTENCE_KANJI;
export type AllowedKanji = (typeof ALLOWED_SENTENCE_KANJI)[number];

export const TARGET_KANJI_COUNT = 5;
export const POINTS_PER_TARGET_KANJI = 50;
export const ALL_TARGETS_BONUS_POINTS = 50;

export const GRID_COLUMNS = 3;
export const GRID_ROWS = 6;
export const TOTAL_GRID_CELLS = 18;

export const AVAILABLE_KANA = [
  'は',
  'の',
  'に',
  'と',
  'を',
  'か',
  'ら',
  'る',
  'き',
  'な',
  'く',
  'も'
] as const;

export const DEFAULT_CHALLENGE_KANJI = ['日', '山', '木', '水', '火'] as const;
