import { SearchX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PokemonEmptyStateProps {
  searchQuery: string;
  selectedType: string;
  onReset: () => void;
}

export function PokemonEmptyState({
  searchQuery,
  selectedType,
  onReset,
}: PokemonEmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center animate-fade-in"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
        <SearchX className="h-7 w-7 text-primary" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-bold text-foreground">No Pokémon found</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">
        {searchQuery && selectedType !== 'all' ? (
          <>
            No matching Pokémon found for &ldquo;<span className="font-semibold text-foreground">{searchQuery}</span>&rdquo; with type &ldquo;<span className="capitalize font-semibold text-foreground">{selectedType}</span>&rdquo;.
          </>
        ) : searchQuery ? (
          <>
            No Pokémon matching &ldquo;<span className="font-semibold text-foreground">{searchQuery}</span>&rdquo; in the Phase 1 preview catalogue.
          </>
        ) : (
          <>
            No Pokémon found matching type &ldquo;<span className="capitalize font-semibold text-foreground">{selectedType}</span>&rdquo;.
          </>
        )}
      </p>

      <div className="mt-6">
        <Button variant="outline" size="md" onClick={onReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          <span>Reset Search & Filters</span>
        </Button>
      </div>
    </div>
  );
}
