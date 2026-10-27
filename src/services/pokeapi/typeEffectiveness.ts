import { PokemonTypeName } from '@/styles/typeColors';
import { PokeApiType, PokeApiTypeDamageRelations } from '@/types/pokeapi';
import { PokeApiError } from './client';

/**
 * Standard list of all 18 official elemental Pokémon types.
 */
export const ALL_POKEMON_TYPES: PokemonTypeName[] = [
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
];

const VALID_TYPES_SET = new Set<string>(ALL_POKEMON_TYPES);

/**
 * Validates whether a given string is an official Pokémon elemental type.
 */
export function isValidPokemonType(type: string | null | undefined): type is PokemonTypeName {
  if (!type || typeof type !== 'string') return false;
  return VALID_TYPES_SET.has(type.trim().toLowerCase());
}

/**
 * Categorized effectiveness tier based on multiplier value.
 */
export type EffectivenessCategory = 'weakness' | 'resistance' | 'immunity' | 'normal';

/**
 * Calculated type effectiveness for a single attacking type against defender(s).
 */
export interface TypeEffectivenessResult {
  attackingType: PokemonTypeName;
  multiplier: number;
  formattedMultiplier: string;
  category: EffectivenessCategory;
}

/**
 * Comprehensive defensive profile of one or two defending types against all attacking types.
 */
export interface TypeMatchupSummary {
  defender1: PokemonTypeName;
  defender2: PokemonTypeName | null;
  matchups: TypeEffectivenessResult[];
  weaknesses: TypeEffectivenessResult[];
  resistances: TypeEffectivenessResult[];
  immunities: TypeEffectivenessResult[];
  normalDamage: TypeEffectivenessResult[];
}

/**
 * Formats a numeric multiplier into the standard Pokémon notation (0×, ¼×, ½×, 1×, 2×, 4×).
 */
export function formatMultiplier(multiplier: number): string {
  if (multiplier === 0) return '0×';
  if (multiplier === 0.25) return '¼×';
  if (multiplier === 0.5) return '½×';
  if (multiplier === 1) return '1×';
  if (multiplier === 2) return '2×';
  if (multiplier === 4) return '4×';
  return `${multiplier}×`;
}

/**
 * Classifies a numeric multiplier into its semantic effectiveness category.
 */
export function getEffectivenessCategory(multiplier: number): EffectivenessCategory {
  if (multiplier === 0) return 'immunity';
  if (multiplier > 1) return 'weakness';
  if (multiplier > 0 && multiplier < 1) return 'resistance';
  return 'normal';
}

/**
 * Extracts damage relations safely from a PokeApiType object or raw PokeApiTypeDamageRelations.
 */
function extractDamageRelations(
  typeOrRelations: PokeApiType | PokeApiTypeDamageRelations | null | undefined
): PokeApiTypeDamageRelations {
  if (!typeOrRelations || typeof typeOrRelations !== 'object') {
    throw new PokeApiError({
      message: 'Type data or damage relations is null or undefined.',
      code: 'VALIDATION_ERROR',
      userMessage: 'Type relation data is unavailable.',
    });
  }

  if ('damage_relations' in typeOrRelations && typeOrRelations.damage_relations) {
    return typeOrRelations.damage_relations;
  }

  if (
    'no_damage_from' in typeOrRelations &&
    'half_damage_from' in typeOrRelations &&
    'double_damage_from' in typeOrRelations
  ) {
    return typeOrRelations;
  }

  throw new PokeApiError({
    message: 'Invalid damage relations payload: missing defensive relation arrays.',
    code: 'VALIDATION_ERROR',
    userMessage: 'Invalid elemental type relation structure.',
  });
}

/**
 * Safely extracts the type name from a PokeApiType or PokeApiTypeDamageRelations.
 */
function extractTypeName(
  typeOrRelations: PokeApiType | PokeApiTypeDamageRelations | null | undefined
): string | null {
  if (!typeOrRelations || typeof typeOrRelations !== 'object') return null;
  if ('name' in typeOrRelations && typeof typeOrRelations.name === 'string') {
    return typeOrRelations.name.toLowerCase().trim();
  }
  return null;
}

/**
 * Calculates the incoming damage multiplier for an attacking type against a single defending type.
 * Multipliers:
 * - Super effective: 2×
 * - Not very effective: ½×
 * - Normal effectiveness: 1×
 * - Immune: 0×
 */
