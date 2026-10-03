import { INITIAL_PLAYER_POINTS } from './constants';
import { InventoryItem, PlayerProfile, ShopItem } from './types';

export const createInitialProfile = (): PlayerProfile => ({
  points: INITIAL_PLAYER_POINTS,
  purchasedItemIds: [],
  inventory: [],
  unopenedBoxesCount: 0,
  equippedItemId: null
});

export const awardSentencePoints = (
  profile: PlayerProfile,
  points: number
): PlayerProfile => ({
  ...profile,
  points: profile.points + Math.max(0, points)
});

export const getInventoryItemCount = (
  profile: PlayerProfile,
  itemId: string
): number => {
  const inventory = profile.inventory ?? [];
  const found = inventory.find((entry) => entry.id === itemId);
  return found ? found.count : 0;
};

const updateInventoryCounts = (
  inventory: readonly InventoryItem[],
  itemId: string
): readonly InventoryItem[] => {
  const existing = inventory.find((entry) => entry.id === itemId);
  if (existing) {
    return inventory.map((entry) =>
      entry.id === itemId ? { ...entry, count: entry.count + 1 } : entry
    );
  }
  return [...inventory, { id: itemId, count: 1 }];
};

export const addMinifigureToInventory = (
  profile: PlayerProfile,
  itemId: string
): PlayerProfile => {
  const currentInventory = profile.inventory ?? [];
  const nextInventory = updateInventoryCounts(currentInventory, itemId);
  const purchasedIds = profile.purchasedItemIds ?? [];
  const nextPurchased = purchasedIds.includes(itemId)
    ? purchasedIds
    : [...purchasedIds, itemId];
  const nextEquipped = profile.equippedItemId ?? itemId;

  return {
    ...profile,
    inventory: nextInventory,
    purchasedItemIds: nextPurchased,
    equippedItemId: nextEquipped
  };
};

export const awardBlindBox = (profile: PlayerProfile): PlayerProfile => ({
  ...profile,
  unopenedBoxesCount: (profile.unopenedBoxesCount ?? 0) + 1
});

export const openBlindBox = (
  profile: PlayerProfile,
  itemId: string
): PlayerProfile => {
  const currentBoxes = profile.unopenedBoxesCount ?? 0;
  const updatedProfile = addMinifigureToInventory(profile, itemId);
  return {
    ...updatedProfile,
    unopenedBoxesCount: Math.max(0, currentBoxes - 1)
  };
};

export const canPurchaseItem = (
  profile: PlayerProfile,
  item: ShopItem
): boolean => {
  const purchased = profile.purchasedItemIds ?? [];
  if (purchased.includes(item.id)) {
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

  const withItem = addMinifigureToInventory(profile, item.id);
  return {
    ...withItem,
    points: profile.points - item.price
  };
};

export const equipItem = (
  profile: PlayerProfile,
  itemId: string
): PlayerProfile => {
  const purchased = profile.purchasedItemIds ?? [];
  const inventory = profile.inventory ?? [];
  const isOwned =
    purchased.includes(itemId) ||
    inventory.some((entry) => entry.id === itemId);
  if (!isOwned) {
    return profile;
  }
  return {
    ...profile,
    equippedItemId: itemId
  };
};
