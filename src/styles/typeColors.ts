/**
 * Centralized Pokémon Type Colors & Styling Tokens.
 * Designed with deliberate WCAG AA contrast for both light and dark backgrounds.
 */

export type PokemonTypeName =
  | 'normal'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'steel'
  | 'dark'
  | 'fairy';

export interface TypeStyle {
  name: PokemonTypeName;
  label: string;
  bgHex: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardGlow: string;
  cardSurfaceLight: string;
  cardSurfaceDark: string;
}

export const POKEMON_TYPE_STYLES: Record<PokemonTypeName, TypeStyle> = {
  normal: {
    name: 'normal',
    label: 'Normal',
    bgHex: '#94A3B8',
    badgeBg: 'bg-slate-500/15 dark:bg-slate-400/20',
    badgeText: 'text-slate-700 dark:text-slate-200',
    badgeBorder: 'border-slate-300 dark:border-slate-700',
    cardGlow: 'hover:shadow-slate-400/20',
    cardSurfaceLight: 'bg-slate-50/60',
    cardSurfaceDark: 'dark:bg-slate-900/40',
  },
  fire: {
    name: 'fire',
    label: 'Fire',
    bgHex: '#EA580C',
    badgeBg: 'bg-orange-500/15 dark:bg-orange-500/25',
    badgeText: 'text-orange-700 dark:text-orange-300',
    badgeBorder: 'border-orange-300 dark:border-orange-800',
    cardGlow: 'hover:shadow-orange-500/25',
    cardSurfaceLight: 'bg-orange-50/50',
    cardSurfaceDark: 'dark:bg-orange-950/25',
  },
  water: {
    name: 'water',
    label: 'Water',
    bgHex: '#2563EB',
    badgeBg: 'bg-blue-500/15 dark:bg-blue-500/25',
    badgeText: 'text-blue-700 dark:text-blue-300',
    badgeBorder: 'border-blue-300 dark:border-blue-800',
    cardGlow: 'hover:shadow-blue-500/25',
    cardSurfaceLight: 'bg-blue-50/50',
    cardSurfaceDark: 'dark:bg-blue-950/25',
  },
  grass: {
    name: 'grass',
    label: 'Grass',
    bgHex: '#16A34A',
    badgeBg: 'bg-emerald-500/15 dark:bg-emerald-500/25',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-300 dark:border-emerald-800',
    cardGlow: 'hover:shadow-emerald-500/25',
    cardSurfaceLight: 'bg-emerald-50/50',
    cardSurfaceDark: 'dark:bg-emerald-950/25',
  },
  electric: {
    name: 'electric',
    label: 'Electric',
    bgHex: '#CA8A04',
    badgeBg: 'bg-yellow-500/15 dark:bg-yellow-500/25',
    badgeText: 'text-yellow-800 dark:text-yellow-300',
    badgeBorder: 'border-yellow-300 dark:border-yellow-700',
    cardGlow: 'hover:shadow-yellow-500/25',
    cardSurfaceLight: 'bg-yellow-50/50',
    cardSurfaceDark: 'dark:bg-yellow-950/25',
  },
  ice: {
    name: 'ice',
    label: 'Ice',
    bgHex: '#0891B2',
    badgeBg: 'bg-cyan-500/15 dark:bg-cyan-500/25',
    badgeText: 'text-cyan-800 dark:text-cyan-300',
    badgeBorder: 'border-cyan-300 dark:border-cyan-800',
    cardGlow: 'hover:shadow-cyan-500/25',
    cardSurfaceLight: 'bg-cyan-50/50',
    cardSurfaceDark: 'dark:bg-cyan-950/25',
  },
  fighting: {
    name: 'fighting',
    label: 'Fighting',
    bgHex: '#DC2626',
    badgeBg: 'bg-red-700/15 dark:bg-red-700/25',
    badgeText: 'text-red-800 dark:text-red-300',
    badgeBorder: 'border-red-300 dark:border-red-800',
    cardGlow: 'hover:shadow-red-600/25',
    cardSurfaceLight: 'bg-red-50/50',
    cardSurfaceDark: 'dark:bg-red-950/25',
  },
  poison: {
    name: 'poison',
    label: 'Poison',
    bgHex: '#9333EA',
    badgeBg: 'bg-purple-600/15 dark:bg-purple-600/25',
    badgeText: 'text-purple-800 dark:text-purple-300',
    badgeBorder: 'border-purple-300 dark:border-purple-800',
    cardGlow: 'hover:shadow-purple-600/25',
    cardSurfaceLight: 'bg-purple-50/50',
    cardSurfaceDark: 'dark:bg-purple-950/25',
  },
  ground: {
    name: 'ground',
    label: 'Ground',
    bgHex: '#B45309',
    badgeBg: 'bg-amber-600/15 dark:bg-amber-600/25',
    badgeText: 'text-amber-800 dark:text-amber-300',
    badgeBorder: 'border-amber-300 dark:border-amber-800',
    cardGlow: 'hover:shadow-amber-600/25',
    cardSurfaceLight: 'bg-amber-50/50',
    cardSurfaceDark: 'dark:bg-amber-950/25',
  },
  flying: {
    name: 'flying',
    label: 'Flying',
    bgHex: '#0284C7',
    badgeBg: 'bg-sky-500/15 dark:bg-sky-500/25',
    badgeText: 'text-sky-800 dark:text-sky-300',
    badgeBorder: 'border-sky-300 dark:border-sky-800',
    cardGlow: 'hover:shadow-sky-500/25',
    cardSurfaceLight: 'bg-sky-50/50',
    cardSurfaceDark: 'dark:bg-sky-950/25',
  },
  psychic: {
    name: 'psychic',
    label: 'Psychic',
    bgHex: '#DB2777',
    badgeBg: 'bg-pink-600/15 dark:bg-pink-600/25',
    badgeText: 'text-pink-800 dark:text-pink-300',
    badgeBorder: 'border-pink-300 dark:border-pink-800',
    cardGlow: 'hover:shadow-pink-600/25',
    cardSurfaceLight: 'bg-pink-50/50',
    cardSurfaceDark: 'dark:bg-pink-950/25',
  },
  bug: {
    name: 'bug',
    label: 'Bug',
    bgHex: '#65A30D',
    badgeBg: 'bg-lime-600/15 dark:bg-lime-600/25',
    badgeText: 'text-lime-800 dark:text-lime-300',
    badgeBorder: 'border-lime-300 dark:border-lime-800',
    cardGlow: 'hover:shadow-lime-600/25',
    cardSurfaceLight: 'bg-lime-50/50',
    cardSurfaceDark: 'dark:bg-lime-950/25',
  },
  rock: {
    name: 'rock',
    label: 'Rock',
    bgHex: '#78716C',
    badgeBg: 'bg-stone-600/15 dark:bg-stone-600/25',
    badgeText: 'text-stone-800 dark:text-stone-300',
    badgeBorder: 'border-stone-300 dark:border-stone-700',
    cardGlow: 'hover:shadow-stone-500/25',
    cardSurfaceLight: 'bg-stone-50/50',
    cardSurfaceDark: 'dark:bg-stone-900/30',
  },
  ghost: {
    name: 'ghost',
    label: 'Ghost',
    bgHex: '#4F46E5',
    badgeBg: 'bg-indigo-600/15 dark:bg-indigo-600/25',
    badgeText: 'text-indigo-800 dark:text-indigo-300',
    badgeBorder: 'border-indigo-300 dark:border-indigo-800',
    cardGlow: 'hover:shadow-indigo-600/25',
    cardSurfaceLight: 'bg-indigo-50/50',
    cardSurfaceDark: 'dark:bg-indigo-950/25',
  },
  dragon: {
    name: 'dragon',
    label: 'Dragon',
    bgHex: '#7C3AED',
    badgeBg: 'bg-violet-600/15 dark:bg-violet-600/25',
    badgeText: 'text-violet-800 dark:text-violet-300',
    badgeBorder: 'border-violet-300 dark:border-violet-800',
    cardGlow: 'hover:shadow-violet-600/25',
    cardSurfaceLight: 'bg-violet-50/50',
    cardSurfaceDark: 'dark:bg-violet-950/25',
  },
  steel: {
    name: 'steel',
    label: 'Steel',
    bgHex: '#475569',
    badgeBg: 'bg-slate-600/15 dark:bg-slate-600/25',
    badgeText: 'text-slate-800 dark:text-slate-300',
    badgeBorder: 'border-slate-300 dark:border-slate-700',
    cardGlow: 'hover:shadow-slate-500/25',
    cardSurfaceLight: 'bg-slate-50/50',
    cardSurfaceDark: 'dark:bg-slate-900/30',
  },
  dark: {
    name: 'dark',
    label: 'Dark',
    bgHex: '#334155',
    badgeBg: 'bg-zinc-800/15 dark:bg-zinc-700/30',
    badgeText: 'text-zinc-800 dark:text-zinc-200',
    badgeBorder: 'border-zinc-300 dark:border-zinc-700',
    cardGlow: 'hover:shadow-zinc-700/25',
    cardSurfaceLight: 'bg-zinc-100/60',
    cardSurfaceDark: 'dark:bg-zinc-900/50',
  },
  fairy: {
    name: 'fairy',
    label: 'Fairy',
    bgHex: '#EC4899',
    badgeBg: 'bg-pink-400/20 dark:bg-pink-400/25',
    badgeText: 'text-pink-800 dark:text-pink-300',
    badgeBorder: 'border-pink-300 dark:border-pink-800',
    cardGlow: 'hover:shadow-pink-400/25',
    cardSurfaceLight: 'bg-pink-50/50',
    cardSurfaceDark: 'dark:bg-pink-950/25',
  },
};

export function getTypeStyle(type: string): TypeStyle {
  const normalized = type.toLowerCase() as PokemonTypeName;
  return POKEMON_TYPE_STYLES[normalized] ?? POKEMON_TYPE_STYLES.normal;
}
