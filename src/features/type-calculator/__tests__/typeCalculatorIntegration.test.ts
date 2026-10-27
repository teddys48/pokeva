import { describe, expect, it } from 'bun:test';
import { PokeApiClient, PokeApiError } from '@/services/pokeapi/client';
import { PokemonService } from '@/services/pokeapi/pokemonService';
import {
  calculateMatchupSummary,
  calculateTypeEffectivenessMultiplier,
} from '@/services/pokeapi/typeEffectiveness';
import { PokeApiPokemon, PokeApiType } from '@/types/pokeapi';

/**
 * High-fidelity mock responses for PokeAPI elemental types.
 */
const MOCK_TYPE_DATA: Record<string, PokeApiType> = {
  grass: {
    id: 12,
    name: 'grass',
    damage_relations: {
      no_damage_to: [],
      half_damage_to: [{ name: 'flying', url: '' }, { name: 'poison', url: '' }, { name: 'bug', url: '' }, { name: 'steel', url: '' }, { name: 'fire', url: '' }, { name: 'grass', url: '' }, { name: 'dragon', url: '' }],
      double_damage_to: [{ name: 'ground', url: '' }, { name: 'rock', url: '' }, { name: 'water', url: '' }],
      no_damage_from: [],
      half_damage_from: [{ name: 'ground', url: '' }, { name: 'water', url: '' }, { name: 'grass', url: '' }, { name: 'electric', url: '' }],
      double_damage_from: [{ name: 'flying', url: '' }, { name: 'poison', url: '' }, { name: 'bug', url: '' }, { name: 'fire', url: '' }, { name: 'ice', url: '' }],
    },
    pokemon: [],
    generation: { name: 'generation-i', url: '' },
    move_damage_class: null,
    names: [],
  },
  steel: {
    id: 9,
    name: 'steel',
    damage_relations: {
      no_damage_to: [{ name: 'steel', url: '' }],
      half_damage_to: [{ name: 'fire', url: '' }, { name: 'water', url: '' }, { name: 'electric', url: '' }],
      double_damage_to: [{ name: 'rock', url: '' }, { name: 'ice', url: '' }, { name: 'fairy', url: '' }],
      no_damage_from: [{ name: 'poison', url: '' }],
      half_damage_from: [{ name: 'normal', url: '' }, { name: 'flying', url: '' }, { name: 'rock', url: '' }, { name: 'bug', url: '' }, { name: 'steel', url: '' }, { name: 'grass', url: '' }, { name: 'psychic', url: '' }, { name: 'ice', url: '' }, { name: 'dragon', url: '' }, { name: 'fairy', url: '' }],
      double_damage_from: [{ name: 'fighting', url: '' }, { name: 'ground', url: '' }, { name: 'fire', url: '' }],
    },
    pokemon: [],
    generation: { name: 'generation-ii', url: '' },
    move_damage_class: null,
    names: [],
  },
  fire: {
    id: 10,
    name: 'fire',
    damage_relations: {
      no_damage_to: [],
      half_damage_to: [{ name: 'rock', url: '' }, { name: 'fire', url: '' }, { name: 'water', url: '' }, { name: 'dragon', url: '' }],
      double_damage_to: [{ name: 'bug', url: '' }, { name: 'steel', url: '' }, { name: 'grass', url: '' }, { name: 'ice', url: '' }],
      no_damage_from: [],
      half_damage_from: [{ name: 'bug', url: '' }, { name: 'steel', url: '' }, { name: 'fire', url: '' }, { name: 'grass', url: '' }, { name: 'ice', url: '' }, { name: 'fairy', url: '' }],
      double_damage_from: [{ name: 'ground', url: '' }, { name: 'rock', url: '' }, { name: 'water', url: '' }],
    },
    pokemon: [],
    generation: { name: 'generation-i', url: '' },
    move_damage_class: null,
    names: [],
  },
  flying: {
    id: 3,
    name: 'flying',
    damage_relations: {
      no_damage_to: [],
      half_damage_to: [{ name: 'rock', url: '' }, { name: 'steel', url: '' }, { name: 'electric', url: '' }],
      double_damage_to: [{ name: 'fighting', url: '' }, { name: 'bug', url: '' }, { name: 'grass', url: '' }],
      no_damage_from: [{ name: 'ground', url: '' }],
      half_damage_from: [{ name: 'fighting', url: '' }, { name: 'bug', url: '' }, { name: 'grass', url: '' }],
      double_damage_from: [{ name: 'rock', url: '' }, { name: 'electric', url: '' }, { name: 'ice', url: '' }],
    },
    pokemon: [],
    generation: { name: 'generation-i', url: '' },
    move_damage_class: null,
    names: [],
  },
  normal: {
    id: 1,
    name: 'normal',
    damage_relations: {
      no_damage_to: [{ name: 'ghost', url: '' }],
      half_damage_to: [{ name: 'rock', url: '' }, { name: 'steel', url: '' }],
      double_damage_to: [],
      no_damage_from: [{ name: 'ghost', url: '' }],
      half_damage_from: [],
      double_damage_from: [{ name: 'fighting', url: '' }],
    },
    pokemon: [],
    generation: { name: 'generation-i', url: '' },
    move_damage_class: null,
    names: [],
  },
};

