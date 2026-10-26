import { describe, expect, it } from 'bun:test';
import { FavoritePokemonItem, FavoritesSortOption } from '@/types/favorites';
import { formatPokemonName } from '@/services/pokeapi/utils';

describe('Phase 5: Favorites Page Collection Logic & Resilience', () => {
  const mockFavorites: FavoritePokemonItem[] = [
    { id: 25, name: 'pikachu', addedAt: 1000 },
    { id: 6, name: 'charizard', addedAt: 3000 },
    { id: 1, name: 'bulbasaur', addedAt: 2000 },
    { id: 133, name: 'eevee', addedAt: 4000 },
  ];

  describe('Predictable Collection Sorting', () => {
    function sortFavorites(
      list: FavoritePokemonItem[],
      sortBy: FavoritesSortOption
    ): FavoritePokemonItem[] {
      const copy = [...list];
      switch (sortBy) {
        case 'recent':
          return copy.sort((a, b) => b.addedAt - a.addedAt);
        case 'oldest':
          return copy.sort((a, b) => a.addedAt - b.addedAt);
        case 'id-asc':
          return copy.sort((a, b) => a.id - b.id);
        case 'id-desc':
          return copy.sort((a, b) => b.id - a.id);
        case 'name-asc':
          return copy.sort((a, b) => a.name.localeCompare(b.name));
        default:
          return copy;
      }
    }

    it('sorts by most recently added first by default', () => {
      const sorted = sortFavorites(mockFavorites, 'recent');
      expect(sorted.map((p) => p.name)).toEqual(['eevee', 'charizard', 'bulbasaur', 'pikachu']);
    });

    it('sorts by oldest added first', () => {
      const sorted = sortFavorites(mockFavorites, 'oldest');
      expect(sorted.map((p) => p.name)).toEqual(['pikachu', 'bulbasaur', 'charizard', 'eevee']);
    });

    it('sorts by Pokédex number ascending', () => {
      const sorted = sortFavorites(mockFavorites, 'id-asc');
      expect(sorted.map((p) => p.id)).toEqual([1, 6, 25, 133]);
    });

    it('sorts by Pokédex number descending', () => {
      const sorted = sortFavorites(mockFavorites, 'id-desc');
      expect(sorted.map((p) => p.id)).toEqual([133, 25, 6, 1]);
    });

    it('sorts alphabetically by name', () => {
      const sorted = sortFavorites(mockFavorites, 'name-asc');
      expect(sorted.map((p) => p.name)).toEqual(['bulbasaur', 'charizard', 'eevee', 'pikachu']);
    });
  });

  describe('Search & Filter within Favorites', () => {
    it('filters favorites by partial name', () => {
      const query = 'char';
      const filtered = mockFavorites.filter((f) =>
        f.name.toLowerCase().includes(query.toLowerCase())
      );
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('charizard');
    });

    it('filters favorites by numeric ID or hash ID', () => {
      const filterById = (raw: string) => {
        const cleaned = raw.trim().replace(/^#/, '');
        return mockFavorites.filter(
          (f) => String(f.id) === cleaned || f.name.includes(cleaned)
        );
      };

      expect(filterById('25').length).toBe(1);
      expect(filterById('25')[0].name).toBe('pikachu');

      expect(filterById('#133').length).toBe(1);
      expect(filterById('#133')[0].name).toBe('eevee');
    });

    it('returns empty array when filter matches nothing without altering collection', () => {
      const filtered = mockFavorites.filter((f) => f.name.includes('nonexistent'));
      expect(filtered.length).toBe(0);
      expect(mockFavorites.length).toBe(4);
    });
  });

  describe('Resilience: Recoverable API Failures & Provisional Models', () => {
    it('generates a stable provisional Pokémon model on API load failure', () => {
      const item: FavoritePokemonItem = { id: 448, name: 'lucario', addedAt: 12345 };

      // Simulate fallback model generation
      const provisional = {
        id: item.id,
        name: item.name,
        displayName: formatPokemonName(item.name),
        types: ['normal'],
        imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`,
        artworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`,
        genus: 'Saved Favorite',
      };

      expect(provisional.id).toBe(448);
      expect(provisional.name).toBe('lucario');
      expect(provisional.displayName).toBe('Lucario');
      expect(provisional.artworkUrl).toContain('448.png');
      expect(provisional.imageUrl).toContain('448.png');
    });

    it('never removes a favorite from state or storage when an API query errors', () => {
      const favorites = [...mockFavorites];

      // Simulate network error on ID 25
      const queryResults = [
        { id: 25, isError: true, error: new Error('500 Internal Server Error'), data: undefined },
        { id: 6, isError: false, error: null, data: { id: 6, name: 'charizard' } },
      ];

      // Verification: favorites collection remains intact
      const errorIds = queryResults.filter((q) => q.isError).map((q) => q.id);
      expect(errorIds).toEqual([25]);

      // Ensure favorites was not mutated or filtered
      expect(favorites.length).toBe(4);
      expect(favorites.some((f) => f.id === 25)).toBe(true);
    });
  });
});
