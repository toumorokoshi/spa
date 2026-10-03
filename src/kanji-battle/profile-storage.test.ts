import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseStoredProfile,
  serializeProfile,
  loadProfile,
  saveProfile
} from './profile-storage';
import { STORAGE_PROFILE_KEY } from './constants';
import { PlayerProfile } from './types';

describe('profile storage: pure data structure parsing', () => {
  it('returns default initial profile on null or invalid JSON', () => {
    const fromNull = parseStoredProfile(null);
    expect(fromNull.points).toBe(0);
    expect(fromNull.purchasedItemIds).toEqual([]);
    expect(fromNull.equippedItemId).toBeNull();

    const fromInvalid = parseStoredProfile('{not-valid-json');
    expect(fromInvalid.points).toBe(0);

    const fromWrongTypes = parseStoredProfile(
      JSON.stringify({ points: 'one-hundred' })
    );
    expect(fromWrongTypes.points).toBe(0);
  });

  it('parses valid serialized profile data structure', () => {
    const original: PlayerProfile = {
      points: 150,
      purchasedItemIds: ['item-a', 'item-b'],
      equippedItemId: 'item-a'
    };

    const serialized = serializeProfile(original);
    const parsed = parseStoredProfile(serialized);
    expect(parsed).toEqual(original);
  });
});

describe('profile storage: single IO integration test', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_PROFILE_KEY);
  });

  it('saves and loads profile from localStorage IO', () => {
    const profile: PlayerProfile = {
      points: 250,
      purchasedItemIds: ['ninja-minifig'],
      equippedItemId: 'ninja-minifig'
    };

    saveProfile(profile);
    const retrieved = loadProfile();
    expect(retrieved).toEqual(profile);
  });
});