export function calculateSingleTypeMultiplier(
  attackingType: string,
  defendingType: PokeApiType | PokeApiTypeDamageRelations
): number {
  if (!attackingType || typeof attackingType !== 'string' || !attackingType.trim()) {
    throw new PokeApiError({
      message: 'Attacking type identifier cannot be empty.',
      code: 'VALIDATION_ERROR',
      userMessage: 'Please provide a valid attacking type.',
    });
  }

  const normalizedAttacker = attackingType.trim().toLowerCase();
  const relations = extractDamageRelations(defendingType);

  // 1. Immunity check (0×)
  if (
    Array.isArray(relations.no_damage_from) &&
    relations.no_damage_from.some((item) => item?.name?.toLowerCase() === normalizedAttacker)
  ) {
    return 0;
  }

  // 2. Resistance check (½×)
  if (
    Array.isArray(relations.half_damage_from) &&
    relations.half_damage_from.some((item) => item?.name?.toLowerCase() === normalizedAttacker)
  ) {
    return 0.5;
  }

  // 3. Weakness check (2×)
  if (
    Array.isArray(relations.double_damage_from) &&
    relations.double_damage_from.some((item) => item?.name?.toLowerCase() === normalizedAttacker)
  ) {
    return 2;
  }

  // 4. Normal effectiveness (1×)
  return 1;
}

/**
 * Calculates the incoming damage multiplier for an attacking type against one or two defending types.
 *
 * Rules:
 * - Dual-type multiplies effectiveness against both types.
 * - Immunity on either type yields 0× (0 * anything = 0).
 * - Identical defending types are not counted twice.
 * - Order of defending types does not alter the result.
 */
export function calculateTypeEffectivenessMultiplier(
  attackingType: string,
  defender1: PokeApiType | PokeApiTypeDamageRelations,
  defender2?: (PokeApiType | PokeApiTypeDamageRelations) | null
): number {
  const mult1 = calculateSingleTypeMultiplier(attackingType, defender1);

  // If defender2 is omitted, null, or identical to defender1, return single-type multiplier
  if (!defender2) {
    return mult1;
  }

  const name1 = extractTypeName(defender1);
  const name2 = extractTypeName(defender2);
  if (name1 && name2 && name1 === name2) {
    return mult1;
  }

  const mult2 = calculateSingleTypeMultiplier(attackingType, defender2);

  // Immunity produces 0×
  if (mult1 === 0 || mult2 === 0) {
    return 0;
  }

  return mult1 * mult2;
}

/**
 * Calculates a complete defensive matchup summary for one or two defending types against all 18 elemental types.
 */
export function calculateMatchupSummary(
  defender1: PokeApiType,
  defender2?: PokeApiType | null,
  typesToEvaluate: PokemonTypeName[] = ALL_POKEMON_TYPES
): TypeMatchupSummary {
  if (!defender1 || !defender1.name) {
    throw new PokeApiError({
      message: 'Primary defending type is required to calculate matchup summary.',
      code: 'VALIDATION_ERROR',
      userMessage: 'Please select at least one defending type.',
    });
  }

  const d1Name = defender1.name.toLowerCase().trim() as PokemonTypeName;
  const d2Name = defender2?.name ? (defender2.name.toLowerCase().trim() as PokemonTypeName) : null;

  // Clean defender2 if it matches defender1
  const effectiveDefender2 = d2Name && d2Name !== d1Name ? defender2 : null;
  const effectiveD2Name = effectiveDefender2 ? d2Name : null;

  const matchups: TypeEffectivenessResult[] = typesToEvaluate.map((attackingType) => {
    const multiplier = calculateTypeEffectivenessMultiplier(
      attackingType,
      defender1,
      effectiveDefender2
    );
    return {
      attackingType,
      multiplier,
      formattedMultiplier: formatMultiplier(multiplier),
      category: getEffectivenessCategory(multiplier),
    };
  });

  // Weaknesses: multiplier > 1 (e.g. 4×, 2×), sorted descending by multiplier
  const weaknesses = matchups
    .filter((m) => m.category === 'weakness')
    .sort((a, b) => b.multiplier - a.multiplier || a.attackingType.localeCompare(b.attackingType));

  // Resistances: 0 < multiplier < 1 (e.g. ¼×, ½×), sorted ascending by multiplier
  const resistances = matchups
    .filter((m) => m.category === 'resistance')
    .sort((a, b) => a.multiplier - b.multiplier || a.attackingType.localeCompare(b.attackingType));

  // Immunities: multiplier === 0 (0×)
  const immunities = matchups
    .filter((m) => m.category === 'immunity')
    .sort((a, b) => a.attackingType.localeCompare(b.attackingType));

  // Normal damage: multiplier === 1 (1×)
  const normalDamage = matchups
    .filter((m) => m.category === 'normal')
    .sort((a, b) => a.attackingType.localeCompare(b.attackingType));

  return {
    defender1: d1Name,
    defender2: effectiveD2Name,
    matchups,
    weaknesses,
    resistances,
    immunities,
    normalDamage,
  };
}