/**
 * Mock responses for Pokémon detail lookup.
 */
const MOCK_POKEMON_DATA: Record<string, PokeApiPokemon> = {
  charizard: {
    id: 6,
    name: 'charizard',
    base_experience: 240,
    height: 17,
    is_default: true,
    order: 7,
    weight: 905,
    abilities: [],
    forms: [],
    species: { name: 'charizard', url: '' },
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
      front_shiny: null,
      front_female: null,
      front_shiny_female: null,
      back_default: null,
      back_shiny: null,
      back_female: null,
      back_shiny_female: null,
      other: {
        'official-artwork': {
          front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
        },
      },
    },
    stats: [],
    types: [
      { slot: 1, type: { name: 'fire', url: 'https://pokeapi.co/api/v2/type/10/' } },
      { slot: 2, type: { name: 'flying', url: 'https://pokeapi.co/api/v2/type/3/' } },
    ],
  },
  bulbasaur: {
    id: 1,
    name: 'bulbasaur',
    base_experience: 64,
    height: 7,
    is_default: true,
    order: 1,
    weight: 69,
    abilities: [],
    forms: [],
    species: { name: 'bulbasaur', url: '' },
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
      front_shiny: null,
      front_female: null,
      front_shiny_female: null,
      back_default: null,
      back_shiny: null,
      back_female: null,
      back_shiny_female: null,
      other: {
        'official-artwork': {
          front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
        },
      },
    },
    stats: [],
    types: [
      { slot: 1, type: { name: 'grass', url: 'https://pokeapi.co/api/v2/type/12/' } },
    ],
  },
};

