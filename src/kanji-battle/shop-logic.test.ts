import { describe, it, expect } from 'vitest';
import {
  INITIAL_PLAYER_POINTS,
  MIN_MINIFIGURES_COUNT,
  SENTENCE_POINTS_SHORT,
  SENTENCE_POINTS_MEDIUM,
  SHOP_PRICE_TIER_1,
  SHOP_PRICE_TIER_2
} from './constants';
import {
  createInitialProfile,
  awardSentencePoints,
  canPurchaseItem,
  purchaseItem,
  equipItem,
  addMinifigureToInventory,
  getInventoryItemCount,
  awardBlindBox,
  openBlindBox
} from './shop-logic';
import { getShopItemById, getRandomMinifigure, SHOP_ITEMS } from './shop-data';
import { ShopItem } from './types';

const testItem1: ShopItem = {
  id: 'test-fig-1',
  name: 'Test Fig 1',
  category: 'minifigure',
  price: SHOP_PRICE_TIER_1,
  icon: '🥷',
  description: 'First test figure'
};

const testItem2: ShopItem = {
  id: 'test-fig-2',
  name: 'Test Fig 2',
  category: 'minifigure',
  price: SHOP_PRICE_TIER_2,
  icon: '🥋',
  description: 'Second test figure'
};

describe('shop logic: profile points and purchases', () => {
  it('creates an initial profile with zero points and no items', () => {
    const profile = createInitialProfile();
    expect(profile.points).toBe(INITIAL_PLAYER_POINTS);
    expect(profile.purchasedItemIds).toEqual([]);
    expect(profile.inventory).toEqual([]);
    expect(profile.unopenedBoxesCount).toBe(0);
    expect(profile.equippedItemId).toBeNull();
  });

  it('accumulates points from completed sentences', () => {
    const profile = createInitialProfile();
    const updated = awardSentencePoints(profile, SENTENCE_POINTS_SHORT);
    expect(updated.points).toBe(SENTENCE_POINTS_SHORT);

    const accumulated = awardSentencePoints(updated, SENTENCE_POINTS_MEDIUM);
    expect(accumulated.points).toBe(
      SENTENCE_POINTS_SHORT + SENTENCE_POINTS_MEDIUM
    );
  });

  it('evaluates purchase eligibility correctly', () => {
    const profile = createInitialProfile();
    expect(canPurchaseItem(profile, testItem1)).toBe(false);

    const funded = awardSentencePoints(profile, SHOP_PRICE_TIER_1);
    expect(canPurchaseItem(funded, testItem1)).toBe(true);

    const owned = purchaseItem(funded, testItem1);
    expect(canPurchaseItem(owned, testItem1)).toBe(false);
  });
});

describe('shop logic: buying and equipping', () => {
  it('purchases item, deducts points, and auto-equips first item', () => {
    const funded = {
      ...createInitialProfile(),
      points: SHOP_PRICE_TIER_1 + SHOP_PRICE_TIER_2
    };

    const afterBuy1 = purchaseItem(funded, testItem1);
    expect(afterBuy1.points).toBe(SHOP_PRICE_TIER_2);
    expect(afterBuy1.purchasedItemIds).toContain(testItem1.id);
    expect(afterBuy1.inventory).toEqual([{ id: testItem1.id, count: 1 }]);
    expect(afterBuy1.equippedItemId).toBe(testItem1.id);

    const afterBuy2 = purchaseItem(afterBuy1, testItem2);
    expect(afterBuy2.points).toBe(0);
    expect(afterBuy2.purchasedItemIds).toContain(testItem2.id);
    expect(afterBuy2.inventory).toEqual([
      { id: testItem1.id, count: 1 },
      { id: testItem2.id, count: 1 }
    ]);
    // Preserves currently equipped item
    expect(afterBuy2.equippedItemId).toBe(testItem1.id);
  });

  it('allows equipping owned items and rejects unowned items', () => {
    const profile = {
      ...createInitialProfile(),
      purchasedItemIds: [testItem1.id, testItem2.id],
      inventory: [
        { id: testItem1.id, count: 1 },
        { id: testItem2.id, count: 1 }
      ],
      equippedItemId: testItem1.id
    };

    const equipped2 = equipItem(profile, testItem2.id);
    expect(equipped2.equippedItemId).toBe(testItem2.id);

    const invalid = equipItem(profile, 'non-existent-id');
    expect(invalid.equippedItemId).toBe(testItem1.id);
  });
});

