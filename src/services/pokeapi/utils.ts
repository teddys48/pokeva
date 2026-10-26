import { PaginationParams, PokeApiPokemonSprites } from '@/types/pokeapi';
import { PokeApiError } from './client';

/**
 * Standard fallback SVG data URI displaying a Pokéball silhouette.
 * Avoids broken image links and maintains layout consistency.
 */
export const POKEMON_FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6" class="text-muted-foreground/30">' +
      '<circle cx="50" cy="50" r="44" stroke="#94A3B8" stroke-width="6" fill="#F1F5F9" fill-opacity="0.1"/>' +
      '<line x1="6" y1="50" x2="94" y2="50" stroke="#94A3B8" stroke-width="6"/>' +
      '<circle cx="50" cy="50" r="14" fill="#94A3B8" stroke="#64748B" stroke-width="4"/>' +
      '<circle cx="50" cy="50" r="6" fill="#FFFFFF"/>' +
      '</svg>'
  );

/**
 * Validates and normalizes pagination parameters.
 * Throws a PokeApiError if limits or offsets are invalid numbers.
 */
export function validatePaginationParams(params?: PaginationParams): {
  limit: number;
  offset: number;
} {
  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new PokeApiError({
      message: `Invalid limit "${limit}". Limit must be an integer between 1 and 100.`,
      code: 'VALIDATION_ERROR',
      userMessage: 'Invalid page size requested.',
    });
  }

  if (!Number.isInteger(offset) || offset < 0) {
    throw new PokeApiError({
      message: `Invalid offset "${offset}". Offset must be a non-negative integer.`,
      code: 'VALIDATION_ERROR',
      userMessage: 'Invalid page offset requested.',
    });
  }

  return { limit, offset };
}

/**
 * Extract limit and offset query parameters from a PokéAPI pagination URL.
 */
export function extractPaginationFromUrl(
  url: string | null | undefined
): { limit: number; offset: number } | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const limit = parsed.searchParams.get('limit');
    const offset = parsed.searchParams.get('offset');
    if (limit !== null && offset !== null) {
      const numLimit = parseInt(limit, 10);
      const numOffset = parseInt(offset, 10);
      if (!Number.isNaN(numLimit) && !Number.isNaN(numOffset)) {
        return { limit: numLimit, offset: numOffset };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Calculate total pages from total count and limit.
 */
export function calculateTotalPages(totalCount: number, limit: number): number {
  if (totalCount <= 0 || limit <= 0) return 0;
  return Math.ceil(totalCount / limit);
}

/**
 * Calculate the 1-based page index from offset and limit.
 */
export function calculateCurrentPage(offset: number, limit: number): number {
  if (limit <= 0) return 1;
  return Math.floor(Math.max(0, offset) / limit) + 1;
}

/**
 * Calculate the 0-based offset from a 1-based page index.
 */
export function getPaginationOffset(page: number, limit: number): number {
  const normalizedPage = Math.max(1, page);
  const normalizedLimit = Math.max(1, limit);
  return (normalizedPage - 1) * normalizedLimit;
}

/**
 * Extracts a numeric resource ID from a PokéAPI resource URL or string.
 * Example: 'https://pokeapi.co/api/v2/pokemon/25/' -> 25
 */
export function extractIdFromUrl(url: string | null | undefined): number | null {
  if (!url) return null;
  const trimmed = url.trim().replace(/\/+$/, '');
  const match = trimmed.match(/\/(\d+)$/) || trimmed.match(/^(\d+)$/);
  if (match && match[1]) {
    const id = parseInt(match[1], 10);
    return Number.isNaN(id) ? null : id;
  }
  return null;
}

/**
 * Extracts the highest quality artwork URL from a Pokémon sprites payload.
 * Priority: Official Artwork -> Pokémon HOME -> Dream World -> Default Front Sprite
 */
export function getPokemonArtworkUrl(sprites?: PokeApiPokemonSprites | null): string | null {
  if (!sprites) return null;

  return (
    sprites.other?.['official-artwork']?.front_default ||
    sprites.other?.home?.front_default ||
    sprites.other?.dream_world?.front_default ||
    sprites.front_default ||
    null
  );
}

/**
 * Resolves standard front/shiny sprite with optional female variant.
 */
export function getPokemonSpriteUrl(
  sprites?: PokeApiPokemonSprites | null,
  options: { shiny?: boolean; female?: boolean } = {}
): string | null {
  if (!sprites) return null;

  if (options.female && options.shiny && sprites.front_shiny_female) {
    return sprites.front_shiny_female;
  }
  if (options.female && sprites.front_female) {
    return sprites.front_female;
  }
  if (options.shiny && sprites.front_shiny) {
    return sprites.front_shiny;
  }
  return sprites.front_default || null;
}

/**
 * Known Pokémon names with special formatting, punctuation, or capitalization.
 */
const SPECIAL_NAME_MAP: Record<string, string> = {
  'mr-mime': 'Mr. Mime',
  'mime-jr': 'Mime Jr.',
  'mr-rime': 'Mr. Rime',
  'ho-oh': 'Ho-Oh',
  'porygon-z': 'Porygon-Z',
  'porygon2': 'Porygon2',
  'type-null': 'Type: Null',
  'tapu-koko': 'Tapu Koko',
  'tapu-lele': 'Tapu Lele',
  'tapu-bulu': 'Tapu Bulu',
  'tapu-fini': 'Tapu Fini',
  'nidoran-f': 'Nidoran ♀',
  'nidoran-m': 'Nidoran ♂',
  'flabebe': 'Flabébé',
  'wo-chien': 'Wo-Chien',
  'chien-pao': 'Chien-Pao',
  'ting-lu': 'Ting-Lu',
  'chi-yu': 'Chi-Yu',
  'jangmo-o': 'Jangmo-o',
  'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o',
  'great-tusk': 'Great Tusk',
  'scream-tail': 'Scream Tail',
  'brute-bonnet': 'Brute Bonnet',
  'flutter-mane': 'Flutter Mane',
  'slither-wing': 'Slither Wing',
  'sandy-shocks': 'Sandy Shocks',
  'iron-treads': 'Iron Treads',
  'iron-bundle': 'Iron Bundle',
  'iron-hands': 'Iron Hands',
  'iron-jugulis': 'Iron Jugulis',
  'iron-moth': 'Iron Moth',
  'iron-thorns': 'Iron Thorns',
  'roaring-moon': 'Roaring Moon',
  'iron-valiant': 'Iron Valiant',
  'walking-wake': 'Walking Wake',
  'iron-leaves': 'Iron Leaves',
  'gouging-fire': 'Gouging Fire',
  'raging-bolt': 'Raging Bolt',
  'iron-boulder': 'Iron Boulder',
  'iron-crown': 'Iron Crown',
};

/**
 * Format a Pokémon's API identifier into a clean presentation display name.
 * Respects special hyphenated Pokémon, gender signs, and title casing.
 */
export function formatPokemonName(name: string): string {
  if (!name) return '';
  const normalized = name.toLowerCase().trim();

  if (SPECIAL_NAME_MAP[normalized]) {
    return SPECIAL_NAME_MAP[normalized];
  }

  // Capitalize hyphenated or spaced words (e.g., "charizard" -> "Charizard", "mega-charizard-x" -> "Mega Charizard X")
  return normalized
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