describe('Phase 8 Integration: Type Effectiveness Calculator Layer', () => {
  function createMockService(networkFails = false) {
    const mockFetch = async (url: string) => {
      if (networkFails) {
        throw new Error('Network error');
      }

      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname;

      // Handle GET /type/{name}
      if (path.startsWith('/api/v2/type/')) {
        const typeName = path.split('/').pop()?.toLowerCase();
        if (typeName && MOCK_TYPE_DATA[typeName]) {
          return new Response(JSON.stringify(MOCK_TYPE_DATA[typeName]), { status: 200 });
        }
        return new Response('Not Found', { status: 404 });
      }

      // Handle GET /pokemon/{idOrName}
      if (path.startsWith('/api/v2/pokemon/')) {
        const idOrName = path.split('/').pop()?.toLowerCase();
        if (idOrName && MOCK_POKEMON_DATA[idOrName]) {
          return new Response(JSON.stringify(MOCK_POKEMON_DATA[idOrName]), { status: 200 });
        }
        return new Response('Not Found', { status: 404 });
      }

      return new Response('Not Found', { status: 404 });
    };

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });
    return new PokemonService(client);
  }

  describe('Mode A: Manual Defending & Attacking Type Selection', () => {
    it('fetches single-type defender and calculates weaknesses and resistances', async () => {
      const service = createMockService();
      const grass = await service.getPokemonType('grass');

      const summary = calculateMatchupSummary(grass, null);
      expect(summary.defender1).toBe('grass');
      expect(summary.defender2).toBeNull();

      // Fire is super effective against single Grass (2×)
      const fireMatchup = summary.weaknesses.find((w) => w.attackingType === 'fire');
      expect(fireMatchup).toBeDefined();
      expect(fireMatchup?.multiplier).toBe(2);
      expect(fireMatchup?.formattedMultiplier).toBe('2×');

      // Water is not very effective against Grass (½×)
      const waterMatchup = summary.resistances.find((r) => r.attackingType === 'water');
      expect(waterMatchup).toBeDefined();
      expect(waterMatchup?.multiplier).toBe(0.5);
      expect(waterMatchup?.formattedMultiplier).toBe('½×');
    });

    it('calculates compound dual-type effectiveness when second type is added', async () => {
      const service = createMockService();
      const grass = await service.getPokemonType('grass');
      const steel = await service.getPokemonType('steel');

      const summary = calculateMatchupSummary(grass, steel);
      expect(summary.defender1).toBe('grass');
      expect(summary.defender2).toBe('steel');

      // Fire deals 4× to Grass/Steel (2× on Grass, 2× on Steel)
      const fireMatchup = summary.weaknesses.find((w) => w.attackingType === 'fire');
      expect(fireMatchup?.multiplier).toBe(4);
      expect(fireMatchup?.formattedMultiplier).toBe('4×');

      // Poison is immune (0×) due to Steel typing, overriding Grass weakness
      const poisonMatchup = summary.immunities.find((i) => i.attackingType === 'poison');
      expect(poisonMatchup).toBeDefined();
      expect(poisonMatchup?.multiplier).toBe(0);
      expect(poisonMatchup?.formattedMultiplier).toBe('0×');
    });

    it('correctly isolates a single attacking type matchup', async () => {
      const service = createMockService();
      const grass = await service.getPokemonType('grass');
      const steel = await service.getPokemonType('steel');

      // Direct calculation for Fire vs Grass/Steel
      const multiplier = calculateTypeEffectivenessMultiplier('fire', grass, steel);
      expect(multiplier).toBe(4);

      // Direct calculation for Ground vs Grass/Steel (Grass 0.5×, Steel 2× -> 1×)
      const groundMultiplier = calculateTypeEffectivenessMultiplier('ground', grass, steel);
      expect(groundMultiplier).toBe(1);
    });

    it('handles removal of second defending type back to single-type calculation', async () => {
      const service = createMockService();
      const grass = await service.getPokemonType('grass');
      const steel = await service.getPokemonType('steel');

      // With steel (dual type)
      const dualSummary = calculateMatchupSummary(grass, steel);
      expect(dualSummary.defender2).toBe('steel');

      // Clear steel (reverting to single type)
      const singleSummary = calculateMatchupSummary(grass, null);
      expect(singleSummary.defender2).toBeNull();
      expect(singleSummary.weaknesses.some((w) => w.attackingType === 'fire' && w.multiplier === 2)).toBe(true);
    });

    it('safely handles duplicate defender types without double multiplication', async () => {
      const service = createMockService();
      const fire = await service.getPokemonType('fire');

      // Selecting Fire as both defender 1 and defender 2
      const summary = calculateMatchupSummary(fire, fire);
      expect(summary.defender1).toBe('fire');
      expect(summary.defender2).toBeNull(); // Cleaned up to avoid double counting

      // Water deals 2× to Fire, not 4×
      const waterMultiplier = calculateTypeEffectivenessMultiplier('water', fire, fire);
      expect(waterMultiplier).toBe(2);
    });

    it('swapping defender 1 and defender 2 produces identical calculation results', async () => {
      const service = createMockService();
      const grass = await service.getPokemonType('grass');
      const steel = await service.getPokemonType('steel');

      const orderA = calculateMatchupSummary(grass, steel);
      const orderB = calculateMatchupSummary(steel, grass);

      expect(orderA.weaknesses.map((w) => w.attackingType).sort()).toEqual(
        orderB.weaknesses.map((w) => w.attackingType).sort()
      );
      expect(orderA.resistances.map((r) => r.attackingType).sort()).toEqual(
        orderB.resistances.map((r) => r.attackingType).sort()
      );
      expect(orderA.immunities.map((i) => i.attackingType).sort()).toEqual(
        orderB.immunities.map((i) => i.attackingType).sort()
      );
    });
  });

  describe('Mode B: Pokémon Selection Integration', () => {
    it('fetches Pokémon types on demand without downloading full catalog in bulk', async () => {
      let bulkListRequested = false;
      let requestedPokemonName = '';

      const mockFetch = async (url: string) => {
        if (url.includes('/pokemon?')) {
          bulkListRequested = true;
        }
        if (url.includes('/pokemon/charizard')) {
          requestedPokemonName = 'charizard';
          return new Response(JSON.stringify(MOCK_POKEMON_DATA['charizard']), { status: 200 });
        }
        if (url.includes('/type/fire')) {
          return new Response(JSON.stringify(MOCK_TYPE_DATA['fire']), { status: 200 });
        }
        if (url.includes('/type/flying')) {
          return new Response(JSON.stringify(MOCK_TYPE_DATA['flying']), { status: 200 });
        }
        return new Response('Not Found', { status: 404 });
      };

      const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });
      const service = new PokemonService(client);

      // Select Charizard
      const pokemon = await service.getPokemon('charizard');
      expect(bulkListRequested).toBe(false); // Validates: no bulk catalog download
      expect(requestedPokemonName).toBe('charizard');
      expect(pokemon.types).toHaveLength(2);

      const type1Name = pokemon.types[0].type.name;
      const type2Name = pokemon.types[1].type.name;
      expect(type1Name).toBe('fire');
      expect(type2Name).toBe('flying');

      // Fetch the two types for Charizard
      const d1 = await service.getPokemonType(type1Name);
      const d2 = await service.getPokemonType(type2Name);
      const summary = calculateMatchupSummary(d1, d2);

      // Rock deals 4× to Charizard (Fire 2×, Flying 2× -> 4×)
      expect(calculateTypeEffectivenessMultiplier('rock', d1, d2)).toBe(4);

      // Ground is 0× immunity due to Flying
      expect(calculateTypeEffectivenessMultiplier('ground', d1, d2)).toBe(0);

      // Grass deals ¼× double resistance (Fire 0.5×, Flying 0.5× -> 0.25×)
      expect(calculateTypeEffectivenessMultiplier('grass', d1, d2)).toBe(0.25);

      expect(summary.weaknesses.some((w) => w.attackingType === 'rock' && w.multiplier === 4)).toBe(true);
      expect(summary.immunities.some((i) => i.attackingType === 'ground' && i.multiplier === 0)).toBe(true);
      expect(summary.resistances.some((r) => r.attackingType === 'grass' && r.multiplier === 0.25)).toBe(true);
    });

    it('supports selecting a different target Pokémon', async () => {
      const service = createMockService();
      const bulbasaur = await service.getPokemon('bulbasaur');
      expect(bulbasaur.name).toBe('bulbasaur');
      expect(bulbasaur.types[0].type.name).toBe('grass');

      const charizard = await service.getPokemon('charizard');
      expect(charizard.name).toBe('charizard');
      expect(charizard.types[0].type.name).toBe('fire');
      expect(charizard.types[1].type.name).toBe('flying');
    });
  });

  describe('Resilience, Error & Retry States', () => {
    it('properly propagates network and HTTP errors during type fetching', async () => {
      const failingService = createMockService(true);

      try {
        await failingService.getPokemonType('fire');
        expect().fail('Expected network error');
      } catch (err) {
        expect(err instanceof PokeApiError).toBe(true);
        if (err instanceof PokeApiError) {
          expect(err.code).toBe('NETWORK_ERROR');
        }
      }
    });

    it('recovers cleanly when retried after transient failure', async () => {
      let callCount = 0;
      const transientFetch = async (_url: string) => {
        callCount++;
        if (callCount === 1) {
          return new Response('Service Unavailable', { status: 503 });
        }
        return new Response(JSON.stringify(MOCK_TYPE_DATA['fire']), { status: 200 });
      };

      const client = new PokeApiClient({ fetchFn: transientFetch as unknown as typeof fetch });
      const service = new PokemonService(client);

      // First call fails
      try {
        await service.getPokemonType('fire');
      } catch (err) {
        expect(err instanceof PokeApiError).toBe(true);
      }

      // Retry call succeeds
      const result = await service.getPokemonType('fire');
      expect(result.name).toBe('fire');
      expect(callCount).toBe(2);
    });
  });

  describe('Routing & Pre-filled Parameters Integration', () => {
    it('generates consistent detail page entry URL parameters', () => {
      const pokemon = MOCK_POKEMON_DATA['charizard'];
      const d1 = pokemon.types[0]?.type?.name || 'normal';
      const d2 = pokemon.types[1]?.type?.name || '';

      const targetUrl = `/type-calculator?pokemon=${encodeURIComponent(pokemon.name)}&defender1=${d1}${
        d2 ? `&defender2=${d2}` : ''
      }`;

      expect(targetUrl).toBe('/type-calculator?pokemon=charizard&defender1=fire&defender2=flying');

      // Verify that URLSearchParams can parse it accurately
      const parsed = new URLSearchParams(targetUrl.replace('/type-calculator?', ''));
      expect(parsed.get('pokemon')).toBe('charizard');
      expect(parsed.get('defender1')).toBe('fire');
      expect(parsed.get('defender2')).toBe('flying');
    });

    it('correctly handles single-type Pokémon in entry URL parameters', () => {
      const pokemon = MOCK_POKEMON_DATA['bulbasaur'];
      const d1 = pokemon.types[0]?.type?.name || 'normal';
      const d2 = pokemon.types[1]?.type?.name || '';

      const targetUrl = `/type-calculator?pokemon=${encodeURIComponent(pokemon.name)}&defender1=${d1}${
        d2 ? `&defender2=${d2}` : ''
      }`;

      expect(targetUrl).toBe('/type-calculator?pokemon=bulbasaur&defender1=grass');
      const parsed = new URLSearchParams(targetUrl.replace('/type-calculator?', ''));
      expect(parsed.get('defender1')).toBe('grass');
      expect(parsed.get('defender2')).toBeNull();
    });
  });
});
