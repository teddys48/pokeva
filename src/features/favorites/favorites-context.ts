import { createContext } from 'react';
import { FavoritePokemonItem } from '@/types/favorites';

export interface FavoritesContextValue {
  favorites: FavoritePokemonItem[];
  favoriteIds: Set<number>;
  totalFavorites: number;
  isFavorite: (id: number) => boolean;
  addFavorite: (pokemon: { id: number; name: string }) => void;
  removeFavorite: (id: number) => void;
  toggleFavorite: (pokemon: { id: number; name: string }) => boolean;
  clearFavorites: () => void;
}

export const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);
