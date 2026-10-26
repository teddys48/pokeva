import { Pokemon } from '@/types/pokemon';
import { PokemonCard } from './PokemonCard';
import { PokemonEmptyState } from './PokemonEmptyState';
import { PokemonErrorState } from './PokemonErrorState';
import { Skeleton } from '@/components/ui/skeleton';

export interface PokemonGridProps {
  pokemonList: Pokemon[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | unknown;
  onRetry?: () => void;
  searchQuery: string;
  selectedType: string;
  onResetFilters: () => void;
}

export function PokemonGrid({
  pokemonList,
  isLoading = false,
  isError = false,
  error,
  onRetry,
  searchQuery,
  selectedType,
  onResetFilters,
}: PokemonGridProps) {
  // Error state takes precedence
  if (isError) {
    return (
      <PokemonErrorState
        error={error}
        onRetry={onRetry}
        title="Unable to load Pokédex entries"
      />
    );
  }

  // Loading state with accurate card skeletons
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        role="status"
        aria-label="Loading Pokémon entries"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col justify-between h-[340px] rounded-2xl border border-border/80 bg-card p-4 space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>

            <Skeleton className="aspect-square w-full rounded-xl" />

            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-14 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-md" />
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 flex justify-between items-center">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state when search or filter returns no results
  if (pokemonList.length === 0) {
    return (
      <PokemonEmptyState
        searchQuery={searchQuery}
        selectedType={selectedType}
        onReset={onResetFilters}
      />
    );
  }

  // Render populated grid of Pokémon cards
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      role="region"
      aria-label="Pokédex catalogue"
    >
      {pokemonList.map((pokemon, index) => (
        <PokemonCard key={pokemon.id} pokemon={pokemon} priority={index < 8} />
      ))}
    </div>
  );
}
