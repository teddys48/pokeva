import { PokemonTypeName } from '@/styles/typeColors';

export interface PokemonStat {
  name: 'hp' | 'attack' | 'defense' | 'special-attack' | 'special-defense' | 'speed';
  base_stat: number;
}

export interface Pokemon {
  id: number;
  name: string;
  displayName: string;
  types: PokemonTypeName[];
  imageUrl: string;
  artworkUrl: string;
  genus: string;
  height: number; // in decimetres (0.1m)
  weight: number; // in hectograms (0.1kg)
  stats: PokemonStat[];
  description: string;
  generation: number;
  base_experience?: number | null;
}

export interface PokemonFilterState {
  searchQuery: string;
  selectedType: PokemonTypeName | 'all';
}
