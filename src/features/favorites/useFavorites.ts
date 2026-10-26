import { useContext } from 'react';
import { FavoritesContext, FavoritesContextValue } from './favorites-context';

/**
 * Custom hook to access favorites state and actions.
 * Throws a helpful error if used outside of FavoritesProvider.
 */
export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
