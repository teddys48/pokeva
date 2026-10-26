import { describe, expect, it, beforeEach } from 'bun:test';
import {
  FAVORITES_STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
  loadFavoritesFromStorage,
  saveFavoritesToStorage,
  validateFavoriteItem,
  parseAndValidateFavoritesPayload,
} from '../favoritesStorage';
import { FavoritePokemonItem } from '@/types/favorites';

// Mock in-memory localStorage for isolated testing
class MockLocalStorage {
  private store: Map<string, string> = new Map();
  public shouldThrowOnGet = false;
  public shouldThrowOnSet = false;

  getItem(key: string): string | null {
    if (this.shouldThrowOnGet) {
      throw new Error('SecurityError: The operation is insecure.');
    }
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.shouldThrowOnSet) {
      throw new Error('QuotaExceededError: The quota has been exceeded.');
    }
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe('Phase 5: Favorites Persistence Layer', () => {
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    // Install mock storage on global window
    (globalThis as unknown as { window: { localStorage: MockLocalStorage } }).window = {
      localStorage: mockStorage,
    };
  });

  describe('Validation & Parsing', () => {
    it('validates correct candidate item', () => {
      const valid = validateFavoriteItem({
        id: 25,
        name: 'Pikachu',
        addedAt: 1600000000000,
      });

      expect(valid).toEqual({
        id: 25,
        name: 'pikachu',
        addedAt: 1600000000000,
      });
    });

    it('rejects candidate with non-numeric, non-integer or non-positive ID', () => {
      expect(validateFavoriteItem({ id: '25', name: 'pikachu' })).toBeNull();
      expect(validateFavoriteItem({ id: -5, name: 'pikachu' })).toBeNull();
      expect(validateFavoriteItem({ id: 0, name: 'pikachu' })).toBeNull();
      expect(validateFavoriteItem({ id: 25.5, name: 'pikachu' })).toBeNull();
      expect(validateFavoriteItem({ id: null, name: 'pikachu' })).toBeNull();
    });

    it('rejects candidate with empty or non-string name', () => {
      expect(validateFavoriteItem({ id: 25, name: '' })).toBeNull();
      expect(validateFavoriteItem({ id: 25, name: '   ' })).toBeNull();
      expect(validateFavoriteItem({ id: 25, name: 123 })).toBeNull();
      expect(validateFavoriteItem({ id: 25, name: null })).toBeNull();
    });

    it('supplies current timestamp when addedAt is missing or invalid', () => {
      const now = Date.now();
      const item = validateFavoriteItem({ id: 25, name: 'pikachu' });
      expect(item).not.toBeNull();
      expect(item!.addedAt).toBeGreaterThanOrEqual(now - 100);
    });

    it('parses valid version 1 payload', () => {
      const payload = {
        version: 1,
        items: [
          { id: 25, name: 'pikachu', addedAt: 1000 },
          { id: 6, name: 'charizard', addedAt: 2000 },
        ],
      };

      const result = parseAndValidateFavoritesPayload(payload);
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(25);
      expect(result[1].id).toBe(6);
    });

    it('deduplicates items by Pokémon ID', () => {
      const payload = {
        version: 1,
        items: [
          { id: 25, name: 'pikachu', addedAt: 1000 },
          { id: 25, name: 'pikachu', addedAt: 2000 }, // duplicate ID
          { id: 1, name: 'bulbasaur', addedAt: 3000 },
        ],
      };

      const result = parseAndValidateFavoritesPayload(payload);
      expect(result.length).toBe(2);
      expect(result.map((i) => i.id)).toEqual([25, 1]);
    });

    it('gracefully handles legacy array representation', () => {
      const legacyArray = [
        { id: 150, name: 'mewtwo', addedAt: 5000 },
        { id: 151, name: 'mew', addedAt: 6000 },
      ];

      const result = parseAndValidateFavoritesPayload(legacyArray);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('mewtwo');
    });

    it('filters out corrupted entries within an array', () => {
      const dirty = {
        version: 1,
        items: [
          { id: 25, name: 'pikachu', addedAt: 1000 },
          { id: 'corrupt', name: null },
          null,
          'random string',
          { id: 9, name: 'blastoise', addedAt: 2000 },
        ],
      };

      const result = parseAndValidateFavoritesPayload(dirty);
      expect(result.length).toBe(2);
      expect(result.map((i) => i.name)).toEqual(['pikachu', 'blastoise']);
    });
  });

  describe('Storage Loading & Saving', () => {
    it('returns empty array when storage is empty', () => {
      const items = loadFavoritesFromStorage();
      expect(items).toEqual([]);
    });

    it('loads valid persisted favorites', () => {
      const initial: FavoritePokemonItem[] = [
        { id: 1, name: 'bulbasaur', addedAt: 100 },
        { id: 4, name: 'charmander', addedAt: 200 },
      ];

      mockStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify({ version: CURRENT_SCHEMA_VERSION, items: initial })
      );

      const loaded = loadFavoritesFromStorage();
      expect(loaded.length).toBe(2);
      expect(loaded[0].name).toBe('bulbasaur');
      expect(loaded[1].name).toBe('charmander');
    });

    it('saves favorites in versioned schema format', () => {
      const items: FavoritePokemonItem[] = [
        { id: 133, name: 'eevee', addedAt: 12345 },
      ];

      const success = saveFavoritesToStorage(items);
      expect(success).toBe(true);

      const raw = mockStorage.getItem(FAVORITES_STORAGE_KEY);
      expect(raw).not.toBeNull();

      const parsed = JSON.parse(raw!);
      expect(parsed.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(parsed.items.length).toBe(1);
      expect(parsed.items[0].id).toBe(133);
      expect(parsed.items[0].name).toBe('eevee');
    });

    it('handles malformed JSON without throwing and returns empty array', () => {
      mockStorage.setItem(FAVORITES_STORAGE_KEY, '{"invalid_json_corrupted: true');
      const loaded = loadFavoritesFromStorage();
      expect(loaded).toEqual([]);
    });

    it('handles non-object primitive in storage without crashing', () => {
      mockStorage.setItem(FAVORITES_STORAGE_KEY, '12345');
      const loaded = loadFavoritesFromStorage();
      expect(loaded).toEqual([]);
    });

    it('handles storage read failure (e.g. SecurityError) gracefully', () => {
      mockStorage.shouldThrowOnGet = true;
      const loaded = loadFavoritesFromStorage();
      expect(loaded).toEqual([]);
    });

    it('handles storage write failure (e.g. QuotaExceededError) gracefully', () => {
      mockStorage.shouldThrowOnSet = true;
      const success = saveFavoritesToStorage([{ id: 1, name: 'bulbasaur', addedAt: 100 }]);
      expect(success).toBe(false);
    });
  });
});
