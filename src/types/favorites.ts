/**
 * Phase 5: Favorites & Personal Collection Data Models
 *
 * Implements a lightweight, versionable schema for persisting favorite Pokémon.
 * Uses Pokémon ID as the stable primary identifier and stores only minimal metadata.
 */

export interface FavoritePokemonItem {
  /** Stable numeric Pokémon ID (1-based integer from PokéAPI) */
  id: number;
  /** Normalized lowercase Pokémon name (e.g. "pikachu", "charizard") */
  name: string;
  /** Unix timestamp in milliseconds when the Pokémon was added to favorites */
  addedAt: number;
}

export interface FavoritesStoragePayload {
  /** Schema version for forward-compatible storage migrations */
  version: 1;
  /** List of saved favorites */
  items: FavoritePokemonItem[];
}

export type FavoritesSortOption = 'recent' | 'oldest' | 'id-asc' | 'id-desc' | 'name-asc';
