import { describe, expect, it } from 'bun:test';
import { PokemonService } from '@/services/pokeapi/pokemonService';
import { PokeApiClient, PokeApiError } from '@/services/pokeapi/client';
import { pokemonQueries, STALE_TIMES } from '@/services/pokeapi/queries';

describe('Phase 3 Integration: Pokédex Service & Query Layer', () => {
  it('loads paginated Pokémon listing with bounded concurrency configuration', async () => {
    let requestedLimit = 0;
    let requestedOffset = 0;

    const mockFetch = async (url: string) => {
      const parsed = new URL(url);
      requestedLimit = Number(parsed.searchParams.get('limit'));
      requestedOffset = Number(parsed.searchParams.get('offset'));

      return new Response(
        JSON.stringify({
          count: 1025,
          next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
          previous: null,
          results: Array.from({ length: 20 }).map((_, i) => ({
            name: `pokemon-${requestedOffset + i + 1}`,
            url: `https://pokeapi.co/api/v2/pokemon/${requestedOffset + i + 1}/`,
          })),
        }),
        { status: 200 }
      );
    };

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });
    const service = new PokemonService(client);

    // Fetch page 1 (limit 20, offset 0)
    const page1 = await service.getPokemonList({ limit: 20, offset: 0 });
    expect(requestedLimit).toBe(20);
    expect(requestedOffset).toBe(0);
    expect(page1.results.length).toBe(20);
    expect(page1.count).toBe(1025);
    expect(page1.results[0].name).toBe('pokemon-1');

    // Fetch page 2 (limit 20, offset 20)
    const page2 = await service.getPokemonList({ limit: 20, offset: 20 });
    expect(requestedLimit).toBe(20);
    expect(requestedOffset).toBe(20);
    expect(page2.results[0].name).toBe('pokemon-21');
  });

  it('fetches type-specific dataset for elemental filtering without entire catalog download', async () => {
    let requestedUrl = '';
    const mockFetch = async (url: string) => {
      requestedUrl = url;
      return new Response(
        JSON.stringify({
          id: 10,
          name: 'fire',
          pokemon: [
            { slot: 1, pokemon: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' } },
            { slot: 1, pokemon: { name: 'charmeleon', url: 'https://pokeapi.co/api/v2/pokemon/5/' } },
            { slot: 1, pokemon: { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' } },
          ],
        }),
        { status: 200 }
      );
    };

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });
    const service = new PokemonService(client);

    const typeData = await service.getPokemonType('fire');
    expect(requestedUrl).toContain('/type/fire');
    expect(typeData.name).toBe('fire');
    expect(typeData.pokemon.length).toBe(3);
    expect(typeData.pokemon[0].pokemon.name).toBe('charmander');
  });

  it('handles exact-name search lookup', async () => {
    const mockFetch = async (url: string) => {
      if (url.includes('/pokemon/lucario')) {
        return new Response(
          JSON.stringify({
            id: 448,
            name: 'lucario',
            height: 12,
            weight: 540,
            types: [
              { slot: 1, type: { name: 'fighting', url: '' } },
              { slot: 2, type: { name: 'steel', url: '' } },
            ],
            sprites: { front_default: 'https://example.com/lucario.png' },
            stats: [],
          }),
          { status: 200 }
        );
      }
      return new Response('Not Found', { status: 404 });
    };

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });
    const service = new PokemonService(client);

    const result = await service.getPokemon('lucario');
    expect(result.id).toBe(448);
    expect(result.name).toBe('lucario');
    expect(result.types.length).toBe(2);
  });

  it('distinguishes 404 from server network failures', async () => {
    // 404 Not Found
    const fetch404 = async () => new Response('Not Found', { status: 404 });
    const client404 = new PokeApiClient({ fetchFn: fetch404 as unknown as typeof fetch });
    const service404 = new PokemonService(client404);

    try {
      await service404.getPokemon('nonexistent-mon');
      expect().fail('Expected 404 error');
    } catch (err) {
      expect(err instanceof PokeApiError).toBe(true);
      if (err instanceof PokeApiError) {
        expect(err.status).toBe(404);
        expect(err.userMessage).toContain('could not be found');
      }
    }

    // 500 Internal Server Error
    const fetch500 = async () => new Response('Internal error', { status: 500 });
    const client500 = new PokeApiClient({ fetchFn: fetch500 as unknown as typeof fetch });
    const service500 = new PokemonService(client500);

    try {
      await service500.getPokemon('pikachu');
      expect().fail('Expected 500 error');
    } catch (err) {
      expect(err instanceof PokeApiError).toBe(true);
      if (err instanceof PokeApiError) {
        expect(err.status).toBe(500);
        expect(err.userMessage).toContain('temporarily unavailable');
      }
    }
  });

  it('configures proper stale times and caching for queries', () => {
    const listOpts = pokemonQueries.list({ limit: 20, offset: 0 });
    expect(listOpts.staleTime).toBe(STALE_TIMES.LIST);
    const listKey = listOpts.queryKey as unknown as [string, string, { limit: number; offset: number }];
    expect(listKey[0]).toBe('pokeapi');
    expect(listKey[1]).toBe('list');
    expect(listKey[2]).toEqual({ limit: 20, offset: 0 });

    const typeOpts = pokemonQueries.type('water');
    expect(typeOpts.staleTime).toBe(STALE_TIMES.TYPE);
    const typeKey = typeOpts.queryKey as unknown as [string, string, string];
    expect(typeKey[0]).toBe('pokeapi');
    expect(typeKey[1]).toBe('type');
    expect(typeKey[2]).toBe('water');

    const detailOpts = pokemonQueries.detail('pikachu');
    expect(detailOpts.staleTime).toBe(STALE_TIMES.DETAIL);
    const detailKey = detailOpts.queryKey as unknown as [string, string, string];
    expect(detailKey[0]).toBe('pokeapi');
    expect(detailKey[1]).toBe('pokemon');
    expect(detailKey[2]).toBe('pikachu');
  });
});
