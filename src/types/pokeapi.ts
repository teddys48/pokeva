/**
 * Official PokéAPI v2 TypeScript Data Models.
 * 
 * Defines strongly typed models for the resources used by Pokéva:
 * - Resource references and paginated lists
 * - Pokémon details, sprites, abilities, stats, types, and moves
 * - Species details, genera, and flavor text
 * - Evolution chains and branching conditions
 * - Type definitions and damage relations
 * - Client error definitions
 */

/**
 * Standard named API resource reference containing the name and URL.
 */
export interface NamedAPIResource {
  name: string;
  url: string;
}

/**
 * Standard paginated list response wrapper from PokéAPI.
 */
export interface NamedAPIResourceList<T = NamedAPIResource> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Pagination request parameters.
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * Ability slot on a Pokémon.
 */
export interface PokeApiPokemonAbility {
  ability: NamedAPIResource;
  is_hidden: boolean;
  slot: number;
}

/**
 * Stat slot on a Pokémon.
 */
export interface PokeApiPokemonStat {
  base_stat: number;
  effort: number;
  stat: NamedAPIResource;
}

/**
 * Type slot on a Pokémon.
 */
export interface PokeApiPokemonType {
  slot: number;
  type: NamedAPIResource;
}

/**
 * Sprite asset variants for a Pokémon.
 */
export interface PokeApiPokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  front_female: string | null;
  front_shiny_female: string | null;
  back_default: string | null;
  back_shiny: string | null;
  back_female: string | null;
  back_shiny_female: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
      front_shiny?: string | null;
    };
    dream_world?: {
      front_default: string | null;
      front_female?: string | null;
    };
    home?: {
      front_default: string | null;
      front_female?: string | null;
      front_shiny?: string | null;
      front_shiny_female?: string | null;
    };
    showdown?: {
      front_default: string | null;
      back_default?: string | null;
    };
  };
}

/**
 * Cries audio assets.
 */
export interface PokeApiPokemonCries {
  latest?: string;
  legacy?: string;
}

/**
 * Version group details for a move learned by a Pokémon.
 */
export interface PokeApiPokemonMoveVersionGroupDetail {
  level_learned_at: number;
  move_learn_method: NamedAPIResource;
  version_group: NamedAPIResource;
}

/**
 * Move entry on a Pokémon resource.
 */
export interface PokeApiPokemonMove {
  move: NamedAPIResource;
  version_group_details: PokeApiPokemonMoveVersionGroupDetail[];
}

/**
 * Full Pokémon resource returned from GET /pokemon/{id-or-name}.
 */
export interface PokeApiPokemon {
  id: number;
  name: string;
  base_experience: number | null;
  height: number; // in decimetres (0.1m)
  is_default: boolean;
  order: number;
  weight: number; // in hectograms (0.1kg)
  abilities: PokeApiPokemonAbility[];
  forms: NamedAPIResource[];
  species: NamedAPIResource;
  sprites: PokeApiPokemonSprites;
  stats: PokeApiPokemonStat[];
  types: PokeApiPokemonType[];
  moves?: PokeApiPokemonMove[];
  cries?: PokeApiPokemonCries;
}

/**
 * Flavor text entry from Pokémon species.
 */
export interface PokeApiFlavorTextEntry {
  flavor_text: string;
  language: NamedAPIResource;
  version: NamedAPIResource;
}

/**
 * Genus classification entry (e.g., "Seed Pokémon").
 */
export interface PokeApiGenusEntry {
  genus: string;
  language: NamedAPIResource;
}

/**
 * Variety reference for species with multiple forms.
 */
export interface PokeApiSpeciesVariety {
  is_default: boolean;
  pokemon: NamedAPIResource;
}

/**
 * Evolution chain reference on a species.
 */
export interface PokeApiEvolutionChainReference {
  url: string;
}

/**
 * Full Pokémon Species resource returned from GET /pokemon-species/{id-or-name}.
 */
