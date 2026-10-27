import { useState, type FormEvent } from 'react';
import { Search, Loader2, Sparkles, X, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PokeApiPokemon } from '@/types/pokeapi';
import { formatPokemonId, cn } from '@/lib/utils';
import { formatPokemonName } from '@/services/pokeapi/utils';
import { PokemonTypeName } from '@/styles/typeColors';

export interface PokemonSelectorProps {
  onSelect: (nameOrId: string) => void;
  selectedPokemon?: PokeApiPokemon | null;
  isLoading?: boolean;
  error?: unknown;
  onClear: () => void;
  className?: string;
}

const QUICK_SUGGESTIONS = [
  'charizard',
  'bulbasaur',
  'gengar',
  'lucario',
  'gyarados',
  'gardevoir',
];

export function PokemonSelector({
  onSelect,
  selectedPokemon,
  isLoading = false,
  error,
  onClear,
  className,
}: PokemonSelectorProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onSelect(trimmed);
    }
  };

  // Artwork resolution
  const artwork =
    selectedPokemon?.sprites?.other?.['official-artwork']?.front_default ||
    selectedPokemon?.sprites?.front_default ||
    '';

  return (
    <div className={cn('space-y-4', className)}>
      {selectedPokemon ? (
        /* Selected Pokémon Target Showcase */
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all animate-fade-in">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card p-2 shadow-2xs">
              {artwork ? (
                <img
                  src={artwork}
                  alt={`${selectedPokemon.name} artwork`}
                  width={80}
                  height={80}
                  className="h-16 w-16 object-contain drop-shadow-sm"
                  loading="eager"
                />
              ) : (
                <Sparkles className="h-8 w-8 text-muted-foreground/40" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="font-mono text-xs font-bold text-muted-foreground">
                  #{formatPokemonId(selectedPokemon.id)}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs font-semibold text-primary">Target Defender</span>
              </div>

              <h4 className="text-lg sm:text-xl font-bold text-foreground capitalize">
                {formatPokemonName(selectedPokemon.name)}
              </h4>

              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start pt-0.5">
                {selectedPokemon.types.map((t) => (
                  <Badge
                    key={t.type.name}
                    pokemonType={t.type.name as PokemonTypeName}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Change target Pokémon"
          >
            <X className="h-3.5 w-3.5" />
            <span>Change Pokémon</span>
          </Button>
        </div>
      ) : (
        /* Search Form */
        <form onSubmit={handleSubmit} className="space-y-3" role="search" aria-label="Search Pokémon target">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                clearable
                onClear={() => setQuery('')}
                placeholder="Search Pokémon by name or #ID (e.g. charizard, 25, gengar)..."
                aria-label="Search Pokémon name or ID"
                disabled={isLoading}
                className="h-11 text-sm bg-card"
                icon={
                  isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <Search className="h-4 w-4 text-muted-foreground" />
                  )
                }
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="h-11 px-5 gap-2 shrink-0 font-semibold"
              aria-label="Select Pokémon"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Looking up...</span>
                </>
              ) : (
                <>
                  <span>Select</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-muted-foreground font-medium mr-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" /> Quick picks:
            </span>
            {QUICK_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSelect(s)}
                className="px-2.5 py-1 text-xs rounded-full bg-secondary/80 hover:bg-secondary text-foreground capitalize font-medium transition-colors border border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {s}
              </button>
            ))}
          </div>

          {Boolean(error) && (
            <p className="text-xs text-destructive font-medium pt-1">
              Pokémon not found. Please double-check the spelling or enter a valid Pokédex number.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
