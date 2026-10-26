import { describe, expect, it } from 'bun:test';
import { PokemonService } from '../pokemonService';
import { PokeApiClient } from '../client';
import { isPokeApiError } from '../client';

describe('PokemonService Endpoint Methods', () => {
  it('fetches paginated Pokémon listing with default parameters', async () => {
    let capturedUrl = '';
    const mockFetch = async (url: string) => {
      capturedUrl = url;
      return new Response(
        JSON.stringify({
          count: 1025,
          next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
          previous: null,
          results: [{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }],
        }),
        { status: 200 }
      );
    };

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });
    const service = new PokemonService(client);

    const result = await service.getPokemonList();
    expect(capturedUrl).toContain('/pokemon?limit=20&offset=0');
    expect(result.count).toBe(1025);
    expect(result.results.length).toBe(1);
    expect(result.results[0].name).toBe('bulbasaur');
  });

  it('fetches paginated Pokémon listing with custom limit and offset', async () => {
    let capturedUrl = '';
    const mockFetch = async (url: string) => {
      capturedUrl = url;
      return new Response(
        JSON.stringify({
          count: 1025,
          next: null,
          previous: 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=10',
          results: [],
        }),
        { status: 200 }
      );
    };

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });
    const service = new PokemonService(client);

    await service.getPokemonList({ limit: 10, offset: 50 });
    expect(capturedUrl).toContain('/pokemon?limit=10&offset=50');
  });

  it('rejects invalid pagination parameters with VALIDATION_ERROR', async () => {
    const service = new PokemonService();
    try {
      await service.getPokemonList({ limit: -1 });
      expect().fail('Expected validation error');
    } catch (err) {
      expect(isPokeApiError(err)).toBe(true);
      if (isPokeApiError(err)) {
        expect(err.code).toBe('VALIDATION_ERROR');
      }
    }
  });

  it('fetches Pokémon by numeric ID', async () => {
    let capturedUrl = '';
    const mockFetch = async (url: string) => {
      capturedUrl = url;
      return new Response(
        JSON.stringify({
          id: 25,
          name: 'pikachu',
          height: 4,
          weight: 60,
          abilities: [],
          stats: [],
          types: [],
        }),
        { status: 200 }
      );
    };

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });
    const service = new PokemonService(client);

    const result = await service.getPokemon(25);
    expect(capturedUrl).toContain('/pokemon/25');
    expect(result.id).toBe(25);
    expect(result.name).toBe('pikachu');
  });

  it('fetches Pokémon by name and sanitizes casing and whitespace', async () => {
    let capturedUrl = '';
    const mockFetch = async (url: string) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ id: 1, name: 'bulbasaur' }), { status: 200 });
    };

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });
    const service = new PokemonService(client);

    const result = await service.getPokemon('  BULBASAUR  ');
    expect(capturedUrl).toContain('/pokemon/bulbasaur');
    expect(result.name).toBe('bulbasaur');
  });

  it('rejects unsafe or invalid Pokémon identifiers', async () => {
    const service = new PokemonService();

    await expect(service.getPokemon('')).rejects.toThrow();
    await expect(service.getPokemon(0)).rejects.toThrow();
    await expect(service.getPokemon(-5)).rejects.toThrow();
    await expect(service.getPokemon('pikachu/../charizard')).rejects.toThrow();
    await expect(service.getPokemon('pokemon?limit=10')).rejects.toThrow();
  });

  it('fetches species information by name or ID', async () => {
    let capturedUrl = '';
    const mockFetch = async (url: string) => {
      capturedUrl = url;
      return new Response(
        JSON.stringify({
          id: 6,
          name: 'charizard',
          evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/2/' },
          flavor_text_entries: [],
          genera: [],
        }),
        { status: 200 }
      );
    };

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });
    const service = new PokemonService(client);

    const result = await service.getPokemonSpecies('charizard');
    expect(capturedUrl).toContain('/pokemon-species/charizard');
    expect(result.name).toBe('charizard');
  });

  it('fetches elemental type data by name or ID', async () => {
    let capturedUrl = '';
    const mockFetch = async (url: string) => {
      capturedUrl = url;
      return new Response(
        JSON.stringify({
          id: 10,
          name: 'fire',
          damage_relations: {
            no_damage_to: [],
            half_damage_to: [],
            double_damage_to: [],
            no_damage_from: [],
            half_damage_from: [],
            double_damage_from: [],
          },
          pokemon: [],
        }),
        { status: 200 }
      );
    };

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });
    const service = new PokemonService(client);

    const result = await service.getPokemonType('fire');
    expect(capturedUrl).toContain('/type/fire');
    expect(result.name).toBe('fire');
  });

  it('fetches evolution chain by numeric ID', async () => {
    let capturedUrl = '';
    const mockFetch = async (url: string) => {
      capturedUrl = url;
      return new Response(
        JSON.stringify({
          id: 7,
          chain: {
            is_baby: false,
            species: { name: 'eevee', url: 'https://pokeapi.co/api/v2/pokemon-species/133/' },
            evolution_details: [],
            evolves_to: [],
          },
        }),
        { status: 200 }
      );
    };

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });
    const service = new PokemonService(client);

    const result = await service.getEvolutionChain(7);
    expect(capturedUrl).toContain('/evolution-chain/7');
    expect(result.id).toBe(7);
    expect(result.chain.species.name).toBe('eevee');
  });

  it('fetches evolution chain when provided a species evolution_chain URL', async () => {
    let capturedUrl = '';
    const mockFetch = async (url: string) => {
      capturedUrl = url;
      return new Response(
        JSON.stringify({
          id: 2,
          chain: {
            is_baby: false,
            species: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon-species/4/' },
            evolution_details: [],
            evolves_to: [],
          },
        }),
        { status: 200 }
      );
    };

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });
    const service = new PokemonService(client);

    const result = await service.getEvolutionChain('https://pokeapi.co/api/v2/evolution-chain/2/');
    expect(capturedUrl).toContain('/evolution-chain/2');
    expect(result.id).toBe(2);
  });

  it('rejects invalid evolution chain URLs or identifiers', async () => {
    const service = new PokemonService();
    await expect(service.getEvolutionChain('')).rejects.toThrow();
    await expect(service.getEvolutionChain('https://example.com/no-id/')).rejects.toThrow();
    await expect(service.getEvolutionChain(-1)).rejects.toThrow();
  });

  it('forwards AbortSignal for request cancellation', async () => {
    const controller = new AbortController();
    controller.abort();

    const service = new PokemonService();
    try {
      await service.getPokemon('mewtwo', controller.signal);
      expect().fail('Expected aborted call to throw');
    } catch (err) {
      expect(isPokeApiError(err)).toBe(true);
      if (isPokeApiError(err)) {
        expect(err.code).toBe('ABORT_ERROR');
      }
    }
  });
});
