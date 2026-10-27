import { queryOptions, useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  NamedAPIResource,
  NamedAPIResourceList,
  PaginationParams,
  PokeApiAbility,
  PokeApiEvolutionChain,
  PokeApiMove,
  PokeApiPokemon,
  PokeApiSpecies,
  PokeApiType,
} from '@/types/pokeapi';
import { isAbortError, isNotFoundError, isPokeApiError, PokeApiError } from './client';
import { pokemonService } from './pokemonService';
import { validatePaginationParams } from './utils';

/**
 * Standard stale time constants.
 * PokéAPI reference data is static and immutable for a given release.
 */
export const STALE_TIMES = {
  LIST: 1000 * 60 * 30, // 30 minutes
  DETAIL: 1000 * 60 * 60, // 60 minutes
  SPECIES: 1000 * 60 * 60, // 60 minutes
  TYPE: 1000 * 60 * 60, // 60 minutes
  EVOLUTION: 1000 * 60 * 60, // 60 minutes
  ABILITY: 1000 * 60 * 60, // 60 minutes
  MOVE: 1000 * 60 * 60, // 60 minutes
} as const;

/**
 * Retry policy:
 * Never retry on client 404s, aborted requests, or client-side validation errors.
 * Retry at most once for transient network or 5xx server drops.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isNotFoundError(error) || isAbortError(error)) {
    return false;
  }
  if (isPokeApiError(error) && error.code === 'VALIDATION_ERROR') {
    return false;
  }
  return failureCount < 2;
}

/**
 * Centralized Query Keys factory for PokéAPI data.
 * Guarantees consistent cache keys across services, prefetching, and components.
 */
