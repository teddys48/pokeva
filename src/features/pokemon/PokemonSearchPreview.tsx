import { Search, X, Palette, Check, ArrowUpDown, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PokemonTypeName, POKEMON_TYPE_STYLES } from '@/styles/typeColors';
import { cn } from '@/lib/utils';

export type SortOption = 'id-asc' | 'id-desc' | 'name-asc';

export interface PokemonSearchPreviewProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: PokemonTypeName | 'all';
  onTypeSelect: (type: PokemonTypeName | 'all') => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount: number;
  filteredCount: number;
  availableTypes?: PokemonTypeName[];
  isSearching?: boolean;
}

export function PokemonSearchPreview({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeSelect,
  sortBy,
  onSortChange,
  totalCount,
  filteredCount,
  availableTypes,
  isSearching = false,
}: PokemonSearchPreviewProps) {
  const allTypeKeys =
    availableTypes && availableTypes.length > 0
      ? availableTypes
      : (Object.keys(POKEMON_TYPE_STYLES) as PokemonTypeName[]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedType !== 'all' || sortBy !== 'id-asc';

  return (
    <div className="space-y-5">
      {/* Search Bar, Sort & Result Counter Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Prominent Search Input with Debounce & Clear */}
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            clearable
            onClear={() => onSearchChange('')}
            placeholder="Search by Pokémon name, #ID (e.g. 25, pikachu, charizard)..."
            aria-label="Search Pokémon by name or ID"
            icon={
              isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground" />
              )
            }
            className="h-11 text-sm bg-card/90 border-border/80 focus-visible:ring-primary shadow-xs"
          />
        </div>

        {/* Sort Controls & Counter */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5 shrink-0">
          {/* Accessible Sort Select */}
          <div className="relative flex items-center">
            <label htmlFor="pokedex-sort-select" className="sr-only">
              Sort Pokémon listing
            </label>
            <div className="relative flex items-center">
              <ArrowUpDown className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <select
                id="pokedex-sort-select"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                aria-label="Sort Pokémon listing"
                className={cn(
                  'h-11 pl-8 pr-7 rounded-lg border border-border/80 bg-card/90 text-xs font-medium text-foreground shadow-xs cursor-pointer',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 transition-colors'
                )}
              >
                <option value="id-asc">Pokédex # (Lowest first)</option>
                <option value="id-desc">Pokédex # (Highest first)</option>
                <option value="name-asc">Name (A–Z)</option>
              </select>
            </div>
          </div>

          {/* Counter Badge */}
          <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-secondary/80 border border-border/60 text-xs font-mono text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredCount.toLocaleString()}</span>
            <span>of</span>
            <span>{totalCount.toLocaleString()}</span>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onSearchChange('');
                onTypeSelect('all');
                onSortChange('id-asc');
              }}
              className="text-xs text-muted-foreground hover:text-foreground h-11 px-2.5 gap-1"
              aria-label="Reset all search queries and active filters"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Elemental Type Filter Showcase */}
      <Card className="border-border/80 bg-card/90 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Palette className="h-4 w-4" />
              <span>Elemental Filters</span>
            </div>
            {selectedType !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTypeSelect('all')}
                className="h-7 px-2 text-xs text-primary font-medium hover:text-primary/80 gap-1"
              >
                <X className="h-3 w-3" />
                <span>Clear filter ({selectedType})</span>
              </Button>
            )}
          </div>
          <CardTitle className="text-base sm:text-lg flex flex-wrap items-center justify-between gap-2">
            <span>18 Elemental Types</span>
            <span className="text-xs font-normal text-muted-foreground font-mono">
              {selectedType === 'all'
                ? 'All Types Active'
                : `Active: ${selectedType.toUpperCase()}`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Select an elemental type badge below to filter Pokémon by type affinity, or choose All Types.
          </p>

          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter Pokémon by elemental type"
          >
            {/* 'All Types' Pill */}
            <button
              type="button"
              onClick={() => onTypeSelect('all')}
              aria-pressed={selectedType === 'all'}
              className={cn(
                'inline-flex items-center font-semibold uppercase tracking-wider border rounded-md text-xs px-2.5 py-1 gap-1.5 transition-all cursor-pointer select-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                selectedType === 'all'
                  ? 'bg-foreground text-background border-foreground shadow-xs font-bold scale-102 ring-2 ring-primary ring-offset-1'
                  : 'bg-secondary/70 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:scale-102'
              )}
            >
              {selectedType === 'all' && <Check className="w-3 h-3 text-background" />}
              <span>All Types</span>
            </button>

            {/* All 18 Elemental Badges */}
            {allTypeKeys.map((type) => {
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onTypeSelect(isSelected ? 'all' : type)}
                  aria-pressed={isSelected}
                  aria-label={`Filter by ${type} type`}
                  className={cn(
                    'relative rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                    isSelected
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 shadow-sm font-bold'
                      : 'opacity-90 hover:opacity-100 hover:scale-103'
                  )}
                >
                  <Badge pokemonType={type} size="md" className="pointer-events-none" />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
