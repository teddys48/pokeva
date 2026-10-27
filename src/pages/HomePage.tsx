import { PageContainer } from '@/components/layout/PageContainer';
import { PokemonSearchPreview } from '@/features/pokemon/PokemonSearchPreview';
import { PokemonGrid } from '@/features/pokemon/PokemonGrid';
import { PokemonPagination } from '@/features/pokemon/PokemonPagination';
import { usePokedexListing } from '@/features/pokemon/usePokedexListing';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { Sparkles, Layers, ShieldCheck, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function HomePage() {
  useDocumentTitle('Pokéva — Pokémon Explorer & Pokédex');

  const {
    searchQuery,
    onSearchChange,
    selectedType,
    onTypeSelect,
    sortBy,
    onSortChange,
    currentPage,
    onPageChange,
    pageSize,
    pokemonList,
    totalCount,
    totalPages,
    isLoading,
    isSearching,
    isError,
    error,
    onRetry,
    onResetFilters,
  } = usePokedexListing();

  return (
    <div className="py-8 md:py-10 space-y-8">
      <PageContainer>
        {/* Compact, Focused Hero Header */}
        <section
          className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-secondary/30 p-6 sm:p-8 lg:p-10 shadow-xs"
          aria-labelledby="hero-heading"
        >
          {/* Subtle Ambient Glow */}
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-primary/30 text-primary bg-primary/5 text-xs font-semibold gap-1.5 py-0.5 px-2.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Live Pokédex Explorer</span>
              </Badge>
              <span className="text-xs text-muted-foreground hidden sm:inline-block">·</span>
              <span className="text-xs text-muted-foreground hidden sm:inline-block">
                Official PokéAPI v2 Data
              </span>
            </div>

            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight"
            >
              Explore the Pokémon Universe with <span className="text-primary">Pokéva</span>.
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
              A responsive, high-performance Pokédex interface with handcrafted design tokens,
              light and dark themes, and high-contrast elemental badges. Powered by real-time
              data from PokéAPI v2.
            </p>

            {/* Architecture Highlights Pill Row */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-primary" />
                <span>
                  {totalCount > 0 ? `${totalCount.toLocaleString()} Pokémon Indexed` : 'Live API Connected'}
                </span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <span>18 Elemental Types</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>WCAG AA Accessible</span>
              </span>
            </div>
          </div>
        </section>

        {/* Interactive Search, Filter & Pokédex Grid */}
        <section className="mt-8 space-y-6" aria-label="Pokédex catalogue">
          <PokemonSearchPreview
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            selectedType={selectedType}
            onTypeSelect={onTypeSelect}
            sortBy={sortBy}
            onSortChange={onSortChange}
            totalCount={totalCount}
            filteredCount={pokemonList.length}
            isSearching={isSearching}
          />

          <PokemonGrid
            pokemonList={pokemonList}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={onRetry}
            searchQuery={searchQuery}
            selectedType={selectedType}
            onResetFilters={onResetFilters}
          />

          {/* Real Pagination Controls */}
          <PokemonPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={onPageChange}
            isLoading={isLoading}
          />
        </section>
      </PageContainer>
    </div>
  );
}
