import { Pokemon, PokemonStat } from '@/types/pokemon';
import { PokeApiPokemon, PokeApiSpecies } from '@/types/pokeapi';
import { PokemonTypeName } from '@/styles/typeColors';
import {
  extractIdFromUrl,
  formatPokemonName,
  getPokemonArtworkUrl,
  getPokemonSpriteUrl,
  POKEMON_FALLBACK_IMAGE,
} from './utils';

const VALID_STAT_NAMES: Array<PokemonStat['name']> = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
];

const VALID_TYPE_NAMES: Set<string> = new Set([
  'normal',
  'fire',
  'water',
  'grass',
  'electric',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'steel',
  'dark',
  'fairy',
]);

/**
 * Extract clean English flavor text description from a species payload.
 * Removes line breaks and form feed control characters commonly present in PokéAPI text.
 */
export function extractEnglishFlavorText(species?: PokeApiSpecies | null): string {
  if (!species || !species.flavor_text_entries || species.flavor_text_entries.length === 0) {
    return 'A remarkable Pokémon known throughout its native habitat.';
  }

  const enEntry = species.flavor_text_entries.find(
    (entry) => entry.language.name === 'en'
  );

  if (!enEntry) {
    return species.flavor_text_entries[0]?.flavor_text?.replace(/[\f\n\r]/g, ' ').trim() || '';
  }

  return enEntry.flavor_text
    .replace(/[\f\n\r]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract clean English genus classification from a species payload (e.g., "Seed Pokémon").
 */
export function extractEnglishGenus(species?: PokeApiSpecies | null): string {
  if (!species || !species.genera || species.genera.length === 0) {
    return 'Pokémon';
  }

  const enGenus = species.genera.find((entry) => entry.language.name === 'en');
  return enGenus ? enGenus.genus.trim() : 'Pokémon';
}

/**
 * Extract generation number from species generation resource or default to 1.
 */
export function extractGenerationNumber(species?: PokeApiSpecies | null): number {
  if (!species || !species.generation) {
    return 1;
  }
  const id = extractIdFromUrl(species.generation.url);
  if (id && id > 0) return id;

  const romanMap: Record<string, number> = {
    'generation-i': 1,
    'generation-ii': 2,
    'generation-iii': 3,
    'generation-iv': 4,
    'generation-v': 5,
    'generation-vi': 6,
    'generation-vii': 7,
    'generation-viii': 8,
    'generation-ix': 9,
  };

  return romanMap[species.generation.name.toLowerCase()] || 1;
}

/**
 * Maps PokéAPI v2 raw Pokémon and optional Species data to the application's
 * normalized UI model (Pokemon).
 */
export function mapPokeApiPokemonToPokemon(
  apiPokemon: PokeApiPokemon,
  species?: PokeApiSpecies | null
): Pokemon {
  const displayName = formatPokemonName(apiPokemon.name);

  // Map and validate elemental types
  const types: PokemonTypeName[] = apiPokemon.types
    .map((slot) => slot.type.name.toLowerCase())
    .filter((typeName): typeName is PokemonTypeName => VALID_TYPE_NAMES.has(typeName));

  if (types.length === 0) {
    types.push('normal');
  }

  // Map base stats
  const stats: PokemonStat[] = VALID_STAT_NAMES.map((statName) => {
    const found = apiPokemon.stats.find((s) => s.stat.name.toLowerCase() === statName);
    return {
      name: statName,
      base_stat: found ? found.base_stat : 50,
    };
  });

  const artworkUrl = getPokemonArtworkUrl(apiPokemon.sprites) || POKEMON_FALLBACK_IMAGE;
  const imageUrl = getPokemonSpriteUrl(apiPokemon.sprites) || artworkUrl;

  return {
    id: apiPokemon.id,
    name: apiPokemon.name,
    displayName,
    types,
    imageUrl,
    artworkUrl,
    genus: extractEnglishGenus(species),
    height: apiPokemon.height,
    weight: apiPokemon.weight,
    stats,
    description: extractEnglishFlavorText(species),
    generation: extractGenerationNumber(species),
    base_experience: apiPokemon.base_experience,
  };
}
