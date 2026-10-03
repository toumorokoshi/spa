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
    expect(fromNull.inventory).toEqual([]);
    expect(fromNull.unopenedBoxesCount).toBe(0);
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
      inventory: [
        { id: 'item-a', count: 1 },
        { id: 'item-b', count: 2 }
      ],
      unopenedBoxesCount: 1,
      equippedItemId: 'item-a'
    };

    const serialized = serializeProfile(original);
    const parsed = parseStoredProfile(serialized);
    expect(parsed).toEqual(original);
  });

  it('migrates legacy stored profile without inventory field', () => {
    const legacyRaw = JSON.stringify({
      points: 200,
      purchasedItemIds: ['ninja-minifig', 'samurai-minifig'],
      equippedItemId: 'ninja-minifig'
    });

    const parsed = parseStoredProfile(legacyRaw);
    expect(parsed.points).toBe(200);
    expect(parsed.purchasedItemIds).toEqual([
      'ninja-minifig',
      'samurai-minifig'
    ]);
    expect(parsed.inventory).toEqual([
      { id: 'ninja-minifig', count: 1 },
      { id: 'samurai-minifig', count: 1 }
    ]);
    expect(parsed.unopenedBoxesCount).toBe(0);
    expect(parsed.equippedItemId).toBe('ninja-minifig');
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
      inventory: [{ id: 'ninja-minifig', count: 1 }],
      unopenedBoxesCount: 0,
      equippedItemId: 'ninja-minifig'
    };

    saveProfile(profile);
    const retrieved = loadProfile();
    expect(retrieved).toEqual(profile);
  });
});
