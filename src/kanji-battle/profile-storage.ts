import { STORAGE_PROFILE_KEY } from './constants';
import { createInitialProfile } from './shop-logic';
import { PlayerProfile } from './types';

const isValidProfileData = (
  data: Partial<PlayerProfile>
): data is PlayerProfile =>
  typeof data.points === 'number' && Array.isArray(data.purchasedItemIds);

const extractEquipped = (val: unknown): string | null =>
  typeof val === 'string' ? val : null;

const buildProfile = (data: PlayerProfile): PlayerProfile => ({
  points: Math.max(0, data.points),
  purchasedItemIds: data.purchasedItemIds,
  equippedItemId: extractEquipped(data.equippedItemId)
});

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
