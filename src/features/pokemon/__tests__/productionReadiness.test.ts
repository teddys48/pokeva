import { describe, expect, it } from 'bun:test';
import { queryClient } from '@/lib/queryClient';
import { shouldRetry, STALE_TIMES, pokemonKeys } from '@/services/pokeapi/queries';
import { PokeApiError, PokeApiClient, POKEAPI_BASE_URL } from '@/services/pokeapi/client';
import { formatPokemonName } from '@/services/pokeapi/utils';
import { formatPokemonId } from '@/lib/utils';

describe('Phase 7: Performance, Production Readiness & Caching', () => {
  describe('Centralized QueryClient Configuration', () => {
    it('configures sensible default staleTime of at least 5 minutes', () => {
      const defaultOptions = queryClient.getDefaultOptions();
      const staleTime = defaultOptions.queries?.staleTime;
      expect(typeof staleTime).toBe('number');
      expect(Number(staleTime)).toBeGreaterThanOrEqual(1000 * 60 * 5);
    });

    it('configures gcTime to at least 60 minutes to prevent cache premature eviction', () => {
      const defaultOptions = queryClient.getDefaultOptions();
      const gcTime = defaultOptions.queries?.gcTime;
      expect(typeof gcTime).toBe('number');
      expect(Number(gcTime)).toBeGreaterThanOrEqual(1000 * 60 * 60);
    });

    it('disables refetchOnWindowFocus to prevent unnecessary PokéAPI traffic', () => {
      const defaultOptions = queryClient.getDefaultOptions();
      expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
    });

    it('enables refetchOnReconnect for offline-to-online recovery', () => {
      const defaultOptions = queryClient.getDefaultOptions();
      expect(defaultOptions.queries?.refetchOnReconnect).toBe(true);
    });
  });

  describe('PokéAPI Query Policy & Caching', () => {
    it('sets appropriate long stale times for static encyclopedic data', () => {
      expect(STALE_TIMES.LIST).toBeGreaterThanOrEqual(1000 * 60 * 15);
      expect(STALE_TIMES.DETAIL).toBeGreaterThanOrEqual(1000 * 60 * 30);
      expect(STALE_TIMES.SPECIES).toBeGreaterThanOrEqual(1000 * 60 * 30);
      expect(STALE_TIMES.EVOLUTION).toBeGreaterThanOrEqual(1000 * 60 * 30);
      expect(STALE_TIMES.ABILITY).toBeGreaterThanOrEqual(1000 * 60 * 30);
      expect(STALE_TIMES.MOVE).toBeGreaterThanOrEqual(1000 * 60 * 30);
    });

    it('generates consistent deterministic query keys for prefetching', () => {
      const key1 = pokemonKeys.detail('Pikachu');
      const key2 = pokemonKeys.detail(' pikachu ');
      expect(key1).toEqual(key2);
      expect(key1).toEqual(['pokeapi', 'pokemon', 'pikachu']);

      const speciesKey = pokemonKeys.species('Pikachu');
      expect(speciesKey).toEqual(['pokeapi', 'species', 'pikachu']);
    });

    it('does not retry permanent 404 HTTP errors', () => {
      const error404 = new PokeApiError({
        message: 'Not found',
        code: 'HTTP_ERROR',
        status: 404,
      });
      expect(shouldRetry(0, error404)).toBe(false);
      expect(shouldRetry(1, error404)).toBe(false);
    });

    it('does not retry aborted requests', () => {
      const abortError = new PokeApiError({
        message: 'Request aborted',
        code: 'ABORT_ERROR',
      });
      expect(shouldRetry(0, abortError)).toBe(false);
    });

    it('retries transient 5xx server errors up to 2 times', () => {
      const server500 = new PokeApiError({
        message: 'Internal server error',
        code: 'HTTP_ERROR',
        status: 500,
      });
      expect(shouldRetry(0, server500)).toBe(true);
      expect(shouldRetry(1, server500)).toBe(true);
      expect(shouldRetry(2, server500)).toBe(false);
    });
  });

  describe('PokéAPI Client Architecture & Base URL', () => {
    it('supports custom base URL without trailing slashes', () => {
      const customClient = new PokeApiClient({
        baseUrl: 'https://custom-pokeapi.example.com/api/v2/',
      });
      const url = customClient.buildUrl('pokemon/25');
      expect(url).toBe('https://custom-pokeapi.example.com/api/v2/pokemon/25');
    });

    it('handles absolute URLs gracefully without double prefixing', () => {
      const client = new PokeApiClient();
      const directUrl = client.buildUrl('https://pokeapi.co/api/v2/evolution-chain/10/');
      expect(directUrl).toBe('https://pokeapi.co/api/v2/evolution-chain/10/');
    });

    it('default POKEAPI_BASE_URL is a valid HTTPS endpoint', () => {
      expect(POKEAPI_BASE_URL.startsWith('https://')).toBe(true);
    });
  });

  describe('SEO & Dynamic Page Titles', () => {
    it('formats title for Pokemon detail correctly', () => {
      const name = formatPokemonName('charizard');
      const idStr = formatPokemonId(6);
      const title = `${name} (${idStr}) — Pokéva`;
      expect(title).toBe('Charizard (#0006) — Pokéva');
    });
  });
});