describe('minifigures catalog and spec requirements', () => {
  it('contains at least 20 minifigures in the catalog', () => {
    expect(SHOP_ITEMS.length).toBeGreaterThanOrEqual(MIN_MINIFIGURES_COUNT);
    expect(SHOP_ITEMS.length).toBeGreaterThanOrEqual(20);
  });

  it('includes dinosaur, ninja, king, and jester minifigures', () => {
    const dino = getShopItemById('dinosaur-minifig')!;
    expect(dino.name).toBe('Dinosaur Minifig');
    expect(dino.icon).toBe('🦖');

    const ninja = getShopItemById('ninja-minifig')!;
    expect(ninja.name).toBe('Ninja Minifig');
    expect(ninja.icon).toBe('🥷');

    const king = getShopItemById('king-minifig')!;
    expect(king.name).toBe('King Minifig');
    expect(king.icon).toBe('👑');

    const jester = getShopItemById('jester-minifig')!;
    expect(jester.name).toBe('Jester Minifig');
    expect(jester.icon).toBe('🃏');
  });

  it('selects random minifigure deterministically when randomFn is provided', () => {
    const pickFirst = getRandomMinifigure(SHOP_ITEMS, () => 0);
    expect(pickFirst.id).toBe(SHOP_ITEMS[0].id);

    const pickLast = getRandomMinifigure(SHOP_ITEMS, () => 0.9999);
    expect(pickLast.id).toBe(SHOP_ITEMS[SHOP_ITEMS.length - 1].id);
  });
});

describe('inventory and duplicate tracking', () => {
  it('adds new minifigure with count 1 and auto-equips when none equipped', () => {
    const profile = createInitialProfile();
    const withFig = addMinifigureToInventory(profile, 'dinosaur-minifig');
    expect(withFig.inventory).toEqual([{ id: 'dinosaur-minifig', count: 1 }]);
    expect(withFig.purchasedItemIds).toContain('dinosaur-minifig');
    expect(withFig.equippedItemId).toBe('dinosaur-minifig');
    expect(getInventoryItemCount(withFig, 'dinosaur-minifig')).toBe(1);
  });

  it('increments duplicate count when receiving existing minifigure', () => {
    const initial = createInitialProfile();
    const once = addMinifigureToInventory(initial, 'king-minifig');
    const twice = addMinifigureToInventory(once, 'king-minifig');
    const thrice = addMinifigureToInventory(twice, 'king-minifig');

    expect(thrice.inventory).toEqual([{ id: 'king-minifig', count: 3 }]);
    expect(getInventoryItemCount(thrice, 'king-minifig')).toBe(3);
    expect(thrice.equippedItemId).toBe('king-minifig');
  });

  it('returns count 0 for items not in inventory', () => {
    const profile = createInitialProfile();
    expect(getInventoryItemCount(profile, 'unknown-item')).toBe(0);
  });
});

describe('blind box awards and unboxing', () => {
  it('awards blind box by incrementing unopenedBoxesCount', () => {
    const profile = createInitialProfile();
    const awarded = awardBlindBox(profile);
    expect(awarded.unopenedBoxesCount).toBe(1);

    const awardedAgain = awardBlindBox(awarded);
    expect(awardedAgain.unopenedBoxesCount).toBe(2);
  });

  it('opens blind box, decrements count, and adds minifigure to inventory', () => {
    const profile = {
      ...createInitialProfile(),
      unopenedBoxesCount: 2
    };

    const opened = openBlindBox(profile, 'jester-minifig');
    expect(opened.unopenedBoxesCount).toBe(1);
    expect(opened.inventory).toEqual([{ id: 'jester-minifig', count: 1 }]);
    expect(getInventoryItemCount(opened, 'jester-minifig')).toBe(1);

    // Opening second box duplicates jester
    const duplicateOpened = openBlindBox(opened, 'jester-minifig');
    expect(duplicateOpened.unopenedBoxesCount).toBe(0);
    expect(duplicateOpened.inventory).toEqual([
      { id: 'jester-minifig', count: 2 }
    ]);
  });

  it('clamps unopenedBoxesCount to zero if opened when none available', () => {
    const profile = createInitialProfile();
    expect(profile.unopenedBoxesCount).toBe(0);

    const opened = openBlindBox(profile, 'ninja-minifig');
    expect(opened.unopenedBoxesCount).toBe(0);
    expect(opened.inventory).toEqual([{ id: 'ninja-minifig', count: 1 }]);
  });
});
