import { describe, expect, it } from 'bun:test';
import { pokemonKeys, pokemonQueries, shouldRetry, STALE_TIMES } from '../queries';
import { PokeApiError } from '../client';

describe('TanStack Query Integration & Configuration', () => {
  describe('pokemonKeys Factory', () => {
    it('generates consistent and deterministic root keys', () => {
      expect(pokemonKeys.all).toEqual(['pokeapi']);
      expect(pokemonKeys.lists()).toEqual(['pokeapi', 'list']);
      expect(pokemonKeys.details()).toEqual(['pokeapi', 'pokemon']);
      expect(pokemonKeys.speciesAll()).toEqual(['pokeapi', 'species']);
      expect(pokemonKeys.types()).toEqual(['pokeapi', 'type']);
      expect(pokemonKeys.evolutionChains()).toEqual(['pokeapi', 'evolution-chain']);
    });

    it('normalizes pagination parameters in list query keys', () => {
      const key1 = pokemonKeys.list();
      expect(key1).toEqual(['pokeapi', 'list', { limit: 20, offset: 0 }]);

      const key2 = pokemonKeys.list({ limit: 50, offset: 100 });
      expect(key2).toEqual(['pokeapi', 'list', { limit: 50, offset: 100 }]);
    });

    it('normalizes identifiers to lowercase and trimmed strings in keys', () => {
      expect(pokemonKeys.detail('  PIKACHU  ')).toEqual(['pokeapi', 'pokemon', 'pikachu']);
      expect(pokemonKeys.detail(25)).toEqual(['pokeapi', 'pokemon', '25']);

      expect(pokemonKeys.species('  CHARIZARD  ')).toEqual(['pokeapi', 'species', 'charizard']);
      expect(pokemonKeys.species(6)).toEqual(['pokeapi', 'species', '6']);

      expect(pokemonKeys.type('  ELECTRIC  ')).toEqual(['pokeapi', 'type', 'electric']);
      expect(pokemonKeys.type(13)).toEqual(['pokeapi', 'type', '13']);

      expect(pokemonKeys.evolutionChain('  10  ')).toEqual(['pokeapi', 'evolution-chain', '10']);
      expect(pokemonKeys.evolutionChain(10)).toEqual(['pokeapi', 'evolution-chain', '10']);
    });
  });

  describe('Query Retry Policy (shouldRetry)', () => {
    it('does not retry 404 Not Found HTTP errors', () => {
      const notFoundError = new PokeApiError({
        message: 'Resource not found',
        code: 'HTTP_ERROR',
        status: 404,
      });

      expect(shouldRetry(0, notFoundError)).toBe(false);
      expect(shouldRetry(1, notFoundError)).toBe(false);
    });

    it('does not retry aborted requests', () => {
      const abortError = new PokeApiError({
        message: 'Request aborted',
        code: 'ABORT_ERROR',
      });

      expect(shouldRetry(0, abortError)).toBe(false);
    });

    it('does not retry client validation errors', () => {
      const validationError = new PokeApiError({
        message: 'Invalid limit',
        code: 'VALIDATION_ERROR',
      });

      expect(shouldRetry(0, validationError)).toBe(false);
    });

    it('retries transient 5xx server errors up to 2 times', () => {
      const serverError = new PokeApiError({
        message: 'Internal error',
        code: 'HTTP_ERROR',
        status: 500,
      });

      expect(shouldRetry(0, serverError)).toBe(true);
      expect(shouldRetry(1, serverError)).toBe(true);
      expect(shouldRetry(2, serverError)).toBe(false);
    });

    it('retries transient network drops up to 2 times', () => {
      const networkError = new PokeApiError({
        message: 'Network drop',
        code: 'NETWORK_ERROR',
      });

      expect(shouldRetry(0, networkError)).toBe(true);
      expect(shouldRetry(1, networkError)).toBe(true);
      expect(shouldRetry(2, networkError)).toBe(false);
    });
  });

  describe('pokemonQueries Options', () => {
    it('configures sensible stale times for reference data', () => {
      const listOpts = pokemonQueries.list();
      expect(listOpts.staleTime).toBe(STALE_TIMES.LIST);
      expect(listOpts.staleTime).toBe(1000 * 60 * 30);

      const detailOpts = pokemonQueries.detail('pikachu');
      expect(detailOpts.staleTime).toBe(STALE_TIMES.DETAIL);
      expect(detailOpts.staleTime).toBe(1000 * 60 * 60);

      const speciesOpts = pokemonQueries.species('pikachu');
      expect(speciesOpts.staleTime).toBe(STALE_TIMES.SPECIES);

      const typeOpts = pokemonQueries.type('electric');
      expect(typeOpts.staleTime).toBe(STALE_TIMES.TYPE);

      const evoOpts = pokemonQueries.evolutionChain(10);
      expect(evoOpts.staleTime).toBe(STALE_TIMES.EVOLUTION);
    });

    it('disables queries when identifier is empty', () => {
      const emptyDetail = pokemonQueries.detail('');
      expect(emptyDetail.enabled).toBe(false);

      const validDetail = pokemonQueries.detail('lucario');
      expect(validDetail.enabled).toBe(true);

      const zeroDetail = pokemonQueries.detail(0);
      expect(zeroDetail.enabled).toBe(false);

      const validIdDetail = pokemonQueries.detail(448);
      expect(validIdDetail.enabled).toBe(true);
    });

    it('forwards query cancellation signal through queryFn', async () => {
      const controller = new AbortController();
      controller.abort();

      const detailOptions = pokemonQueries.detail('gengar');
      const queryFn = detailOptions.queryFn;

      if (!queryFn) {
        expect().fail('queryFn should be defined');
        return;
      }

      try {
        await queryFn({
          queryKey: pokemonKeys.detail('gengar'),
          signal: controller.signal,
          meta: undefined,
        } as unknown as Parameters<typeof queryFn>[0]);
        expect().fail('Expected queryFn to throw when signal is aborted');
      } catch (err: unknown) {
        if (err instanceof PokeApiError) {
          expect(err.code).toBe('ABORT_ERROR');
        } else {
          expect().fail('Expected PokeApiError');
        }
      }
    });
  });
});