export interface PokeApiSpecies {
  id: number;
  name: string;
  order: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  has_gender_differences: boolean;
  forms_switchable: boolean;
  growth_rate: NamedAPIResource;
  color: NamedAPIResource;
  shape: NamedAPIResource | null;
  evolves_from_species: NamedAPIResource | null;
  evolution_chain: PokeApiEvolutionChainReference;
  habitat: NamedAPIResource | null;
  generation: NamedAPIResource;
  flavor_text_entries: PokeApiFlavorTextEntry[];
  genera: PokeApiGenusEntry[];
  egg_groups: NamedAPIResource[];
  varieties: PokeApiSpeciesVariety[];
}

/**
 * Evolution trigger details.
 */
export interface PokeApiEvolutionDetail {
  item: NamedAPIResource | null;
  trigger: NamedAPIResource;
  gender: number | null;
  held_item: NamedAPIResource | null;
  known_move: NamedAPIResource | null;
  known_move_type: NamedAPIResource | null;
  location: NamedAPIResource | null;
  min_level: number | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  needs_overworld_rain: boolean;
  party_species: NamedAPIResource | null;
  party_type: NamedAPIResource | null;
  relative_physical_stats: number | null;
  time_of_day: string;
  trade_species: NamedAPIResource | null;
  turn_upside_down: boolean;
}

/**
 * Node within an evolution chain hierarchy.
 */
export interface PokeApiChainLink {
  is_baby: boolean;
  species: NamedAPIResource;
  evolution_details: PokeApiEvolutionDetail[];
  evolves_to: PokeApiChainLink[];
}

/**
 * Full Evolution Chain resource returned from GET /evolution-chain/{id}.
 */
export interface PokeApiEvolutionChain {
  id: number;
  baby_trigger_item: NamedAPIResource | null;
  chain: PokeApiChainLink;
}

/**
 * Effect entry for abilities and moves.
 */
export interface PokeApiEffectEntry {
  effect: string;
  short_effect: string;
  language: NamedAPIResource;
}

/**
 * Ability flavor text entry.
 */
export interface PokeApiAbilityFlavorText {
  flavor_text: string;
  language: NamedAPIResource;
  version_group?: NamedAPIResource;
}

/**
 * Full Ability resource returned from GET /ability/{id-or-name}.
 */
export interface PokeApiAbility {
  id: number;
  name: string;
  is_main_series: boolean;
  flavor_text_entries: PokeApiAbilityFlavorText[];
  effect_entries: PokeApiEffectEntry[];
}

/**
 * Full Move resource returned from GET /move/{id-or-name}.
 */
export interface PokeApiMove {
  id: number;
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number | null;
  priority: number;
  damage_class: NamedAPIResource | null;
  type: NamedAPIResource;
  flavor_text_entries?: PokeApiFlavorTextEntry[];
  effect_entries?: PokeApiEffectEntry[];
}

/**
 * Type damage relation multipliers.
 */
export interface PokeApiTypeDamageRelations {
  no_damage_to: NamedAPIResource[];
  half_damage_to: NamedAPIResource[];
  double_damage_to: NamedAPIResource[];
  no_damage_from: NamedAPIResource[];
  half_damage_from: NamedAPIResource[];
  double_damage_from: NamedAPIResource[];
}

/**
 * Pokémon entry in a type listing.
 */
export interface PokeApiTypePokemon {
  slot: number;
  pokemon: NamedAPIResource;
}

/**
 * Localized name entry for a type or resource.
 */
export interface PokeApiLocalizedName {
  name: string;
  language: NamedAPIResource;
}

/**
 * Full Type resource returned from GET /type/{id-or-name}.
 */
export interface PokeApiType {
  id: number;
  name: string;
  damage_relations: PokeApiTypeDamageRelations;
  pokemon: PokeApiTypePokemon[];
  generation: NamedAPIResource;
  move_damage_class: NamedAPIResource | null;
  names: PokeApiLocalizedName[];
}

/**
 * Categorized error codes for PokéAPI interactions.
 */
export type PokeApiErrorCode =
  | 'HTTP_ERROR'
  | 'NETWORK_ERROR'
  | 'ABORT_ERROR'
  | 'PARSE_ERROR'
  | 'VALIDATION_ERROR';

/**
 * Options used to initialize a PokeApiError.
 */
export interface PokeApiErrorOptions {
  message: string;
  code: PokeApiErrorCode;
  status?: number;
  statusText?: string;
  url?: string;
  userMessage?: string;
  cause?: unknown;
}
