import { FavoritePokemonItem, FavoritesStoragePayload } from '@/types/favorites';

export const FAVORITES_STORAGE_KEY = 'pokeva_favorites_v1';
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Validates a candidate item to ensure it matches the FavoritePokemonItem schema.
 * Rejects corrupt, missing, or negative ID values.
 */
export function validateFavoriteItem(item: unknown): FavoritePokemonItem | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const candidate = item as Record<string, unknown>;

  const id = candidate.id;
  if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
    return null;
  }

  const name = candidate.name;
  if (typeof name !== 'string' || name.trim().length === 0) {
    return null;
  }

  const addedAt = typeof candidate.addedAt === 'number' && Number.isFinite(candidate.addedAt) && candidate.addedAt > 0
    ? candidate.addedAt
    : Date.now();

  return {
    id,
    name: name.trim().toLowerCase(),
    addedAt,
  };
}

/**
 * Validates and normalizes raw parsed JSON into a clean list of FavoritePokemonItem.
 * Handles deduplication by Pokémon ID, sorting, and migration from legacy array structures.
 */
export function parseAndValidateFavoritesPayload(parsed: unknown): FavoritePokemonItem[] {
  if (!parsed) {
    return [];
  }

  let rawItems: unknown[] = [];

  // Versioned storage wrapper: { version: 1, items: [...] }
  if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
    const payload = parsed as Record<string, unknown>;
    if (Array.isArray(payload.items)) {
      rawItems = payload.items;
    }
  } else if (Array.isArray(parsed)) {
    // Gracefully handle legacy raw array representation if present
    rawItems = parsed;
  }

  const validated: FavoritePokemonItem[] = [];
  const seenIds = new Set<number>();

  for (const raw of rawItems) {
    const item = validateFavoriteItem(raw);
    if (item && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      validated.push(item);
    }
  }

  return validated;
}

/**
 * Safely loads persisted favorites from localStorage.
 * Returns an empty array if storage is empty, corrupt, or inaccessible.
 */
export function loadFavoritesFromStorage(storageKey: string = FAVORITES_STORAGE_KEY): FavoritePokemonItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return parseAndValidateFavoritesPayload(parsed);
  } catch {
    // Handles JSON parse errors, storage access denials, or security restrictions
    return [];
  }
}

/**
 * Safely persists favorites to localStorage under the versioned key.
 * Returns true on success, false if quota is exceeded or storage is disabled.
 */
export function saveFavoritesToStorage(
  favorites: FavoritePokemonItem[],
  storageKey: string = FAVORITES_STORAGE_KEY
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const payload: FavoritesStoragePayload = {
      version: CURRENT_SCHEMA_VERSION,
      items: favorites,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
    return true;
  } catch {
    // Gracefully catch quota exceeded, disabled storage, or DOMExceptions
    return false;
  }
}
