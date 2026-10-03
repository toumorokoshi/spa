import {
  SHOP_PRICE_TIER_1,
  SHOP_PRICE_TIER_2,
  SHOP_PRICE_TIER_3,
  SHOP_PRICE_TIER_4,
  SHOP_PRICE_TIER_5,
  SHOP_PRICE_TIER_6
} from './constants';
import { ShopItem } from './types';

export const SHOP_ITEMS: readonly ShopItem[] = [
  {
    id: 'ninja-minifig',
    name: 'Ninja Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_1,
    icon: '🥷',
    description:
      'A stealthy brick ninja who practices swift kanji brushstrokes.'
  },
  {
    id: 'samurai-minifig',
    name: 'Samurai Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_2,
    icon: '🥋',
    description: 'An honorable brick swordsman carving kanji with discipline.'
  },
  {
    id: 'astronaut-minifig',
    name: 'Astronaut Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_3,
    icon: '🧑‍🚀',
    description: 'A space voyager deciphering ancient kanji across the cosmos.'
  },
  {
    id: 'wizard-minifig',
    name: 'Wizard Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_4,
    icon: '🧙',
    description: 'An arcane enchanter casting spells through kanji calligraphy.'
  },
  {
    id: 'robot-minifig',
    name: 'Cyber Robot Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_5,
    icon: '🤖',
    description: 'An advanced android engineered for flawless stroke precision.'
  },
  {
    id: 'knight-minifig',
    name: 'Royal Knight Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_6,
    icon: '🛡️',
    description: 'A brave champion in brick armor defending kanji mastery.'
  }
];

export const getShopItemById = (id: string): ShopItem | undefined =>
  SHOP_ITEMS.find((item) => item.id === id);
