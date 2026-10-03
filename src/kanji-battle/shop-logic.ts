import { INITIAL_PLAYER_POINTS } from './constants';
import { PlayerProfile, ShopItem } from './types';

export const createInitialProfile = (): PlayerProfile => ({
  points: INITIAL_PLAYER_POINTS,
  purchasedItemIds: [],
  equippedItemId: null
});

export const awardSentencePoints = (
  profile: PlayerProfile,
  points: number
): PlayerProfile => ({
  ...profile,
  points: profile.points + Math.max(0, points)
});

export const canPurchaseItem = (
  profile: PlayerProfile,
  item: ShopItem
): boolean => {
  if (profile.purchasedItemIds.includes(item.id)) {
    return false;
  }
  return profile.points >= item.price;
};

export const purchaseItem = (
  profile: PlayerProfile,
  item: ShopItem
): PlayerProfile => {
  if (!canPurchaseItem(profile, item)) {
    return profile;
  }

  const nextEquipped = profile.equippedItemId ?? item.id;
  return {
    ...profile,
    points: profile.points - item.price,
    purchasedItemIds: [...profile.purchasedItemIds, item.id],
    equippedItemId: nextEquipped
  };
};

export const equipItem = (
  profile: PlayerProfile,
  itemId: string
): PlayerProfile => {
  if (!profile.purchasedItemIds.includes(itemId)) {
    return profile;
  }
  return {
    ...profile,
    equippedItemId: itemId
  };
};
