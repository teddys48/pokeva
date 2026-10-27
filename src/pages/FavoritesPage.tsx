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
import { useDocumentTitle } from '@/lib/useDocumentTitle';
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

  useDocumentTitle(
    totalFavorites > 0
      ? `My Favorites (${totalFavorites}) — Pokéva`
      : 'My Favorites — Pokéva'
  );

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

  // Combine query results or fall back to provisional representation
  const resolvedPokemonList: Pokemon[] = useMemo(() => {
    return sortedFavorites.map((fav, index) => {
      const queryResult = detailQueries[index];
      if (queryResult?.data) {
        return mapPokeApiPokemonToPokemon(queryResult.data);
      }
      return createProvisionalFavoritePokemon(fav.id, fav.name);
    });
  }, [sortedFavorites, detailQueries]);

  return (
    <div className="py-8 md:py-10 space-y-8 animate-fade-in">
      <PageContainer>
        {/* Header Section */}
        <section
          className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-secondary/30 p-6 sm:p-8 lg:p-10 shadow-xs"
          aria-labelledby="favorites-heading"
        >
          {/* Subtle Pink Ambient Glow */}
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-rose-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-rose-500/30 text-rose-500 bg-rose-500/5 text-xs font-semibold gap-1.5 py-0.5 px-2.5"
              >
                <Heart className="h-3.5 w-3.5 fill-current" />
                <span>Personal Collection</span>
              </Badge>
              <span className="text-xs text-muted-foreground hidden sm:inline-block">·</span>
              <span className="text-xs text-muted-foreground hidden sm:inline-block">
                Saved on Your Device
              </span>
            </div>

            <h1
              id="favorites-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight"
            >
              My Favorite <span className="text-rose-500">Pokémon</span>.
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
              Your curated Pokémon collection preserved securely on your device.
              Easily search, sort, and organize your favorite Pokémon anytime.
            </p>

            {/* Collection Metadata Highlights */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <Heart className="h-3.5 w-3.5 text-rose-500 fill-current" />
                <span>
                  {totalFavorites} {totalFavorites === 1 ? 'Pokémon' : 'Pokémon'} Saved
                </span>
              </span>
              <span>·</span>
              <span>
                {filteredFavorites.length} Displayed
              </span>
            </div>
          </div>
        </section>

        {/* Empty State vs Collection Content */}
        {totalFavorites === 0 ? (
          <section className="mt-8">
            <FavoritesEmptyState />
          </section>
        ) : (
          <section className="mt-8 space-y-6" aria-label="Favorites catalogue">
            {/* Action Bar: Search Input, Sorting, & Recoverable Retry */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xs">
              {/* Search Filter */}
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                  aria-hidden="true"
                />
                <Input
                  type="text"
                  placeholder="Filter favorites by name or #ID..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-background border-border/80"
                  aria-label="Filter saved favorites"
                />
              </div>

              {/* Sorting & Retry Controls */}
              <div className="flex flex-wrap items-center gap-2.5 justify-end">
                {/* Partial Failure Warning & Retry Button */}
                {failedQueries.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetryAllFailed}
                    className="gap-1.5 text-xs text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                    title="Some favorites could not be loaded. Click to retry."
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Retry {failedQueries.length} failed</span>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                  <label htmlFor="favorites-sort" className="text-xs font-medium text-muted-foreground shrink-0">
                    Sort:
                  </label>
                  <select
                    id="favorites-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as FavoritesSortOption)}
                    className="text-xs font-medium bg-background border border-border/80 rounded-lg px-2.5 py-1.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Sort favorites"
                  >
                    <option value="recent">Recently Added</option>
                    <option value="oldest">Oldest First</option>
                    <option value="id-asc">Pokédex # (Ascending)</option>
                    <option value="id-desc">Pokédex # (Descending)</option>
                    <option value="name-asc">Name (A–Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Zero Filter Result State */}
            {filteredFavorites.length === 0 && searchFilter.trim() !== '' ? (
              <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center space-y-3 bg-card/30">
                <p className="text-sm font-medium text-foreground">
                  No saved favorites match "{searchFilter}"
                </p>
                <p className="text-xs text-muted-foreground">
                  Try clearing the search query to view all your saved favorites.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchFilter('')}
                  className="mt-2 text-xs"
                >
                  Clear Search Filter
                </Button>
              </div>
            ) : (
              /* Favorites Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {resolvedPokemonList.map((pokemon, index) => (
                  <PokemonCard
                    key={pokemon.id}
                    pokemon={pokemon}
                    priority={index < 4}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </PageContainer>
    </div>
  );
}
