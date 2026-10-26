import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';
import { pokemonQueries } from '@/services/pokeapi/queries';
import { PokemonTypeName } from '@/styles/typeColors';
import { Pokemon } from '@/types/pokemon';
import { NamedAPIResource } from '@/types/pokeapi';
import {
  extractIdFromUrl,
  formatPokemonName,
  calculateTotalPages,
  getPaginationOffset,
} from '@/services/pokeapi/utils';
import { mapPokeApiPokemonToPokemon } from '@/services/pokeapi/mappers';
import { isNotFoundError, PokeApiError } from '@/services/pokeapi/client';
import { SortOption } from './PokemonSearchPreview';

export const PAGE_SIZE = 20;

const VALID_TYPES = new Set<string>([
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

function isValidType(type: string): type is PokemonTypeName {
  return VALID_TYPES.has(type.toLowerCase());
}

/**
 * Creates provisional Pokémon data for cards while full details resolve.
 * Preserves stable IDs and image URLs to eliminate layout shifts.
 */
function createProvisionalPokemon(
  item: NamedAPIResource,
  fallbackType: PokemonTypeName = 'normal'
): Pokemon {
  const id = extractIdFromUrl(item.url) ?? 0;
  const officialArtwork = id > 0
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
    : '';
  const sprite = id > 0
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
    : '';

  return {
    id,
    name: item.name,
    displayName: formatPokemonName(item.name),
    types: [fallbackType],
    imageUrl: sprite || officialArtwork,
    artworkUrl: officialArtwork || sprite,
    genus: 'Pokémon',
    height: 0,
    weight: 0,
    stats: [
      { name: 'hp', base_stat: 50 },
      { name: 'attack', base_stat: 50 },
      { name: 'defense', base_stat: 50 },
      { name: 'special-attack', base_stat: 50 },
      { name: 'special-defense', base_stat: 50 },
      { name: 'speed', base_stat: 50 },
    ],
    description: '',
    generation: 1,
  };
}

export function usePokedexListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Read & Normalize URL Parameters
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const typeParam = searchParams.get('type') || 'all';
  const selectedType: PokemonTypeName | 'all' = isValidType(typeParam) ? typeParam : 'all';

  const urlSearch = searchParams.get('search') || '';
  const sortParam = (searchParams.get('sort') || 'id-asc') as SortOption;
  const sortBy: SortOption = ['id-asc', 'id-desc', 'name-asc'].includes(sortParam)
    ? sortParam
    : 'id-asc';

  // 2. Local search input state with debounce
  const [searchInputValue, setSearchInputValue] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

  // Sync searchInputValue if URL search param changes from outside (e.g. back/forward navigation)
  useEffect(() => {
    setSearchInputValue(urlSearch);
    setDebouncedSearch(urlSearch);
  }, [urlSearch]);

  // Debounce search input updates to URL (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmedInput = searchInputValue.trim();
      const trimmedUrl = urlSearch.trim();

      if (trimmedInput !== trimmedUrl) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          if (trimmedInput) {
            next.set('search', trimmedInput);
          } else {
            next.delete('search');
          }
          // Reset pagination to page 1 on search change
          next.delete('page');
          return next;
        });
      }
      setDebouncedSearch(trimmedInput);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInputValue, urlSearch, setSearchParams]);

  // Helper to update search params reliably
  const updateParams = useCallback(
    (updates: Partial<{ page: number; type: string; search: string; sort: SortOption }>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        if (updates.page !== undefined) {
          if (updates.page <= 1) {
            next.delete('page');
          } else {
            next.set('page', String(updates.page));
          }
        }

        if (updates.type !== undefined) {
          if (updates.type === 'all') {
            next.delete('type');
          } else {
            next.set('type', updates.type);
          }
          // Reset pagination when filter condition changes
          next.delete('page');
        }

        if (updates.search !== undefined) {
          const trimmed = updates.search.trim();
          if (trimmed) {
            next.set('search', trimmed);
          } else {
            next.delete('search');
          }
          // Reset pagination when search changes
          next.delete('page');
        }

        if (updates.sort !== undefined) {
          if (updates.sort === 'id-asc') {
            next.delete('sort');
          } else {
            next.set('sort', updates.sort);
          }
        }

        return next;
      });
    },
    [setSearchParams]
  );

  const isSearching = debouncedSearch.trim().length > 0;

  // Format search query identifier: support #25, 25, or name
  const sanitizedSearch = useMemo(() => {
    if (!isSearching) return '';
    const cleaned = debouncedSearch.trim().toLowerCase().replace(/^#/, '');
    return cleaned;
  }, [debouncedSearch, isSearching]);

  const isNumericSearch = useMemo(() => {
    return /^\d+$/.test(sanitizedSearch);
  }, [sanitizedSearch]);

  const searchLookupIdOrName = useMemo(() => {
    if (!sanitizedSearch) return '';
    if (isNumericSearch) {
      const num = parseInt(sanitizedSearch, 10);
      return num > 0 ? num : '';
    }
    return sanitizedSearch.replace(/\s+/g, '-');
  }, [sanitizedSearch, isNumericSearch]);

  // 3. TanStack Query for Search Lookup
  const searchQuery = useQuery({
    ...pokemonQueries.detail(searchLookupIdOrName),
    enabled: isSearching && Boolean(searchLookupIdOrName),
  });

  // 4. TanStack Query for Type Filter
  const typeQuery = useQuery({
    ...pokemonQueries.type(selectedType),
    enabled: selectedType !== 'all',
  });

  // 5. TanStack Query for Paginated General Listing
  const standardOffset = getPaginationOffset(currentPage, PAGE_SIZE);
  const listQuery = useQuery({
    ...pokemonQueries.list({ limit: PAGE_SIZE, offset: standardOffset }),
    enabled: !isSearching && selectedType === 'all',
  });

  // 6. Resolve Items for the Current View
  // Scenario A: Search is active
  const searchResults: Pokemon[] = useMemo(() => {
    if (!isSearching) return [];

    if (searchQuery.data) {
      const mapped = mapPokeApiPokemonToPokemon(searchQuery.data);
      // If a type filter is active, verify that the found Pokémon matches it
      if (selectedType !== 'all' && !mapped.types.includes(selectedType)) {
        return [];
      }
      return [mapped];
    }

    // If exact lookup returned 404, check if type data has substring matches
    if (searchQuery.error && isNotFoundError(searchQuery.error)) {
      if (selectedType !== 'all' && typeQuery.data?.pokemon) {
        const queryTerm = sanitizedSearch.toLowerCase();
        const matchedTypeItems = typeQuery.data.pokemon
          .filter((p) => p.pokemon.name.toLowerCase().includes(queryTerm))
          .map((p) => createProvisionalPokemon(p.pokemon, selectedType));
        return matchedTypeItems;
      }
    }

    return [];
  }, [isSearching, searchQuery.data, searchQuery.error, selectedType, typeQuery.data, sanitizedSearch]);

  // Scenario B: Type filter active (client pagination of cached type resource)
  const sortedTypeItems = useMemo(() => {
    if (isSearching || selectedType === 'all' || !typeQuery.data?.pokemon) {
      return [];
    }

    // Immutably sort type-specific Pokémon entries
    const items = [...typeQuery.data.pokemon];
    if (sortBy === 'id-desc') {
      return items.sort((a, b) => {
        const idA = extractIdFromUrl(a.pokemon.url) ?? 0;
        const idB = extractIdFromUrl(b.pokemon.url) ?? 0;
        return idB - idA;
      });
    }
    if (sortBy === 'name-asc') {
      return items.sort((a, b) => a.pokemon.name.localeCompare(b.pokemon.name));
    }
    // Default id-asc
    return items.sort((a, b) => {
      const idA = extractIdFromUrl(a.pokemon.url) ?? 0;
      const idB = extractIdFromUrl(b.pokemon.url) ?? 0;
      return idA - idB;
    });
  }, [isSearching, selectedType, typeQuery.data?.pokemon, sortBy]);

  // Scenario C: Standard listing
  const sortedStandardItems = useMemo(() => {
    if (isSearching || selectedType !== 'all' || !listQuery.data?.results) {
      return [];
    }

    const items = [...listQuery.data.results];
    if (sortBy === 'id-desc') {
      return items.sort((a, b) => {
        const idA = extractIdFromUrl(a.url) ?? 0;
        const idB = extractIdFromUrl(b.url) ?? 0;
        return idB - idA;
      });
    }
    if (sortBy === 'name-asc') {
      return items.sort((a, b) => a.name.localeCompare(b.name));
    }
    return items;
  }, [isSearching, selectedType, listQuery.data?.results, sortBy]);

  // Determine current page's raw items
  const currentPageItems: NamedAPIResource[] = useMemo(() => {
    if (isSearching) {
      return [];
    }
    if (selectedType !== 'all') {
      const offset = getPaginationOffset(currentPage, PAGE_SIZE);
      return sortedTypeItems.slice(offset, offset + PAGE_SIZE).map((p) => p.pokemon);
    }
    return sortedStandardItems;
  }, [isSearching, selectedType, currentPage, sortedTypeItems, sortedStandardItems]);

  // 7. Bounded Detail Queries for currently displayed page items
  const detailQueries = useQueries({
    queries: currentPageItems.map((item) => ({
      ...pokemonQueries.detail(item.name),
    })),
  });

  // Combine details with provisional fallback
  const resolvedPokemonList: Pokemon[] = useMemo(() => {
    if (isSearching) {
      return searchResults;
    }

    return currentPageItems.map((item, index) => {
      const detailResult = detailQueries[index];
      if (detailResult?.data) {
        return mapPokeApiPokemonToPokemon(detailResult.data);
      }
      return createProvisionalPokemon(
        item,
        selectedType !== 'all' ? selectedType : 'normal'
      );
    });
  }, [isSearching, searchResults, currentPageItems, detailQueries, selectedType]);

  // Total Counts & Total Pages Calculation
  const totalCount = useMemo(() => {
    if (isSearching) {
      return searchResults.length;
    }
    if (selectedType !== 'all') {
      return typeQuery.data?.pokemon.length ?? 0;
    }
    return listQuery.data?.count ?? 0;
  }, [isSearching, searchResults.length, selectedType, typeQuery.data?.pokemon.length, listQuery.data?.count]);

  const totalPages = useMemo(() => {
    if (isSearching) {
      return searchResults.length > 0 ? 1 : 0;
    }
    return calculateTotalPages(totalCount, PAGE_SIZE);
  }, [isSearching, searchResults.length, totalCount]);

  // Loading States
  const isLoading = useMemo(() => {
    if (isSearching) {
      return searchQuery.isLoading;
    }
    if (selectedType !== 'all') {
      return typeQuery.isLoading;
    }
    return listQuery.isLoading;
  }, [isSearching, searchQuery.isLoading, selectedType, typeQuery.isLoading, listQuery.isLoading]);

  // Error States
  // Treat 404 in search as empty result, not full page crash
  const isError = useMemo(() => {
    if (isSearching) {
      if (searchQuery.isError) {
        return !isNotFoundError(searchQuery.error);
      }
      return false;
    }
    if (selectedType !== 'all') {
      return typeQuery.isError;
    }
    return listQuery.isError;
  }, [isSearching, searchQuery.isError, searchQuery.error, selectedType, typeQuery.isError, listQuery.isError]);

  const error: Error | PokeApiError | null = useMemo(() => {
    if (isSearching && searchQuery.isError && !isNotFoundError(searchQuery.error)) {
      return searchQuery.error;
    }
    if (selectedType !== 'all' && typeQuery.isError) {
      return typeQuery.error;
    }
    if (listQuery.isError) {
      return listQuery.error;
    }
    return null;
  }, [isSearching, searchQuery.isError, searchQuery.error, selectedType, typeQuery.isError, typeQuery.error, listQuery.isError, listQuery.error]);

  const handleRetry = useCallback(() => {
    if (isSearching) {
      searchQuery.refetch();
    } else if (selectedType !== 'all') {
      typeQuery.refetch();
    } else {
      listQuery.refetch();
    }
  }, [isSearching, searchQuery, selectedType, typeQuery, listQuery]);

  const handleResetFilters = useCallback(() => {
    setSearchInputValue('');
    setDebouncedSearch('');
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  return {
    searchQuery: searchInputValue,
    onSearchChange: setSearchInputValue,
    selectedType,
    onTypeSelect: (type: PokemonTypeName | 'all') => updateParams({ type }),
    sortBy,
    onSortChange: (sort: SortOption) => updateParams({ sort }),
    currentPage,
    onPageChange: (page: number) => updateParams({ page }),
    pageSize: PAGE_SIZE,
    pokemonList: resolvedPokemonList,
    totalCount,
    totalPages,
    isLoading,
    isSearching: searchQuery.isFetching,
    isError,
    error,
    onRetry: handleRetry,
    onResetFilters: handleResetFilters,
  };
}
