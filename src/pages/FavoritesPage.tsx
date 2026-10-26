import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useFavorites } from '@/features/favorites/useFavorites';
import { FavoritesEmptyState } from '@/features/favorites/FavoritesEmptyState';
import { PokemonCard } from '@/features/pokemon/PokemonCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQueries } from '@tanstack/react-query';
import { pokemonQueries } from '@/services/pokeapi/queries';
import { mapPokeApiPokemonToPokemon } from '@/services/pokeapi/mappers';
import { formatPokemonName } from '@/services/pokeapi/utils';
import { Pokemon } from '@/types/pokemon';
import { FavoritesSortOption } from '@/types/favorites';
import { Heart, Search, ArrowUpDown, RefreshCw, AlertCircle } from 'lucide-react';

/**
 * Creates provisional Pokémon data for favorite items whose full details
 * are currently loading or temporarily unavailable due to network errors.
 * Guarantees that saved favorites remain visible and usable without layout shifts.
 */
function createProvisionalFavoritePokemon(id: number, name: string): Pokemon {
  const officialArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  return {
    id,
    name,
    displayName: formatPokemonName(name),
    types: ['normal'],
    imageUrl: sprite || officialArtwork,
    artworkUrl: officialArtwork || sprite,
    genus: 'Saved Favorite',
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
    description: 'Favorite saved in your personal collection.',
    generation: 1,
  };
}

export function FavoritesPage() {
  const { favorites, totalFavorites } = useFavorites();
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<FavoritesSortOption>('recent');

  // Filter favorites by optional search text
  const filteredFavorites = useMemo(() => {
    const query = searchFilter.trim().toLowerCase().replace(/^#/, '');
    if (!query) return favorites;

    return favorites.filter((fav) => {
      if (fav.name.toLowerCase().includes(query)) return true;
      if (String(fav.id) === query) return true;
      return false;
    });
  }, [favorites, searchFilter]);

  // Sort favorites in a strictly predictable order
  const sortedFavorites = useMemo(() => {
    const list = [...filteredFavorites];
    switch (sortBy) {
      case 'recent':
        return list.sort((a, b) => b.addedAt - a.addedAt);
      case 'oldest':
        return list.sort((a, b) => a.addedAt - b.addedAt);
      case 'id-asc':
        return list.sort((a, b) => a.id - b.id);
      case 'id-desc':
        return list.sort((a, b) => b.id - a.id);
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [filteredFavorites, sortBy]);

  // Bounded TanStack Query detail fetching for all displayed favorites
  // Automatically reuses cached data and never re-fetches unnecessarily
  const detailQueries = useQueries({
    queries: sortedFavorites.map((fav) => ({
      ...pokemonQueries.detail(fav.id),
    })),
  });

  // Track any recoverable network/API errors across the items
  const failedQueries = useMemo(() => {
    return detailQueries.filter((q) => q.isError);
  }, [detailQueries]);

  const handleRetryAllFailed = () => {
    failedQueries.forEach((q) => q.refetch());
  };

  // Resolve final domain Pokémon models matching sorted order strictly
  const resolvedList: Pokemon[] = useMemo(() => {
    return sortedFavorites.map((fav, index) => {
      const queryResult = detailQueries[index];
      if (queryResult?.data) {
        return mapPokeApiPokemonToPokemon(queryResult.data);
      }
      // Return stable provisional Pokémon model during loading or API failure
      return createProvisionalFavoritePokemon(fav.id, fav.name);
    });
  }, [sortedFavorites, detailQueries]);

  return (
    <div className="py-8 md:py-10 space-y-8 animate-fade-in">
      <PageContainer>
        {/* Header Hero Section */}
        <section
          className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-rose-500/5 p-6 sm:p-8 lg:p-10 shadow-xs"
          aria-labelledby="favorites-heading"
        >
          {/* Subtle Ambient Rose Glow */}
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-rose-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/5 text-xs font-semibold gap-1.5 py-0.5 px-2.5"
              >
                <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                <span>Personal Collection</span>
              </Badge>
              <span className="text-xs text-muted-foreground hidden sm:inline-block">·</span>
              <span className="text-xs text-muted-foreground">
                Persisted in your browser
              </span>
            </div>

            <h1
              id="favorites-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight"
            >
              Favorite Pokémon
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
              Your curated Pokémon collection. All favorites are saved locally on this device and updated in real-time.
            </p>

            <div className="pt-1 flex items-center gap-3 text-xs font-mono text-muted-foreground">
              <span className="font-semibold text-foreground">
                {totalFavorites} {totalFavorites === 1 ? 'Pokémon' : 'Pokémon'} Saved
              </span>
            </div>
          </div>
        </section>

        {/* Collection Content */}
        {totalFavorites === 0 ? (
          <FavoritesEmptyState />
        ) : (
          <div className="mt-8 space-y-6">
            {/* Filter, Search & Sort Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xs">
              <div className="relative flex-1 max-w-md">
                <Input
                  type="search"
                  placeholder="Filter your favorites by name or #ID..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  clearable={Boolean(searchFilter)}
                  onClear={() => setSearchFilter('')}
                  icon={<Search className="h-4 w-4" />}
                  className="h-10 text-sm"
                  aria-label="Filter favorites"
                />
              </div>

              <div className="flex items-center gap-2.5 justify-end">
                <label
                  htmlFor="favorites-sort"
                  className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 shrink-0"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span>Sort by:</span>
                </label>
                <select
                  id="favorites-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as FavoritesSortOption)}
                  className="h-10 rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  aria-label="Sort favorite Pokémon"
                >
                  <option value="recent">Recently Added</option>
                  <option value="oldest">Oldest First</option>
                  <option value="id-asc">Pokédex Number (Low to High)</option>
                  <option value="id-desc">Pokédex Number (High to Low)</option>
                  <option value="name-asc">Name (A to Z)</option>
                </select>
              </div>
            </div>

            {/* Recoverable Network Error Notice */}
            {failedQueries.length > 0 && (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 animate-fade-in"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    Unable to fetch full details for {failedQueries.length} Pokémon from PokéAPI. Showing saved collection data.
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryAllFailed}
                  className="gap-1.5 h-8 border-amber-500/30 bg-background/80 hover:bg-background"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Retry</span>
                </Button>
              </div>
            )}

            {/* Empty search filter result */}
            {resolvedList.length === 0 ? (
              <div
                role="status"
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center animate-fade-in"
              >
                <p className="text-sm text-muted-foreground">
                  No saved favorites matching &ldquo;<span className="font-semibold text-foreground">{searchFilter}</span>&rdquo;.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchFilter('')}
                  className="mt-3 text-xs"
                >
                  Clear filter
                </Button>
              </div>
            ) : (
              /* Populated Favorites Grid */
              <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                role="region"
                aria-label="Favorite Pokémon collection"
              >
                {resolvedList.map((pokemon, index) => (
                  <PokemonCard key={pokemon.id} pokemon={pokemon} priority={index < 8} />
                ))}
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
