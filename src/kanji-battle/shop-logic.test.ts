import { describe, it, expect } from 'vitest';
import {
  INITIAL_PLAYER_POINTS,
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
  equipItem
} from './shop-logic';
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
    expect(afterBuy1.equippedItemId).toBe(testItem1.id);

    const afterBuy2 = purchaseItem(afterBuy1, testItem2);
    expect(afterBuy2.points).toBe(0);
    expect(afterBuy2.purchasedItemIds).toContain(testItem2.id);
    // Preserves currently equipped item
    expect(afterBuy2.equippedItemId).toBe(testItem1.id);
  });

  it('allows equipping owned items and rejects unowned items', () => {
    const profile = {
      points: 0,
      purchasedItemIds: [testItem1.id, testItem2.id],
      equippedItemId: testItem1.id
    };

    const equipped2 = equipItem(profile, testItem2.id);
    expect(equipped2.equippedItemId).toBe(testItem2.id);

    const invalid = equipItem(profile, 'non-existent-id');
    expect(invalid.equippedItemId).toBe(testItem1.id);
  });
});
