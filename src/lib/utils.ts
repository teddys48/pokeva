import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format Pokédex ID as 4-digit string, e.g., 25 -> "#0025"
 */
export function formatPokemonId(id: number): string {
  return `#${id.toString().padStart(4, '0')}`;
}

/**
 * Format Pokémon stat name into readable display, e.g. "special-attack" -> "Sp. Atk"
 */
export function formatStatName(statName: string): string {
  const map: Record<string, string> = {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    speed: 'Speed',
  };
  return map[statName] || statName.replace('-', ' ');
}

/**
 * Format weight from hectograms to kilograms
 */
export function formatWeight(hectograms: number): string {
  return `${(hectograms / 10).toFixed(1)} kg`;
}

/**
 * Format height from decimetres to metres
 */
export function formatHeight(decimetres: number): string {
  return `${(decimetres / 10).toFixed(1)} m`;
}
