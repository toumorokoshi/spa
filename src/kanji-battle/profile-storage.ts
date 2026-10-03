import { STORAGE_PROFILE_KEY } from './constants';
import { createInitialProfile } from './shop-logic';
import { InventoryItem, PlayerProfile } from './types';

const isValidInventoryItem = (item: unknown): item is InventoryItem =>
  typeof item === 'object' &&
  item !== null &&
  typeof (item as InventoryItem).id === 'string' &&
  typeof (item as InventoryItem).count === 'number' &&
  (item as InventoryItem).count > 0;

const isValidProfileData = (
  data: Partial<PlayerProfile>
): data is Partial<PlayerProfile> =>
  typeof data.points === 'number' &&
  (Array.isArray(data.purchasedItemIds) || Array.isArray(data.inventory));

const extractEquipped = (val: unknown): string | null =>
  typeof val === 'string' ? val : null;

const extractBoxesCount = (val: unknown): number =>
  typeof val === 'number' && val >= 0 ? Math.floor(val) : 0;

const normalizeInventory = (
  inventory: unknown,
  purchasedIds: readonly string[]
): readonly InventoryItem[] => {
  if (Array.isArray(inventory)) {
    return inventory.filter(isValidInventoryItem);
  }
  return purchasedIds.map((id) => ({ id, count: 1 }));
};

const buildProfile = (data: Partial<PlayerProfile>): PlayerProfile => {
  const purchasedItemIds = Array.isArray(data.purchasedItemIds)
    ? data.purchasedItemIds.filter((id): id is string => typeof id === 'string')
    : [];
  const inventory = normalizeInventory(data.inventory, purchasedItemIds);

  return {
    points: Math.max(0, data.points ?? 0),
    purchasedItemIds,
    inventory,
    unopenedBoxesCount: extractBoxesCount(data.unopenedBoxesCount),
    equippedItemId: extractEquipped(data.equippedItemId)
  };
};

export const parseStoredProfile = (raw: string | null): PlayerProfile => {
  if (!raw) return createInitialProfile();
  try {
    const data = JSON.parse(raw) as Partial<PlayerProfile>;
    return isValidProfileData(data)
      ? buildProfile(data)
      : createInitialProfile();
  } catch {
    return createInitialProfile();
  }
};

export const serializeProfile = (profile: PlayerProfile): string =>
  JSON.stringify(profile);

export const loadProfile = (): PlayerProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
    return parseStoredProfile(raw);
  } catch {
    return createInitialProfile();
  }
};

export const saveProfile = (profile: PlayerProfile): void => {
  try {
    localStorage.setItem(STORAGE_PROFILE_KEY, serializeProfile(profile));
  } catch {
    // Ignored in restricted environments
  }
};
