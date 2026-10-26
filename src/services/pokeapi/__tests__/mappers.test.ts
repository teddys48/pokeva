import { describe, expect, it } from 'bun:test';
import {
  extractEnglishFlavorText,
  extractEnglishGenus,
  extractGenerationNumber,
  mapPokeApiPokemonToPokemon,
} from '../mappers';
import { PokeApiPokemon, PokeApiSpecies } from '@/types/pokeapi';
import { POKEMON_FALLBACK_IMAGE } from '../utils';

describe('PokéAPI Data Mappers', () => {
  const sampleApiPokemon: PokeApiPokemon = {
    id: 25,
    name: 'pikachu',
    base_experience: 112,
    height: 4,
    weight: 60,
    is_default: true,
    order: 35,
    abilities: [
      {
        slot: 1,
        is_hidden: false,
        ability: { name: 'static', url: 'https://pokeapi.co/api/v2/ability/9/' },
      },
    ],
    forms: [{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-form/25/' }],
    species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
    sprites: {
      front_default: 'https://pokeapi.co/sprites/pokemon/25.png',
      front_shiny: 'https://pokeapi.co/sprites/pokemon/shiny/25.png',
      front_female: null,
      front_shiny_female: null,
      back_default: null,
      back_shiny: null,
      back_female: null,
      back_shiny_female: null,
      other: {
        'official-artwork': {
          front_default: 'https://pokeapi.co/sprites/pokemon/other/official-artwork/25.png',
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
      {
        slot: 1,
        type: { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' },
      },
    ],
  };

  const sampleSpecies: PokeApiSpecies = {
    id: 25,
    name: 'pikachu',
    order: 25,
    gender_rate: 4,
    capture_rate: 190,
    base_happiness: 50,
    is_baby: false,
    is_legendary: false,
    is_mythical: false,
    hatch_counter: 10,
    has_gender_differences: true,
    forms_switchable: false,
    growth_rate: { name: 'medium-fast', url: '' },
    color: { name: 'yellow', url: '' },
    shape: { name: 'quadruped', url: '' },
    evolves_from_species: { name: 'pichu', url: '' },
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/10/' },
    habitat: { name: 'forest', url: '' },
    generation: { name: 'generation-i', url: 'https://pokeapi.co/api/v2/generation/1/' },
    flavor_text_entries: [
      {
        flavor_text: 'When several of\nthese POKéMON gather,\ntheir electricity could\fbuild and cause\nlightning storms.',
        language: { name: 'en', url: '' },
        version: { name: 'red', url: '' },
      },
    ],
    genera: [
      { genus: 'Mouse Pokémon', language: { name: 'en', url: '' } },
      { genus: 'Souris', language: { name: 'fr', url: '' } },
    ],
    egg_groups: [{ name: 'ground', url: '' }],
    varieties: [{ is_default: true, pokemon: { name: 'pikachu', url: '' } }],
  };

  it('maps raw PokéAPI Pokemon and Species payloads to normalized UI model', () => {
    const domainPokemon = mapPokeApiPokemonToPokemon(sampleApiPokemon, sampleSpecies);

    expect(domainPokemon.id).toBe(25);
    expect(domainPokemon.name).toBe('pikachu');
    expect(domainPokemon.displayName).toBe('Pikachu');
    expect(domainPokemon.types).toEqual(['electric']);
    expect(domainPokemon.height).toBe(4);
    expect(domainPokemon.weight).toBe(60);
    expect(domainPokemon.genus).toBe('Mouse Pokémon');
    expect(domainPokemon.generation).toBe(1);
    expect(domainPokemon.artworkUrl).toBe(
      'https://pokeapi.co/sprites/pokemon/other/official-artwork/25.png'
    );
    expect(domainPokemon.imageUrl).toBe('https://pokeapi.co/sprites/pokemon/25.png');

    // Stats
    expect(domainPokemon.stats.length).toBe(6);
    expect(domainPokemon.stats.find((s) => s.name === 'hp')?.base_stat).toBe(35);
    expect(domainPokemon.stats.find((s) => s.name === 'speed')?.base_stat).toBe(90);

    // Cleaned flavor text
    expect(domainPokemon.description).toBe(
      'When several of these POKéMON gather, their electricity could build and cause lightning storms.'
    );
  });

  it('handles missing species payload gracefully', () => {
    const domainPokemon = mapPokeApiPokemonToPokemon(sampleApiPokemon, null);

    expect(domainPokemon.id).toBe(25);
    expect(domainPokemon.genus).toBe('Pokémon');
    expect(domainPokemon.generation).toBe(1);
    expect(domainPokemon.description).toBe(
      'A remarkable Pokémon known throughout its native habitat.'
    );
  });

  it('cleans flavor text and handles missing English entries', () => {
    expect(extractEnglishFlavorText(null)).toBe(
      'A remarkable Pokémon known throughout its native habitat.'
    );

    const nonEnSpecies: PokeApiSpecies = {
      ...sampleSpecies,
      flavor_text_entries: [
        {
          flavor_text: 'Texte français\navec sauts.',
          language: { name: 'fr', url: '' },
          version: { name: 'x', url: '' },
        },
      ],
    };

    expect(extractEnglishFlavorText(nonEnSpecies)).toBe('Texte français avec sauts.');
  });

  it('extracts English genus correctly and falls back if absent', () => {
    expect(extractEnglishGenus(null)).toBe('Pokémon');

    const nonEnGenus: PokeApiSpecies = {
      ...sampleSpecies,
      genera: [{ genus: 'Maus-Pokémon', language: { name: 'de', url: '' } }],
    };
    expect(extractEnglishGenus(nonEnGenus)).toBe('Pokémon');
  });

  it('extracts generation number from Roman numerals or URL', () => {
    expect(extractGenerationNumber(null)).toBe(1);

    const gen4Species: PokeApiSpecies = {
      ...sampleSpecies,
      generation: { name: 'generation-iv', url: 'https://pokeapi.co/api/v2/generation/4/' },
    };
    expect(extractGenerationNumber(gen4Species)).toBe(4);

    const gen9Species: PokeApiSpecies = {
      ...sampleSpecies,
      generation: { name: 'generation-ix', url: '' },
    };
    expect(extractGenerationNumber(gen9Species)).toBe(9);
  });

  it('falls back to POKEMON_FALLBACK_IMAGE when artwork and sprites are missing', () => {
    const pokemonNoImages: PokeApiPokemon = {
      ...sampleApiPokemon,
      sprites: {
        front_default: null,
        front_shiny: null,
        front_female: null,
        front_shiny_female: null,
        back_default: null,
        back_shiny: null,
        back_female: null,
        back_shiny_female: null,
      },
    };

    const mapped = mapPokeApiPokemonToPokemon(pokemonNoImages, null);
    expect(mapped.artworkUrl).toBe(POKEMON_FALLBACK_IMAGE);
    expect(mapped.imageUrl).toBe(POKEMON_FALLBACK_IMAGE);
  });

  it('falls back to normal type if API provides unknown elemental type', () => {
    const pokemonCosmicType: PokeApiPokemon = {
      ...sampleApiPokemon,
      types: [
        {
          slot: 1,
          type: { name: 'cosmic', url: '' },
        },
      ],
    };

    const mapped = mapPokeApiPokemonToPokemon(pokemonCosmicType, null);
    expect(mapped.types).toEqual(['normal']);
  });
});
