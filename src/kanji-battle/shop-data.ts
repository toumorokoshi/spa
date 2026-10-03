import {
  FIRST_INDEX,
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
    id: 'dinosaur-minifig',
    name: 'Dinosaur Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_1,
    icon: '🦖',
    description:
      'A prehistoric dino stomping through kanji practice with colossal power.'
  },
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
    id: 'king-minifig',
    name: 'King Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_3,
    icon: '👑',
    description: 'A regal brick monarch ruling over the realm of kanji mastery.'
  },
  {
    id: 'jester-minifig',
    name: 'Jester Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_2,
    icon: '🃏',
    description:
      'A witty court jester turning kanji practice into delightful fun.'
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
  },
  {
    id: 'pirate-minifig',
    name: 'Pirate Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_1,
    icon: '🏴‍☠️',
    description:
      'A swashbuckling brick pirate hunting for treasure in kanji strokes.'
  },
  {
    id: 'superhero-minifig',
    name: 'Superhero Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_4,
    icon: '🦸',
    description: 'A masked crusader with superpowered handwriting accuracy.'
  },
  {
    id: 'detective-minifig',
    name: 'Detective Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_2,
    icon: '🕵️',
    description:
      'A sharp investigator solving the mystery of tricky kanji radicals.'
  },
  {
    id: 'chef-minifig',
    name: 'Chef Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_1,
    icon: '🧑‍🍳',
    description:
      'A master brick chef cooking up savory sentences and fresh kanji.'
  },
  {
    id: 'firefighter-minifig',
    name: 'Firefighter Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_2,
    icon: '🧑‍🚒',
    description: 'A courageous hero ready to extinguish any handwriting errors.'
  },
  {
    id: 'diver-minifig',
    name: 'Deep Sea Diver Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_3,
    icon: '🤿',
    description:
      'An intrepid diver searching the depths for hidden kanji treasures.'
  },
  {
    id: 'scientist-minifig',
    name: 'Scientist Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_3,
    icon: '🔬',
    description:
      'A brilliant researcher analyzing the atomic strokes of characters.'
  },
  {
    id: 'pilot-minifig',
    name: 'Pilot Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_4,
    icon: '🧑‍✈️',
    description: 'A skilled ace soaring through the skies of Japanese fluency.'
  },
  {
    id: 'artist-minifig',
    name: 'Artist Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_2,
    icon: '🎨',
    description:
      'A creative painter expressing elegance in every manuscript cell.'
  },
  {
    id: 'viking-minifig',
    name: 'Viking Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_4,
    icon: '🪓',
    description:
      'A fearless voyager sailing across stormy seas to conquer kanji.'
  },
  {
    id: 'dragon-minifig',
    name: 'Dragon Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_6,
    icon: '🐉',
    description:
      'A mythical beast breathing fiery energy into sentence challenges.'
  },
  {
    id: 'farmer-minifig',
    name: 'Farmer Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_1,
    icon: '🧑‍🌾',
    description:
      'A gentle cultivator tending fields of flourishing kanji wisdom.'
  },
  {
    id: 'alien-minifig',
    name: 'Alien Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_5,
    icon: '👽',
    description:
      'An extraterrestrial visitor learning Earth’s finest kanji scripts.'
  },
  {
    id: 'miner-minifig',
    name: 'Miner Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_2,
    icon: '⛏️',
    description: 'A rugged spelunker unearthing precious gems and rare kanji.'
  },
  {
    id: 'princess-minifig',
    name: 'Princess Minifig',
    category: 'minifigure',
    price: SHOP_PRICE_TIER_5,
    icon: '👸',
    description:
      'A graceful royal scholar crafting poetry in authentic manuscript style.'
  }
];

export const getShopItemById = (id: string): ShopItem | undefined =>
  SHOP_ITEMS.find((item) => item.id === id);

export const getRandomMinifigure = (
  items: readonly ShopItem[] = SHOP_ITEMS,
  randomFn: () => number = Math.random
): ShopItem => {
  const index = Math.floor(randomFn() * items.length);
  return items[index] ?? items[FIRST_INDEX];
};
