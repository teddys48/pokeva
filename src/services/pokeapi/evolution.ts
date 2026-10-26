import { PokeApiChainLink, PokeApiEvolutionDetail } from '@/types/pokeapi';
import { extractIdFromUrl, formatPokemonName, POKEMON_FALLBACK_IMAGE } from './utils';

export interface EvolutionTreeNode {
  speciesName: string;
  speciesId: number | null;
  displayName: string;
  artworkUrl: string;
  spriteUrl: string;
  isBaby: boolean;
  conditions: string[];
  evolvesTo: EvolutionTreeNode[];
}

/**
 * Format a single PokeApiEvolutionDetail into human-readable text.
 */
export function formatEvolutionDetail(detail: PokeApiEvolutionDetail): string {
  const parts: string[] = [];

  if (detail.min_level != null) {
    parts.push(`Level ${detail.min_level}`);
  }

  if (detail.item) {
    parts.push(`Use ${formatPokemonName(detail.item.name)}`);
  }

  if (detail.held_item) {
    parts.push(`Holding ${formatPokemonName(detail.held_item.name)}`);
  }

  if (detail.trigger) {
    if (detail.trigger.name === 'trade') {
      if (detail.trade_species) {
        parts.push(`Trade for ${formatPokemonName(detail.trade_species.name)}`);
      } else if (!detail.held_item) {
        parts.push('Trade');
      }
    } else if (detail.trigger.name === 'shed') {
      parts.push('Shed at Lv 20');
    } else if (detail.trigger.name === 'spin') {
      parts.push('Spin');
    } else if (detail.trigger.name === 'tower-of-darkness') {
      parts.push('Tower of Darkness');
    } else if (detail.trigger.name === 'tower-of-waters') {
      parts.push('Tower of Waters');
    } else if (detail.trigger.name === 'three-critical-hits') {
      parts.push('3 critical hits');
    } else if (detail.trigger.name === 'take-damage') {
      parts.push('Take 49+ damage');
    } else if (
      detail.trigger.name !== 'level-up' &&
      detail.trigger.name !== 'use-item' &&
      parts.length === 0
    ) {
      parts.push(formatPokemonName(detail.trigger.name));
    }
  }

  if (detail.min_happiness != null) {
    parts.push(`High Friendship (≥${detail.min_happiness})`);
  }

  if (detail.min_affection != null) {
    parts.push(`High Affection (≥${detail.min_affection})`);
  }

  if (detail.min_beauty != null) {
    parts.push(`High Beauty (≥${detail.min_beauty})`);
  }

  if (detail.known_move) {
    parts.push(`Knows ${formatPokemonName(detail.known_move.name)}`);
  }

  if (detail.known_move_type) {
    parts.push(`Knows ${formatPokemonName(detail.known_move_type.name)}-type move`);
  }

  if (detail.location) {
    parts.push(`at ${formatPokemonName(detail.location.name)}`);
  }

  if (detail.time_of_day) {
    const tod = detail.time_of_day.toLowerCase();
    parts.push(tod === 'day' ? 'Day' : tod === 'night' ? 'Night' : detail.time_of_day);
  }

  if (detail.relative_physical_stats === 1) {
    parts.push('Atk > Def');
  } else if (detail.relative_physical_stats === -1) {
    parts.push('Def > Atk');
  } else if (detail.relative_physical_stats === 0) {
    parts.push('Atk = Def');
  }

  if (detail.gender === 1) {
    parts.push('Female');
  } else if (detail.gender === 2) {
    parts.push('Male');
  }

  if (detail.party_species) {
    parts.push(`With ${formatPokemonName(detail.party_species.name)} in party`);
  }

  if (detail.party_type) {
    parts.push(`With ${formatPokemonName(detail.party_type.name)}-type in party`);
  }

  if (detail.needs_overworld_rain) {
    parts.push('During rain');
  }

  if (detail.turn_upside_down) {
    parts.push('Turn device upside down');
  }

  if (parts.length === 0) {
    return 'Special condition';
  }

  return parts.join(' • ');
}

/**
 * Format all evolution details for a node into an array of readable requirement strings.
 */
export function formatAllEvolutionDetails(details: PokeApiEvolutionDetail[]): string[] {
  if (!details || details.length === 0) {
    return [];
  }
  return details.map(formatEvolutionDetail);
}

/**
 * Recursively parses a PokeApiChainLink into an EvolutionTreeNode.
 */
export function parseEvolutionChain(chain: PokeApiChainLink): EvolutionTreeNode {
  const speciesId = extractIdFromUrl(chain.species.url);
  const speciesName = chain.species.name;
  const displayName = formatPokemonName(speciesName);

  const artworkUrl = speciesId
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`
    : POKEMON_FALLBACK_IMAGE;

  const spriteUrl = speciesId
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`
    : artworkUrl;

  const conditions = formatAllEvolutionDetails(chain.evolution_details);

  const evolvesTo = chain.evolves_to.map((child) => parseEvolutionChain(child));

  return {
    speciesName,
    speciesId,
    displayName,
    artworkUrl,
    spriteUrl,
    isBaby: chain.is_baby,
    conditions,
    evolvesTo,
  };
}

/**
 * Check if the evolution chain has any evolutionary stages beyond the base Pokémon.
 */
export function hasEvolutions(tree: EvolutionTreeNode): boolean {
  return tree.evolvesTo.length > 0;
}

/**
 * Total number of Pokémon in the evolution chain.
 */
export function countChainNodes(tree: EvolutionTreeNode): number {
  let count = 1;
  for (const child of tree.evolvesTo) {
    count += countChainNodes(child);
  }
  return count;
}
