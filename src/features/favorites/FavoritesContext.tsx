import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FavoritePokemonItem } from '@/types/favorites';
import { FavoritesContext, FavoritesContextValue } from './favorites-context';
import {
  FAVORITES_STORAGE_KEY,
  loadFavoritesFromStorage,
  saveFavoritesToStorage,
} from './favoritesStorage';

export interface FavoritesProviderProps {
  children: React.ReactNode;
  storageKey?: string;
  initialFavorites?: FavoritePokemonItem[];
}

export function FavoritesProvider({
  children,
  storageKey = FAVORITES_STORAGE_KEY,
  initialFavorites,
}: FavoritesProviderProps) {
  // Initialize state from storage or provided initial data
  const [favorites, setFavorites] = useState<FavoritePokemonItem[]>(() => {
    if (initialFavorites !== undefined) {
      return initialFavorites;
    }
    return loadFavoritesFromStorage(storageKey);
  });

  // Maintain a Set for O(1) membership lookups
  const favoriteIds = useMemo(() => {
    return new Set(favorites.map((item) => item.id));
  }, [favorites]);

  const isFavorite = useCallback(
    (id: number): boolean => {
      return favoriteIds.has(id);
    },
    [favoriteIds]
  );

  const addFavorite = useCallback(
    (pokemon: { id: number; name: string }) => {
      if (!pokemon || typeof pokemon.id !== 'number' || pokemon.id <= 0) {
        return;
      }

      setFavorites((prev) => {
        // Prevent duplicate entries
        if (prev.some((item) => item.id === pokemon.id)) {
          return prev;
        }

        const newItem: FavoritePokemonItem = {
          id: pokemon.id,
          name: pokemon.name.toLowerCase().trim(),
          addedAt: Date.now(),
        };

        const updated = [newItem, ...prev];
        saveFavoritesToStorage(updated, storageKey);
        return updated;
      });
    },
    [storageKey]
  );

  const removeFavorite = useCallback(
    (id: number) => {
      setFavorites((prev) => {
        if (!prev.some((item) => item.id === id)) {
          return prev;
        }

        const updated = prev.filter((item) => item.id !== id);
        saveFavoritesToStorage(updated, storageKey);
        return updated;
      });
    },
    [storageKey]
  );

  const toggleFavorite = useCallback(
    (pokemon: { id: number; name: string }): boolean => {
      if (isFavorite(pokemon.id)) {
        removeFavorite(pokemon.id);
        return false;
      } else {
        addFavorite(pokemon);
        return true;
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    saveFavoritesToStorage([], storageKey);
  }, [storageKey]);

  // Synchronize across browser tabs via storage events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        const synced = loadFavoritesFromStorage(storageKey);
        setFavorites(synced);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      favoriteIds,
      totalFavorites: favorites.length,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearFavorites,
    }),
    [favorites, favoriteIds, isFavorite, addFavorite, removeFavorite, toggleFavorite, clearFavorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