export const pokemonKeys = {
  all: ['pokeapi'] as const,
  lists: () => [...pokemonKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => {
    const { limit, offset } = validatePaginationParams(params);
    return [...pokemonKeys.lists(), { limit, offset }] as const;
  },
  details: () => [...pokemonKeys.all, 'pokemon'] as const,
  detail: (idOrName: string | number) =>
    [...pokemonKeys.details(), String(idOrName).toLowerCase().trim()] as const,
  speciesAll: () => [...pokemonKeys.all, 'species'] as const,
  species: (idOrName: string | number) =>
    [...pokemonKeys.speciesAll(), String(idOrName).toLowerCase().trim()] as const,
  types: () => [...pokemonKeys.all, 'type'] as const,
  typesList: () => [...pokemonKeys.types(), 'list'] as const,
  type: (idOrName: string | number) =>
    [...pokemonKeys.types(), String(idOrName).toLowerCase().trim()] as const,
  evolutionChains: () => [...pokemonKeys.all, 'evolution-chain'] as const,
  evolutionChain: (idOrUrl: string | number) =>
    [...pokemonKeys.evolutionChains(), String(idOrUrl).trim()] as const,
  abilities: () => [...pokemonKeys.all, 'ability'] as const,
  ability: (idOrName: string | number) =>
    [...pokemonKeys.abilities(), String(idOrName).toLowerCase().trim()] as const,
  moves: () => [...pokemonKeys.all, 'move'] as const,
  move: (idOrName: string | number) =>
    [...pokemonKeys.moves(), String(idOrName).toLowerCase().trim()] as const,
};

/**
 * Reusable TanStack Query options.
 */
export const pokemonQueries = {
  list: (params?: PaginationParams) => {
    const validated = validatePaginationParams(params);
    return queryOptions<
      NamedAPIResourceList<NamedAPIResource>,
      PokeApiError,
      NamedAPIResourceList<NamedAPIResource>,
      ReturnType<typeof pokemonKeys.list>
    >({
      queryKey: pokemonKeys.list(validated),
      queryFn: ({ signal }) => pokemonService.getPokemonList(validated, signal),
      staleTime: STALE_TIMES.LIST,
      retry: shouldRetry,
    });
  },

  detail: (idOrName: string | number) => {
    const key = pokemonKeys.detail(idOrName);
    const hasIdentifier = Boolean(
      typeof idOrName === 'number' ? idOrName > 0 : idOrName?.toString().trim()
    );
    return queryOptions<
      PokeApiPokemon,
      PokeApiError,
      PokeApiPokemon,
      ReturnType<typeof pokemonKeys.detail>
    >({
      queryKey: key,
      queryFn: ({ signal }) => pokemonService.getPokemon(idOrName, signal),
      staleTime: STALE_TIMES.DETAIL,
      retry: shouldRetry,
      enabled: hasIdentifier,
    });
  },

  species: (idOrName: string | number) => {
    const key = pokemonKeys.species(idOrName);
    const hasIdentifier = Boolean(
      typeof idOrName === 'number' ? idOrName > 0 : idOrName?.toString().trim()
    );
    return queryOptions<
      PokeApiSpecies,
      PokeApiError,
      PokeApiSpecies,
      ReturnType<typeof pokemonKeys.species>
    >({
      queryKey: key,
      queryFn: ({ signal }) => pokemonService.getPokemonSpecies(idOrName, signal),
      staleTime: STALE_TIMES.SPECIES,
      retry: shouldRetry,
      enabled: hasIdentifier,
    });
  },

  typesList: () => {
    return queryOptions<
      NamedAPIResourceList<NamedAPIResource>,
      PokeApiError,
      NamedAPIResourceList<NamedAPIResource>,
      ReturnType<typeof pokemonKeys.typesList>
    >({
      queryKey: pokemonKeys.typesList(),
      queryFn: ({ signal }) => pokemonService.getTypeList(signal),
      staleTime: STALE_TIMES.TYPE,
      retry: shouldRetry,
    });
  },

  type: (idOrName: string | number) => {
    const key = pokemonKeys.type(idOrName);
    const hasIdentifier = Boolean(
      typeof idOrName === 'number' ? idOrName > 0 : idOrName?.toString().trim()
    );
    return queryOptions<
      PokeApiType,
      PokeApiError,
      PokeApiType,
      ReturnType<typeof pokemonKeys.type>
    >({
      queryKey: key,
      queryFn: ({ signal }) => pokemonService.getPokemonType(idOrName, signal),
      staleTime: STALE_TIMES.TYPE,
      retry: shouldRetry,
      enabled: hasIdentifier,
    });
  },

  evolutionChain: (idOrUrl: string | number) => {
    const key = pokemonKeys.evolutionChain(idOrUrl);
    const hasIdentifier = Boolean(
      typeof idOrUrl === 'number' ? idOrUrl > 0 : idOrUrl?.toString().trim()
    );
    return queryOptions<
      PokeApiEvolutionChain,
      PokeApiError,
      PokeApiEvolutionChain,
      ReturnType<typeof pokemonKeys.evolutionChain>
    >({
      queryKey: key,
      queryFn: ({ signal }) => pokemonService.getEvolutionChain(idOrUrl, signal),
      staleTime: STALE_TIMES.EVOLUTION,
      retry: shouldRetry,
      enabled: hasIdentifier,
    });
  },

  ability: (idOrName: string | number) => {
    const key = pokemonKeys.ability(idOrName);
    const hasIdentifier = Boolean(
      typeof idOrName === 'number' ? idOrName > 0 : idOrName?.toString().trim()
    );
    return queryOptions<
      PokeApiAbility,
      PokeApiError,
      PokeApiAbility,
      ReturnType<typeof pokemonKeys.ability>
    >({
      queryKey: key,
      queryFn: ({ signal }) => pokemonService.getAbility(idOrName, signal),
      staleTime: STALE_TIMES.ABILITY,
      retry: shouldRetry,
      enabled: hasIdentifier,
    });
  },

  move: (idOrName: string | number) => {
    const key = pokemonKeys.move(idOrName);
    const hasIdentifier = Boolean(
      typeof idOrName === 'number' ? idOrName > 0 : idOrName?.toString().trim()
    );
    return queryOptions<
      PokeApiMove,
      PokeApiError,
      PokeApiMove,
      ReturnType<typeof pokemonKeys.move>
    >({
      queryKey: key,
      queryFn: ({ signal }) => pokemonService.getMove(idOrName, signal),
      staleTime: STALE_TIMES.MOVE,
      retry: shouldRetry,
      enabled: hasIdentifier,
    });
  },
};

/**
 * Reusable Query Hooks
 */

export function usePokemonList(
  params?: PaginationParams
): UseQueryResult<NamedAPIResourceList<NamedAPIResource>, PokeApiError> {
  return useQuery(pokemonQueries.list(params));
}

export function usePokemonDetail(
  idOrName: string | number,
  options?: { enabled?: boolean }
): UseQueryResult<PokeApiPokemon, PokeApiError> {
  const queryConfig = pokemonQueries.detail(idOrName);
  return useQuery({
    ...queryConfig,
    enabled: options?.enabled !== undefined ? options.enabled && queryConfig.enabled : queryConfig.enabled,
  });
}

export function usePokemonSpecies(
  idOrName: string | number,
  options?: { enabled?: boolean }
): UseQueryResult<PokeApiSpecies, PokeApiError> {
  const queryConfig = pokemonQueries.species(idOrName);
  return useQuery({
    ...queryConfig,
    enabled: options?.enabled !== undefined ? options.enabled && queryConfig.enabled : queryConfig.enabled,
  });
}

export function useTypeList(): UseQueryResult<NamedAPIResourceList<NamedAPIResource>, PokeApiError> {
  return useQuery(pokemonQueries.typesList());
}

export function usePokemonType(
  idOrName: string | number,
  options?: { enabled?: boolean }
): UseQueryResult<PokeApiType, PokeApiError> {
  const queryConfig = pokemonQueries.type(idOrName);
  return useQuery({
    ...queryConfig,
    enabled: options?.enabled !== undefined ? options.enabled && queryConfig.enabled : queryConfig.enabled,
  });
}

export function useEvolutionChain(
  idOrUrl: string | number,
  options?: { enabled?: boolean }
): UseQueryResult<PokeApiEvolutionChain, PokeApiError> {
  const queryConfig = pokemonQueries.evolutionChain(idOrUrl);
  return useQuery({
    ...queryConfig,
    enabled: options?.enabled !== undefined ? options.enabled && queryConfig.enabled : queryConfig.enabled,
  });
}

export function useAbilityDetail(
  idOrName: string | number,
  options?: { enabled?: boolean }
): UseQueryResult<PokeApiAbility, PokeApiError> {
  const queryConfig = pokemonQueries.ability(idOrName);
  return useQuery({
    ...queryConfig,
    enabled: options?.enabled !== undefined ? options.enabled && queryConfig.enabled : queryConfig.enabled,
  });
}

export function useMoveDetail(
  idOrName: string | number,
  options?: { enabled?: boolean }
): UseQueryResult<PokeApiMove, PokeApiError> {
  const queryConfig = pokemonQueries.move(idOrName);
  return useQuery({
    ...queryConfig,
    enabled: options?.enabled !== undefined ? options.enabled && queryConfig.enabled : queryConfig.enabled,
  });
}
