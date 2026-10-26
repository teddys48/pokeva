import { describe, expect, it } from 'bun:test';
import {
  calculateCurrentPage,
  calculateTotalPages,
  extractIdFromUrl,
  extractPaginationFromUrl,
  formatPokemonName,
  getPaginationOffset,
  getPokemonArtworkUrl,
  getPokemonSpriteUrl,
  POKEMON_FALLBACK_IMAGE,
  validatePaginationParams,
} from '../utils';
import { isPokeApiError } from '../client';
import { PokeApiPokemonSprites } from '@/types/pokeapi';

describe('PokéAPI Utility Helpers', () => {
  describe('Pagination Utilities', () => {
    it('provides sensible defaults when pagination parameters are omitted', () => {
      const { limit, offset } = validatePaginationParams();
      expect(limit).toBe(20);
      expect(offset).toBe(0);
    });

    it('accepts valid custom pagination limits and offsets', () => {
      const { limit, offset } = validatePaginationParams({ limit: 50, offset: 150 });
      expect(limit).toBe(50);
      expect(offset).toBe(150);
    });

    it('rejects non-integer, negative, or excessive limits', () => {
      expect(() => validatePaginationParams({ limit: 0 })).toThrow();
      expect(() => validatePaginationParams({ limit: -5 })).toThrow();
      expect(() => validatePaginationParams({ limit: 101 })).toThrow();
      expect(() => validatePaginationParams({ limit: 20.5 })).toThrow();

      try {
        validatePaginationParams({ limit: 0 });
      } catch (err) {
        expect(isPokeApiError(err)).toBe(true);
        if (isPokeApiError(err)) {
          expect(err.code).toBe('VALIDATION_ERROR');
        }
      }
    });

    it('rejects negative or non-integer offsets', () => {
      expect(() => validatePaginationParams({ offset: -1 })).toThrow();
      expect(() => validatePaginationParams({ offset: 3.14 })).toThrow();

      try {
        validatePaginationParams({ offset: -10 });
      } catch (err) {
        expect(isPokeApiError(err)).toBe(true);
        if (isPokeApiError(err)) {
          expect(err.code).toBe('VALIDATION_ERROR');
        }
      }
    });

    it('extracts limit and offset from PokéAPI URL strings', () => {
      const parsed = extractPaginationFromUrl('https://pokeapi.co/api/v2/pokemon?offset=40&limit=20');
      expect(parsed).toEqual({ limit: 20, offset: 40 });
    });

    it('returns null when URL has no pagination or is invalid', () => {
      expect(extractPaginationFromUrl(null)).toBeNull();
      expect(extractPaginationFromUrl('')).toBeNull();
      expect(extractPaginationFromUrl('not-a-valid-url')).toBeNull();
      expect(extractPaginationFromUrl('https://pokeapi.co/api/v2/pokemon')).toBeNull();
    });

    it('calculates total pages correctly', () => {
      expect(calculateTotalPages(0, 20)).toBe(0);
      expect(calculateTotalPages(1, 20)).toBe(1);
      expect(calculateTotalPages(20, 20)).toBe(1);
      expect(calculateTotalPages(21, 20)).toBe(2);
      expect(calculateTotalPages(1025, 20)).toBe(52);
    });

    it('calculates current 1-based page and 0-based offset', () => {
      expect(calculateCurrentPage(0, 20)).toBe(1);
      expect(calculateCurrentPage(20, 20)).toBe(2);
      expect(calculateCurrentPage(40, 20)).toBe(3);

      expect(getPaginationOffset(1, 20)).toBe(0);
      expect(getPaginationOffset(2, 20)).toBe(20);
      expect(getPaginationOffset(3, 20)).toBe(40);
    });
  });

  describe('Resource ID Extraction', () => {
    it('extracts ID from official PokéAPI URLs with or without trailing slash', () => {
      expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
      expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/25')).toBe(25);
      expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon-species/150/')).toBe(150);
      expect(extractIdFromUrl('https://pokeapi.co/api/v2/evolution-chain/10/')).toBe(10);
      expect(extractIdFromUrl('/pokemon/1025/')).toBe(1025);
    });

    it('handles numeric strings directly', () => {
      expect(extractIdFromUrl('25')).toBe(25);
      expect(extractIdFromUrl('  13  ')).toBe(13);
    });

    it('returns null for unparseable or empty values', () => {
      expect(extractIdFromUrl(null)).toBeNull();
      expect(extractIdFromUrl(undefined)).toBeNull();
      expect(extractIdFromUrl('')).toBeNull();
      expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/')).toBeNull();
      expect(extractIdFromUrl('invalid-resource-identifier')).toBeNull();
    });
  });

  describe('Artwork & Sprite Resolvers', () => {
    it('prefers official-artwork front_default', () => {
      const sprites: PokeApiPokemonSprites = {
        front_default: 'https://img/default.png',
        front_shiny: null,
        front_female: null,
        front_shiny_female: null,
        back_default: null,
        back_shiny: null,
        back_female: null,
        back_shiny_female: null,
        other: {
          'official-artwork': {
            front_default: 'https://img/official.png',
          },
          home: {
            front_default: 'https://img/home.png',
          },
        },
      };

      expect(getPokemonArtworkUrl(sprites)).toBe('https://img/official.png');
    });

    it('falls back to Home when official artwork is missing', () => {
      const sprites: PokeApiPokemonSprites = {
        front_default: 'https://img/default.png',
        front_shiny: null,
        front_female: null,
        front_shiny_female: null,
        back_default: null,
        back_shiny: null,
        back_female: null,
        back_shiny_female: null,
        other: {
          home: {
            front_default: 'https://img/home.png',
          },
        },
      };

      expect(getPokemonArtworkUrl(sprites)).toBe('https://img/home.png');
    });

    it('falls back to Dream World when official artwork and Home are missing', () => {
      const sprites: PokeApiPokemonSprites = {
        front_default: 'https://img/default.png',
        front_shiny: null,
        front_female: null,
        front_shiny_female: null,
        back_default: null,
        back_shiny: null,
        back_female: null,
        back_shiny_female: null,
        other: {
          dream_world: {
            front_default: 'https://img/dream.svg',
            front_female: null,
          },
        },
      };

      expect(getPokemonArtworkUrl(sprites)).toBe('https://img/dream.svg');
    });

    it('falls back to front_default when other sprites are unavailable', () => {
      const sprites: PokeApiPokemonSprites = {
        front_default: 'https://img/front.png',
        front_shiny: null,
        front_female: null,
        front_shiny_female: null,
        back_default: null,
        back_shiny: null,
        back_female: null,
        back_shiny_female: null,
      };

      expect(getPokemonArtworkUrl(sprites)).toBe('https://img/front.png');
    });

    it('returns null when sprites object is null or has no valid image', () => {
      expect(getPokemonArtworkUrl(null)).toBeNull();
      expect(
        getPokemonArtworkUrl({
          front_default: null,
          front_shiny: null,
          front_female: null,
          front_shiny_female: null,
          back_default: null,
          back_shiny: null,
          back_female: null,
          back_shiny_female: null,
        })
      ).toBeNull();
    });

    it('resolves sprite variants (shiny, female, female-shiny)', () => {
      const sprites: PokeApiPokemonSprites = {
        front_default: 'https://img/front.png',
        front_shiny: 'https://img/shiny.png',
        front_female: 'https://img/female.png',
        front_shiny_female: 'https://img/female-shiny.png',
        back_default: null,
        back_shiny: null,
        back_female: null,
        back_shiny_female: null,
      };

      expect(getPokemonSpriteUrl(sprites)).toBe('https://img/front.png');
      expect(getPokemonSpriteUrl(sprites, { shiny: true })).toBe('https://img/shiny.png');
      expect(getPokemonSpriteUrl(sprites, { female: true })).toBe('https://img/female.png');
      expect(getPokemonSpriteUrl(sprites, { shiny: true, female: true })).toBe('https://img/female-shiny.png');
    });

    it('provides valid SVG Pokéball fallback data URI', () => {
      expect(POKEMON_FALLBACK_IMAGE).toBeDefined();
      expect(POKEMON_FALLBACK_IMAGE.startsWith('data:image/svg+xml')).toBe(true);
    });
  });

  describe('Name Formatter', () => {
    it('formats recognized special Pokémon names accurately', () => {
      expect(formatPokemonName('mr-mime')).toBe('Mr. Mime');
      expect(formatPokemonName('ho-oh')).toBe('Ho-Oh');
      expect(formatPokemonName('porygon-z')).toBe('Porygon-Z');
      expect(formatPokemonName('type-null')).toBe('Type: Null');
      expect(formatPokemonName('tapu-koko')).toBe('Tapu Koko');
      expect(formatPokemonName('nidoran-m')).toBe('Nidoran ♂');
      expect(formatPokemonName('nidoran-f')).toBe('Nidoran ♀');
      expect(formatPokemonName('flabebe')).toBe('Flabébé');
      expect(formatPokemonName('wo-chien')).toBe('Wo-Chien');
      expect(formatPokemonName('jangmo-o')).toBe('Jangmo-o');
    });

    it('formats standard Pokémon names with proper casing', () => {
      expect(formatPokemonName('pikachu')).toBe('Pikachu');
      expect(formatPokemonName('charizard')).toBe('Charizard');
      expect(formatPokemonName('mega-gengar')).toBe('Mega Gengar');
    });

    it('handles empty names gracefully', () => {
      expect(formatPokemonName('')).toBe('');
    });
  });
});
