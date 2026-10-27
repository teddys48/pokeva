import { QueryClient } from '@tanstack/react-query';
import { shouldRetry } from '@/services/pokeapi/queries';

/**
 * Centralized TanStack Query client configuration for Pokéva.
 * Tuned with sensible defaults for encyclopedic/reference data.
 *
 * Cache retention (gcTime) is set to 2 hours to comfortably preserve
 * cached resources across long browsing sessions, preventing redundant fetches.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 minutes default fresh window
      gcTime: 1000 * 60 * 120, // 2 hours inactive cache retention
      retry: shouldRetry,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
