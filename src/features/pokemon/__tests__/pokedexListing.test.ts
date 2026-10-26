import { describe, expect, it } from 'bun:test';
import { calculateTotalPages, getPaginationOffset, extractIdFromUrl } from '@/services/pokeapi/utils';
import { mapPokeApiPokemonToPokemon } from '@/services/pokeapi/mappers';
import { PokeApiPokemon, NamedAPIResource } from '@/types/pokeapi';
import { PokemonTypeName, POKEMON_TYPE_STYLES } from '@/styles/typeColors';

describe('Phase 3: Pokédex Listing, Search, Filters & Sorting', () => {
  describe('Listing & Pagination Calculations', () => {
    it('calculates total pages correctly for PokéAPI catalogs', () => {
      // 1025 total Pokémon with 20 items per page
      expect(calculateTotalPages(1025, 20)).toBe(52);
      expect(calculateTotalPages(1302, 20)).toBe(66);
      expect(calculateTotalPages(20, 20)).toBe(1);
      expect(calculateTotalPages(0, 20)).toBe(0);
    });

    it('calculates 0-based offset from 1-based page numbers', () => {
      expect(getPaginationOffset(1, 20)).toBe(0);
      expect(getPaginationOffset(2, 20)).toBe(20);
      expect(getPaginationOffset(5, 20)).toBe(80);
      expect(getPaginationOffset(0, 20)).toBe(0); // Safely normalizes invalid <= 0
      expect(getPaginationOffset(-3, 20)).toBe(0);
    });

    it('determines pagination boundaries properly', () => {
      const totalCount = 105;
      const pageSize = 20;
      const totalPages = calculateTotalPages(totalCount, pageSize); // 6 pages
      expect(totalPages).toBe(6);

      // Page 1
      const p1Offset = getPaginationOffset(1, pageSize);
      const p1End = Math.min(p1Offset + pageSize, totalCount);
      expect(p1Offset + 1).toBe(1);
      expect(p1End).toBe(20);

      // Page 6 (last page with partial count: 5 items)
      const p6Offset = getPaginationOffset(6, pageSize);
      const p6End = Math.min(p6Offset + pageSize, totalCount);
      expect(p6Offset + 1).toBe(101);
      expect(p6End).toBe(105);
    });
  });

  describe('Search Query Normalization & Routing', () => {
    it('sanitizes search input with whitespace and casing', () => {
      const normalizeSearch = (raw: string) => {
        const trimmed = raw.trim().toLowerCase().replace(/^#/, '');
        const isNumeric = /^\d+$/.test(trimmed);
        if (isNumeric) {
          const num = parseInt(trimmed, 10);
          return num > 0 ? num : null;
        }
        return trimmed.replace(/\s+/g, '-');
      };

      expect(normalizeSearch('   PIKACHU   ')).toBe('pikachu');
      expect(normalizeSearch(' #0025 ')).toBe(25);
      expect(normalizeSearch('#25')).toBe(25);
      expect(normalizeSearch('25')).toBe(25);
      expect(normalizeSearch('mr mime')).toBe('mr-mime');
      expect(normalizeSearch('  Iron Valiant  ')).toBe('iron-valiant');
      expect(normalizeSearch('   ')).toBe('');
    });
  });

  describe('Sorting Without Mutating Shared State', () => {
    const mockList: NamedAPIResource[] = [
      { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
      { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
      { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
    ];

    it('sorts by Pokédex number ascending (default)', () => {
      const original = [...mockList];
      const sorted = [...original].sort((a, b) => {
        const idA = extractIdFromUrl(a.url) ?? 0;
        const idB = extractIdFromUrl(b.url) ?? 0;
        return idA - idB;
      });

      expect(sorted.map((p) => p.name)).toEqual(['bulbasaur', 'ivysaur', 'venusaur', 'charmander']);
      // Verify original array was not mutated
      expect(original[0].name).toBe('venusaur');
    });

    it('sorts by Pokédex number descending', () => {
      const original = [...mockList];
      const sorted = [...original].sort((a, b) => {
        const idA = extractIdFromUrl(a.url) ?? 0;
        const idB = extractIdFromUrl(b.url) ?? 0;
        return idB - idA;
      });

      expect(sorted.map((p) => p.name)).toEqual(['charmander', 'venusaur', 'ivysaur', 'bulbasaur']);
      expect(original[0].name).toBe('venusaur');
    });

    it('sorts alphabetically by name', () => {
      const original = [...mockList];
      const sorted = [...original].sort((a, b) => a.name.localeCompare(b.name));

      expect(sorted.map((p) => p.name)).toEqual(['bulbasaur', 'charmander', 'ivysaur', 'venusaur']);
      expect(original[0].name).toBe('venusaur');
    });
  });

  describe('Card Metadata Mapping & Missing Asset Fallback', () => {
    it('correctly maps raw PokéAPI payload into Card model', () => {
      const rawApiPokemon: PokeApiPokemon = {
        id: 25,
        name: 'pikachu',
        base_experience: 112,
        height: 4,
        is_default: true,
        order: 35,
        weight: 60,
        abilities: [],
        forms: [],
        species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
        sprites: {
          front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
          front_shiny: null,
          front_female: null,
          front_shiny_female: null,
          back_default: null,
          back_shiny: null,
          back_female: null,
          back_shiny_female: null,
          other: {
            'official-artwork': {
              front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
            },
          },
        },
        stats: [
          { base_stat: 35, effort: 0, stat: { name: 'hp', url: '' } },
          { base_stat: 55, effort: 0, stat: { name: 'attack', url: '' } },
          { base_stat: 40, effort: 0, stat: { name: 'defense', url: '' } },
          { base_stat: 50, effort: 0, stat: { name: 'special-attack', url: '' } },
          { base_stat: 50, effort: 0, stat: { name: 'special-defense', url: '' } },
          { base_stat: 90, effort: 2, stat: { name: 'speed', url: '' } },
        ],
        types: [
          { slot: 1, type: { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' } },
        ],
      };

      const card = mapPokeApiPokemonToPokemon(rawApiPokemon);

      expect(card.id).toBe(25);
      expect(card.displayName).toBe('Pikachu');
      expect(card.types).toEqual(['electric']);
      expect(card.artworkUrl).toContain('official-artwork/25.png');
      expect(card.imageUrl).toContain('sprites/pokemon/25.png');
      expect(card.height).toBe(4);
      expect(card.weight).toBe(60);
      expect(card.stats.find((s) => s.name === 'speed')?.base_stat).toBe(90);
    });

    it('gracefully handles missing artwork with fallback', () => {
      const rawApiPokemon: PokeApiPokemon = {
        id: 9999,
        name: 'custom-mon',
        base_experience: 100,
        height: 10,
        is_default: true,
        order: 9999,
        weight: 100,
        abilities: [],
        forms: [],
        species: { name: 'custom-mon', url: '' },
        sprites: {
          front_default: null,
          front_shiny: null,
          front_female: null,
          front_shiny_female: null,
          back_default: null,
          back_shiny: null,
          back_female: null,
          back_shiny_female: null,
          other: {},
        },
        stats: [],
        types: [{ slot: 1, type: { name: 'ghost', url: '' } }],
      };

      const card = mapPokeApiPokemonToPokemon(rawApiPokemon);
      expect(card.artworkUrl).toContain('data:image/svg+xml');
      expect(card.imageUrl).toContain('data:image/svg+xml');
      expect(card.types).toEqual(['ghost']);
    });
  });

  describe('Type Filter Tokens & Design System', () => {
    it('provides valid tokens for all 18 official elemental types', () => {
      const types = Object.keys(POKEMON_TYPE_STYLES) as PokemonTypeName[];
      expect(types.length).toBe(18);

      types.forEach((type) => {
        const style = POKEMON_TYPE_STYLES[type];
        expect(style.name).toBe(type);
        expect(style.label).toBeDefined();
        expect(style.bgHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(style.badgeBg).toBeDefined();
        expect(style.badgeText).toBeDefined();
        expect(style.cardGlow).toBeDefined();
      });
    });
  });

  describe('Combining Search & Elemental Filters', () => {
    const pikachuCard = {
      id: 25,
      name: 'pikachu',
      displayName: 'Pikachu',
      types: ['electric' as PokemonTypeName],
    };

    const charizardCard = {
      id: 6,
      name: 'charizard',
      displayName: 'Charizard',
      types: ['fire' as PokemonTypeName, 'flying' as PokemonTypeName],
    };

    it('matches when search matches and type filter matches', () => {
      const selectedType = 'fire';
      const matchesType = charizardCard.types.includes(selectedType);
      const matchesName = charizardCard.name.includes('char');
      expect(matchesType && matchesName).toBe(true);
    });

    it('fails when search matches but type filter does not match', () => {
      const selectedType = 'water';
      const matchesType = pikachuCard.types.includes(selectedType);
      const matchesName = pikachuCard.name.includes('pika');
      expect(matchesType && matchesName).toBe(false);
    });
  });
});
