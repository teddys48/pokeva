import { PokeApiPokemonMove } from '@/types/pokeapi';
import { formatPokemonName } from '@/services/pokeapi/utils';

export type MoveLearnCategory = 'all' | 'level-up' | 'machine' | 'egg' | 'tutor';

export interface ProcessedPokemonMove {
  name: string;
  displayName: string;
  url: string;
  levelLearnedAt: number | null;
  primaryMethod: string;
  methods: string[];
}

/**
 * Normalizes raw API moves into structured, sortable move objects.
 */
export function processPokemonMoves(
  rawMoves?: PokeApiPokemonMove[] | null
): ProcessedPokemonMove[] {
  if (!rawMoves || rawMoves.length === 0) {
    return [];
  }

  return rawMoves.map((m) => {
    const name = m.move.name;
    const displayName = formatPokemonName(name);

    // Extract all unique learn methods across version groups
    const methodsSet = new Set<string>();
    let levelLearnedAt: number | null = null;

    // Use the latest version group detail for the representative learn level
    const reversedDetails = [...m.version_group_details].reverse();
    for (const detail of reversedDetails) {
      const method = detail.move_learn_method.name;
      methodsSet.add(method);

      if (method === 'level-up' && levelLearnedAt === null && detail.level_learned_at > 0) {
        levelLearnedAt = detail.level_learned_at;
      }
    }

    // If level-up occurred at level 0 (e.g. evolution move), set to 1 or 0
    if (methodsSet.has('level-up') && levelLearnedAt === null) {
      const levelDetail = reversedDetails.find(
        (d) => d.move_learn_method.name === 'level-up'
      );
      levelLearnedAt = levelDetail ? levelDetail.level_learned_at : null;
    }

    const methods = Array.from(methodsSet);
    const primaryMethod = methods[0] || 'other';

    return {
      name,
      displayName,
      url: m.move.url,
      levelLearnedAt,
      primaryMethod,
      methods,
    };
  });
}

/**
 * Filter and sort processed moves based on category tab and search query.
 */
export function filterAndSortMoves(
  moves: ProcessedPokemonMove[],
  category: MoveLearnCategory,
  searchQuery: string
): ProcessedPokemonMove[] {
  let filtered = moves;

  if (category !== 'all') {
    filtered = filtered.filter((m) => m.methods.includes(category));
  }

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(
      (m) => m.name.toLowerCase().includes(q) || m.displayName.toLowerCase().includes(q)
    );
  }

  // Sorting
  return [...filtered].sort((a, b) => {
    if (category === 'level-up') {
      const levelA = a.levelLearnedAt ?? 999;
      const levelB = b.levelLearnedAt ?? 999;
      if (levelA !== levelB) {
        return levelA - levelB;
      }
    }
    return a.displayName.localeCompare(b.displayName);
  });
}
