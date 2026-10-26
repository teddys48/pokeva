import { describe, expect, it } from 'bun:test';
import { PokemonService } from '../pokemonService';
import { PokeApiClient, isPokeApiError } from '../client';
import { pokemonKeys, pokemonQueries } from '../queries';
import {
  formatEvolutionDetail,
  parseEvolutionChain,
  hasEvolutions,
  countChainNodes,
} from '../evolution';
import {
  processPokemonMoves,
  filterAndSortMoves,
} from '@/features/pokemon/detail/moveUtils';
import { PokeApiChainLink, PokeApiEvolutionDetail, PokeApiPokemonMove } from '@/types/pokeapi';

describe('Phase 4: Detail Services, Evolution & Move Processing', () => {
  describe('PokemonService getAbility & getMove', () => {
    it('fetches ability data by name and sanitizes casing', async () => {
      let capturedUrl = '';
      const mockFetch = async (url: string) => {
        capturedUrl = url;
        return new Response(
          JSON.stringify({
            id: 65,
            name: 'overgrow',
            is_main_series: true,
            effect_entries: [
              {
                effect: 'Ups Grass moves in a pinch.',
                short_effect: 'Powers up Grass-type moves when the Pokémon is in trouble.',
                language: { name: 'en', url: '' },
              },
            ],
            flavor_text_entries: [],
          }),
          { status: 200 }
        );
      };

      const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });
      const service = new PokemonService(client);

      const ability = await service.getAbility(' Overgrow ');
      expect(capturedUrl).toContain('/ability/overgrow');
      expect(ability.name).toBe('overgrow');
      expect(ability.effect_entries[0].short_effect).toContain('Powers up Grass-type moves');
    });

    it('fetches move data by numeric ID', async () => {
      let capturedUrl = '';
      const mockFetch = async (url: string) => {
        capturedUrl = url;
        return new Response(
          JSON.stringify({
            id: 85,
            name: 'thunderbolt',
            accuracy: 100,
            power: 90,
            pp: 15,
            priority: 0,
            damage_class: { name: 'special', url: '' },
            type: { name: 'electric', url: '' },
          }),
          { status: 200 }
        );
      };

      const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });
      const service = new PokemonService(client);

      const move = await service.getMove(85);
      expect(capturedUrl).toContain('/move/85');
      expect(move.name).toBe('thunderbolt');
      expect(move.power).toBe(90);
      expect(move.accuracy).toBe(100);
    });

    it('rejects invalid or unsafe ability and move identifiers', async () => {
      const service = new PokemonService();

      try {
        await service.getAbility('');
        expect().fail('Should have rejected empty ability');
      } catch (err) {
        expect(isPokeApiError(err)).toBe(true);
      }

      try {
        await service.getMove('../hack');
        expect().fail('Should have rejected path traversal in move');
      } catch (err) {
        expect(isPokeApiError(err)).toBe(true);
      }
    });
  });

  describe('Query Keys and Options for Detail Resources', () => {
    it('produces deterministic keys for ability and move', () => {
      expect(pokemonKeys.ability(' Static ')).toEqual(['pokeapi', 'ability', 'static']);
      expect(pokemonKeys.move(' Quick-Attack ')).toEqual(['pokeapi', 'move', 'quick-attack']);
    });

    it('configures query options correctly for ability and move', () => {
      const abilityQuery = pokemonQueries.ability('levitate');
      expect([...abilityQuery.queryKey]).toEqual(['pokeapi', 'ability', 'levitate']);
      expect(abilityQuery.enabled).toBe(true);

      const disabledQuery = pokemonQueries.ability('');
      expect(disabledQuery.enabled).toBe(false);

      const moveQuery = pokemonQueries.move('surf');
      expect([...moveQuery.queryKey]).toEqual(['pokeapi', 'move', 'surf']);
      expect(moveQuery.enabled).toBe(true);
    });
  });

  describe('Evolution Chain Parsing & Condition Formatting', () => {
    it('formats diverse evolution conditions into readable descriptions', () => {
      const levelDetail: PokeApiEvolutionDetail = {
        item: null,
        trigger: { name: 'level-up', url: '' },
        gender: null,
        held_item: null,
        known_move: null,
        known_move_type: null,
        location: null,
        min_level: 16,
        min_happiness: null,
        min_beauty: null,
        min_affection: null,
        needs_overworld_rain: false,
        party_species: null,
        party_type: null,
        relative_physical_stats: null,
        time_of_day: '',
        trade_species: null,
        turn_upside_down: false,
      };
      expect(formatEvolutionDetail(levelDetail)).toBe('Level 16');

      const itemDetail: PokeApiEvolutionDetail = {
        ...levelDetail,
        min_level: null,
        item: { name: 'thunder-stone', url: '' },
        trigger: { name: 'use-item', url: '' },
      };
      expect(formatEvolutionDetail(itemDetail)).toBe('Use Thunder Stone');

      const tradeWithItemDetail: PokeApiEvolutionDetail = {
        ...levelDetail,
        min_level: null,
        trigger: { name: 'trade', url: '' },
        held_item: { name: 'kings-rock', url: '' },
      };
      expect(formatEvolutionDetail(tradeWithItemDetail)).toBe('Holding Kings Rock');

      const friendshipDayDetail: PokeApiEvolutionDetail = {
        ...levelDetail,
        min_level: null,
        min_happiness: 220,
        time_of_day: 'day',
      };
      expect(formatEvolutionDetail(friendshipDayDetail)).toBe('High Friendship (≥220) • Day');

      const statCompareDetail: PokeApiEvolutionDetail = {
        ...levelDetail,
        min_level: 20,
        relative_physical_stats: 1,
      };
      expect(formatEvolutionDetail(statCompareDetail)).toBe('Level 20 • Atk > Def');

      const weatherDetail: PokeApiEvolutionDetail = {
        ...levelDetail,
        min_level: 50,
        needs_overworld_rain: true,
      };
      expect(formatEvolutionDetail(weatherDetail)).toBe('Level 50 • During rain');
    });

    it('handles Pokémon with no evolutions', () => {
      const singleLink: PokeApiChainLink = {
        is_baby: false,
        species: { name: 'kangaskhan', url: 'https://pokeapi.co/api/v2/pokemon-species/115/' },
        evolution_details: [],
        evolves_to: [],
      };

      const tree = parseEvolutionChain(singleLink);
      expect(tree.speciesName).toBe('kangaskhan');
      expect(tree.speciesId).toBe(115);
      expect(hasEvolutions(tree)).toBe(false);
      expect(countChainNodes(tree)).toBe(1);
    });

    it('parses linear multi-stage evolution chains', () => {
      const linearChain: PokeApiChainLink = {
        is_baby: false,
        species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
        evolution_details: [],
        evolves_to: [
          {
            is_baby: false,
            species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
            evolution_details: [
              {
                min_level: 16,
                trigger: { name: 'level-up', url: '' },
                item: null,
                gender: null,
                held_item: null,
                known_move: null,
                known_move_type: null,
                location: null,
                min_happiness: null,
                min_beauty: null,
                min_affection: null,
                needs_overworld_rain: false,
                party_species: null,
                party_type: null,
                relative_physical_stats: null,
                time_of_day: '',
                trade_species: null,
                turn_upside_down: false,
              },
            ],
            evolves_to: [
              {
                is_baby: false,
                species: { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon-species/3/' },
                evolution_details: [
                  {
                    min_level: 32,
                    trigger: { name: 'level-up', url: '' },
                    item: null,
                    gender: null,
                    held_item: null,
                    known_move: null,
                    known_move_type: null,
                    location: null,
                    min_happiness: null,
                    min_beauty: null,
                    min_affection: null,
                    needs_overworld_rain: false,
                    party_species: null,
                    party_type: null,
                    relative_physical_stats: null,
                    time_of_day: '',
                    trade_species: null,
                    turn_upside_down: false,
                  },
                ],
                evolves_to: [],
              },
            ],
          },
        ],
      };

      const tree = parseEvolutionChain(linearChain);
      expect(hasEvolutions(tree)).toBe(true);
      expect(countChainNodes(tree)).toBe(3);
      expect(tree.speciesName).toBe('bulbasaur');
      expect(tree.evolvesTo[0].speciesName).toBe('ivysaur');
      expect(tree.evolvesTo[0].conditions[0]).toBe('Level 16');
      expect(tree.evolvesTo[0].evolvesTo[0].speciesName).toBe('venusaur');
      expect(tree.evolvesTo[0].evolvesTo[0].conditions[0]).toBe('Level 32');
    });

    it('parses branching evolution chains (e.g. Eevee)', () => {
      const eeveeChain: PokeApiChainLink = {
        is_baby: false,
        species: { name: 'eevee', url: 'https://pokeapi.co/api/v2/pokemon-species/133/' },
        evolution_details: [],
        evolves_to: [
          {
            is_baby: false,
            species: { name: 'vaporeon', url: 'https://pokeapi.co/api/v2/pokemon-species/134/' },
            evolution_details: [
              {
                item: { name: 'water-stone', url: '' },
                trigger: { name: 'use-item', url: '' },
                gender: null,
                held_item: null,
                known_move: null,
                known_move_type: null,
                location: null,
                min_level: null,
                min_happiness: null,
                min_beauty: null,
                min_affection: null,
                needs_overworld_rain: false,
                party_species: null,
                party_type: null,
                relative_physical_stats: null,
                time_of_day: '',
                trade_species: null,
                turn_upside_down: false,
              },
            ],
            evolves_to: [],
          },
          {
            is_baby: false,
            species: { name: 'jolteon', url: 'https://pokeapi.co/api/v2/pokemon-species/135/' },
            evolution_details: [
              {
                item: { name: 'thunder-stone', url: '' },
                trigger: { name: 'use-item', url: '' },
                gender: null,
                held_item: null,
                known_move: null,
                known_move_type: null,
                location: null,
                min_level: null,
                min_happiness: null,
                min_beauty: null,
                min_affection: null,
                needs_overworld_rain: false,
                party_species: null,
                party_type: null,
                relative_physical_stats: null,
                time_of_day: '',
                trade_species: null,
                turn_upside_down: false,
              },
            ],
            evolves_to: [],
          },
          {
            is_baby: false,
            species: { name: 'flareon', url: 'https://pokeapi.co/api/v2/pokemon-species/136/' },
            evolution_details: [
              {
                item: { name: 'fire-stone', url: '' },
                trigger: { name: 'use-item', url: '' },
                gender: null,
                held_item: null,
                known_move: null,
                known_move_type: null,
                location: null,
                min_level: null,
                min_happiness: null,
                min_beauty: null,
                min_affection: null,
                needs_overworld_rain: false,
                party_species: null,
                party_type: null,
                relative_physical_stats: null,
                time_of_day: '',
                trade_species: null,
                turn_upside_down: false,
              },
            ],
            evolves_to: [],
          },
        ],
      };

      const tree = parseEvolutionChain(eeveeChain);
      expect(hasEvolutions(tree)).toBe(true);
      expect(tree.evolvesTo.length).toBe(3);
      expect(countChainNodes(tree)).toBe(4);
      expect(tree.evolvesTo.map((c) => c.speciesName)).toEqual(['vaporeon', 'jolteon', 'flareon']);
    });
  });

  describe('Move Processing, Filtering & Sorting', () => {
    const rawMoves: PokeApiPokemonMove[] = [
      {
        move: { name: 'tackle', url: 'https://pokeapi.co/api/v2/move/33/' },
        version_group_details: [
          {
            level_learned_at: 1,
            move_learn_method: { name: 'level-up', url: '' },
            version_group: { name: 'red-blue', url: '' },
          },
        ],
      },
      {
        move: { name: 'thunderbolt', url: 'https://pokeapi.co/api/v2/move/85/' },
        version_group_details: [
          {
            level_learned_at: 0,
            move_learn_method: { name: 'machine', url: '' },
            version_group: { name: 'scarlet-violet', url: '' },
          },
        ],
      },
      {
        move: { name: 'thunder-shock', url: 'https://pokeapi.co/api/v2/move/84/' },
        version_group_details: [
          {
            level_learned_at: 4,
            move_learn_method: { name: 'level-up', url: '' },
            version_group: { name: 'scarlet-violet', url: '' },
          },
        ],
      },
      {
        move: { name: 'volt-tackle', url: 'https://pokeapi.co/api/v2/move/344/' },
        version_group_details: [
          {
            level_learned_at: 0,
            move_learn_method: { name: 'egg', url: '' },
            version_group: { name: 'scarlet-violet', url: '' },
          },
        ],
      },
      {
        move: { name: 'iron-tail', url: 'https://pokeapi.co/api/v2/move/231/' },
        version_group_details: [
          {
            level_learned_at: 0,
            move_learn_method: { name: 'tutor', url: '' },
            version_group: { name: 'scarlet-violet', url: '' },
          },
        ],
      },
    ];

    it('processes raw moves and extracts learn methods accurately', () => {
      const processed = processPokemonMoves(rawMoves);
      expect(processed.length).toBe(5);
      expect(processed.find((m) => m.name === 'tackle')?.levelLearnedAt).toBe(1);
      expect(processed.find((m) => m.name === 'thunder-shock')?.levelLearnedAt).toBe(4);
      expect(processed.find((m) => m.name === 'thunderbolt')?.methods).toContain('machine');
    });

    it('filters moves by learn method category', () => {
      const processed = processPokemonMoves(rawMoves);

      const levelUpMoves = filterAndSortMoves(processed, 'level-up', '');
      expect(levelUpMoves.length).toBe(2);
      expect(levelUpMoves.map((m) => m.name)).toEqual(['tackle', 'thunder-shock']);

      const machineMoves = filterAndSortMoves(processed, 'machine', '');
      expect(machineMoves.length).toBe(1);
      expect(machineMoves[0].name).toBe('thunderbolt');

      const eggMoves = filterAndSortMoves(processed, 'egg', '');
      expect(eggMoves.length).toBe(1);
      expect(eggMoves[0].name).toBe('volt-tackle');

      const allMoves = filterAndSortMoves(processed, 'all', '');
      expect(allMoves.length).toBe(5);
    });

    it('sorts level-up moves by acquisition level ascending', () => {
      const processed = processPokemonMoves(rawMoves);
      const levelUpMoves = filterAndSortMoves(processed, 'level-up', '');
      expect(levelUpMoves[0].levelLearnedAt).toBe(1);
      expect(levelUpMoves[1].levelLearnedAt).toBe(4);
    });

    it('filters moves by search query text', () => {
      const processed = processPokemonMoves(rawMoves);
      const searchResults = filterAndSortMoves(processed, 'all', 'thunder');
      expect(searchResults.length).toBe(2);
      expect(searchResults.map((m) => m.name)).toEqual(['thunder-shock', 'thunderbolt']);
    });

    it('handles empty moves input gracefully', () => {
      expect(processPokemonMoves(null)).toEqual([]);
      expect(processPokemonMoves([])).toEqual([]);
      expect(filterAndSortMoves([], 'level-up', '')).toEqual([]);
    });
  });
});
