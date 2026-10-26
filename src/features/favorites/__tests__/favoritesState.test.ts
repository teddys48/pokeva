import { describe, expect, it, beforeEach } from 'bun:test';
import { FavoritePokemonItem } from '@/types/favorites';
import {
  FAVORITES_STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
  loadFavoritesFromStorage,
  saveFavoritesToStorage,
} from '../favoritesStorage';

// In-memory mock storage implementation for state simulation
class MockStorage {
  private data: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}

describe('Phase 5: Favorites State Management & Reducer Logic', () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    (globalThis as unknown as { window: { localStorage: MockStorage } }).window = {
      localStorage: mockStorage,
    };
  });

  // Pure logic functions mirroring the context handlers to verify all operations
  function executeAdd(
    current: FavoritePokemonItem[],
    pokemon: { id: number; name: string }
  ): FavoritePokemonItem[] {
    if (current.some((item) => item.id === pokemon.id)) {
      return current;
    }
    const newItem: FavoritePokemonItem = {
      id: pokemon.id,
      name: pokemon.name.toLowerCase().trim(),
      addedAt: Date.now(),
    };
    const updated = [newItem, ...current];
    saveFavoritesToStorage(updated);
    return updated;
  }

  function executeRemove(
    current: FavoritePokemonItem[],
    id: number
  ): FavoritePokemonItem[] {
    if (!current.some((item) => item.id === id)) {
      return current;
    }
    const updated = current.filter((item) => item.id !== id);
    saveFavoritesToStorage(updated);
    return updated;
  }

  function executeToggle(
    current: FavoritePokemonItem[],
    pokemon: { id: number; name: string }
  ): { next: FavoritePokemonItem[]; wasAdded: boolean } {
    const isPresent = current.some((item) => item.id === pokemon.id);
    if (isPresent) {
      return { next: executeRemove(current, pokemon.id), wasAdded: false };
    } else {
      return { next: executeAdd(current, pokemon), wasAdded: true };
    }
  }

  it('adds a favorite Pokémon and prepends to the collection', () => {
    let list: FavoritePokemonItem[] = [];
    list = executeAdd(list, { id: 25, name: 'Pikachu' });

    expect(list.length).toBe(1);
    expect(list[0].id).toBe(25);
    expect(list[0].name).toBe('pikachu');

    // Verify written to storage
    const stored = loadFavoritesFromStorage();
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe(25);
  });

  it('prevents adding duplicates with the same Pokémon ID', () => {
    let list: FavoritePokemonItem[] = [];
    list = executeAdd(list, { id: 25, name: 'Pikachu' });
    list = executeAdd(list, { id: 25, name: 'Pikachu' });
    list = executeAdd(list, { id: 25, name: 'pikachu' });

    expect(list.length).toBe(1);
    expect(list[0].id).toBe(25);
  });

  it('preserves newest-first ordering on multiple adds', async () => {
    let list: FavoritePokemonItem[] = [];
    list = executeAdd(list, { id: 1, name: 'bulbasaur' });
    // Slight tick to ensure distinct timestamps
    await new Promise((r) => setTimeout(r, 2));
    list = executeAdd(list, { id: 4, name: 'charmander' });
    await new Promise((r) => setTimeout(r, 2));
    list = executeAdd(list, { id: 7, name: 'squirtle' });

    expect(list.length).toBe(3);
    expect(list[0].id).toBe(7); // Most recent
    expect(list[1].id).toBe(4);
    expect(list[2].id).toBe(1); // Oldest
  });

  it('removes a favorite Pokémon and updates persistence', () => {
    let list: FavoritePokemonItem[] = [
      { id: 25, name: 'pikachu', addedAt: 100 },
      { id: 6, name: 'charizard', addedAt: 200 },
    ];
    saveFavoritesToStorage(list);

    list = executeRemove(list, 25);
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(6);

    const stored = loadFavoritesFromStorage();
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe(6);
  });

  it('ignores removing an ID that does not exist in favorites', () => {
    const list: FavoritePokemonItem[] = [
      { id: 25, name: 'pikachu', addedAt: 100 },
    ];
    const updated = executeRemove(list, 999);
    expect(updated).toBe(list); // Identity preserved
  });

  it('toggles favorite on and off accurately', () => {
    const list: FavoritePokemonItem[] = [];

    // Toggle ON
    const step1 = executeToggle(list, { id: 150, name: 'Mewtwo' });
    expect(step1.wasAdded).toBe(true);
    expect(step1.next.length).toBe(1);
    expect(step1.next[0].id).toBe(150);

    // Toggle OFF
    const step2 = executeToggle(step1.next, { id: 150, name: 'Mewtwo' });
    expect(step2.wasAdded).toBe(false);
    expect(step2.next.length).toBe(0);

    // Toggle ON again
    const step3 = executeToggle(step2.next, { id: 150, name: 'Mewtwo' });
    expect(step3.wasAdded).toBe(true);
    expect(step3.next.length).toBe(1);
  });

  it('handles cross-tab storage synchronisation', () => {
    // Tab B modifies storage directly
    const tabBItems: FavoritePokemonItem[] = [
      { id: 143, name: 'snorlax', addedAt: 5000 },
    ];
    mockStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({ version: CURRENT_SCHEMA_VERSION, items: tabBItems })
    );

    // Tab A loads updated storage
    const synced = loadFavoritesFromStorage();
    expect(synced.length).toBe(1);
    expect(synced[0].name).toBe('snorlax');
  });
});
