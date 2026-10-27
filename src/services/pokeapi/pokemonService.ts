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
import { pokeApiClient, PokeApiClient, PokeApiError } from './client';
import { extractIdFromUrl, validatePaginationParams } from './utils';

/**
 * Validates and sanitizes an ID or Name resource identifier.
 */
function sanitizeIdOrName(identifier: string | number, resourceName: string): string {
  if (typeof identifier === 'number') {
    if (!Number.isInteger(identifier) || identifier < 1) {
      throw new PokeApiError({
        message: `Invalid ${resourceName} ID "${identifier}". ID must be a positive integer.`,
        code: 'VALIDATION_ERROR',
        userMessage: `Invalid ${resourceName} ID.`,
      });
    }
    return identifier.toString();
  }

  const trimmed = identifier.trim().toLowerCase();
  if (!trimmed) {
    throw new PokeApiError({
      message: `${resourceName} identifier cannot be empty.`,
      code: 'VALIDATION_ERROR',
      userMessage: `Please provide a valid ${resourceName} name or ID.`,
    });
  }

  // Prevent path traversal or URL manipulation
  if (!/^[a-z0-9-]+$/.test(trimmed)) {
    throw new PokeApiError({
      message: `Invalid ${resourceName} identifier "${identifier}". Only alphanumeric characters and hyphens are permitted.`,
      code: 'VALIDATION_ERROR',
      userMessage: `Invalid ${resourceName} identifier.`,
    });
  }

  return encodeURIComponent(trimmed);
}

/**
 * Service providing typed access to official PokéAPI v2 endpoints.
 */
export class PokemonService {
  constructor(private readonly client: PokeApiClient = pokeApiClient) {}

  /**
   * Fetch paginated Pokémon resource listing.
   * Endpoint: GET /pokemon?limit={limit}&offset={offset}
   */
  public async getPokemonList(
    params?: PaginationParams,
    signal?: AbortSignal
  ): Promise<NamedAPIResourceList<NamedAPIResource>> {
    const { limit, offset } = validatePaginationParams(params);

    return this.client.get<NamedAPIResourceList<NamedAPIResource>>('/pokemon', {
      params: { limit, offset },
      signal,
    });
  }

  /**
   * Fetch individual Pokémon data by ID or lowercase name.
   * Endpoint: GET /pokemon/{id-or-name}
   */
  public async getPokemon(
    idOrName: string | number,
    signal?: AbortSignal
  ): Promise<PokeApiPokemon> {
    const sanitized = sanitizeIdOrName(idOrName, 'Pokémon');
    return this.client.get<PokeApiPokemon>(`/pokemon/${sanitized}`, { signal });
  }

  /**
   * Fetch species data by ID or name (flavor text, genera, evolution chain link).
   * Endpoint: GET /pokemon-species/{id-or-name}
   */
  public async getPokemonSpecies(
    idOrName: string | number,
    signal?: AbortSignal
  ): Promise<PokeApiSpecies> {
    const sanitized = sanitizeIdOrName(idOrName, 'Species');
    return this.client.get<PokeApiSpecies>(`/pokemon-species/${sanitized}`, { signal });
  }

  /**
   * Fetch elemental type resource data (damage relations, Pokémon of this type).
   * Endpoint: GET /type/{id-or-name}
   */
  public async getPokemonType(
    idOrName: string | number,
    signal?: AbortSignal
  ): Promise<PokeApiType> {
    const sanitized = sanitizeIdOrName(idOrName, 'Type');
    return this.client.get<PokeApiType>(`/type/${sanitized}`, { signal });
  }

  /**
   * Fetch elemental type listing.
   * Endpoint: GET /type
   */
  public async getTypeList(
    signal?: AbortSignal
  ): Promise<NamedAPIResourceList<NamedAPIResource>> {
    return this.client.get<NamedAPIResourceList<NamedAPIResource>>('/type', { signal });
  }

  /**
   * Fetch evolution chain resource by numeric ID or full PokéAPI URL.
   * Endpoint: GET /evolution-chain/{id}
   */
  public async getEvolutionChain(
    idOrUrl: string | number,
    signal?: AbortSignal
  ): Promise<PokeApiEvolutionChain> {
    let chainId: number | null = null;

    if (typeof idOrUrl === 'string' && (idOrUrl.includes('/') || idOrUrl.startsWith('http'))) {
      chainId = extractIdFromUrl(idOrUrl);
      if (!chainId) {
        throw new PokeApiError({
          message: `Unable to extract evolution chain ID from URL: "${idOrUrl}"`,
          code: 'VALIDATION_ERROR',
          userMessage: 'Invalid evolution chain reference.',
        });
      }
    } else {
      const parsed = typeof idOrUrl === 'number' ? idOrUrl : parseInt(idOrUrl.trim(), 10);
      if (!Number.isInteger(parsed) || parsed < 1) {
        throw new PokeApiError({
          message: `Invalid evolution chain ID "${idOrUrl}". ID must be a positive integer.`,
          code: 'VALIDATION_ERROR',
          userMessage: 'Invalid evolution chain ID.',
        });
      }
      chainId = parsed;
    }

    return this.client.get<PokeApiEvolutionChain>(`/evolution-chain/${chainId}`, { signal });
  }

  /**
   * Fetch ability resource data by name or ID.
   * Endpoint: GET /ability/{id-or-name}
   */
  public async getAbility(
    idOrName: string | number,
    signal?: AbortSignal
  ): Promise<PokeApiAbility> {
    const sanitized = sanitizeIdOrName(idOrName, 'Ability');
    return this.client.get<PokeApiAbility>(`/ability/${sanitized}`, { signal });
  }

  /**
   * Fetch move resource data by name or ID.
   * Endpoint: GET /move/{id-or-name}
   */
  public async getMove(
    idOrName: string | number,
    signal?: AbortSignal
  ): Promise<PokeApiMove> {
    const sanitized = sanitizeIdOrName(idOrName, 'Move');
    return this.client.get<PokeApiMove>(`/move/${sanitized}`, { signal });
  }
}

/**
 * Default singleton instance of PokemonService.\n */
export const pokemonService = new PokemonService();
