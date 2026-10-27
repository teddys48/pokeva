import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Pokemon } from '@/types/pokemon';
import { PokeApiSpecies } from '@/types/pokeapi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPokemonId } from '@/lib/utils';
import { getTypeStyle } from '@/styles/typeColors';
import { cn } from '@/lib/utils';
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, ShieldAlert } from 'lucide-react';
import { FavoriteButton } from '@/features/favorites/FavoriteButton';
import { usePokemonImage } from '@/features/pokemon/usePokemonImage';
import { queryClient } from '@/lib/queryClient';
import { pokemonQueries } from '@/services/pokeapi/queries';

export interface PokemonHeroProps {
  pokemon: Pokemon;
  species?: PokeApiSpecies | null;
  className?: string;
}

export function PokemonHero({ pokemon, species: _species, className }: PokemonHeroProps) {
  const {
    currentImgSrc,
    isLoaded,
    imageError,
    imgRef,
    onLoad,
    onError,
  } = usePokemonImage({
    primarySrc: pokemon.artworkUrl,
    fallbackSrc: pokemon.imageUrl,
    identifier: pokemon.id,
  });

  const primaryType = pokemon.types[0] || 'normal';
  const typeStyle = getTypeStyle(primaryType);

  const hasPrevious = pokemon.id > 1;
  const previousId = pokemon.id - 1;
  const nextId = pokemon.id + 1;

  // Prefetch adjacent Pokémon for instantaneous Prev/Next transitions
  const handlePrefetchPrev = useCallback(() => {
    if (hasPrevious) {
      queryClient.prefetchQuery(pokemonQueries.detail(previousId));
      queryClient.prefetchQuery(pokemonQueries.species(previousId));
    }
  }, [hasPrevious, previousId]);

  const handlePrefetchNext = useCallback(() => {
    queryClient.prefetchQuery(pokemonQueries.detail(nextId));
    queryClient.prefetchQuery(pokemonQueries.species(nextId));
  }, [nextId]);

  const d1 = pokemon.types[0] || 'normal';
  const d2 = pokemon.types[1] || '';
  const calculatorUrl = `/type-calculator?pokemon=${encodeURIComponent(pokemon.name)}&defender1=${d1}${
    d2 ? `&defender2=${d2}` : ''
  }`;

  return (
    <div className={cn('relative space-y-4', className)}>
      {/* Top Navigation Bar: Back to Pokédex, Favorite Toggle & Prev/Next Controls */}
      <nav
        aria-label="Pokémon Navigation"
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <Link to="/">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Pokédex</span>
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          {/* Favorite Toggle Affordance */}
          <FavoriteButton
            pokemonId={pokemon.id}
            pokemonName={pokemon.displayName}
            showLabel
            size="sm"
            variant="outline"
          />

          <div className="flex items-center gap-1.5">
            {hasPrevious ? (
              <Link
                to={`/pokemon/${previousId}`}
                onMouseEnter={handlePrefetchPrev}
                onFocus={handlePrefetchPrev}
                aria-label={`Previous Pokémon, #${formatPokemonId(previousId)}`}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline font-mono">{formatPokemonId(previousId)}</span>
                  <span className="sr-only sm:not-sr-only text-[11px]">Prev</span>
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="gap-1 px-2.5 text-xs opacity-40 cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span className="text-[11px]">Prev</span>
              </Button>
            )}

            <Link
              to={`/pokemon/${nextId}`}
              onMouseEnter={handlePrefetchNext}
              onFocus={handlePrefetchNext}
              aria-label={`Next Pokémon, #${formatPokemonId(nextId)}`}
            >
              <Button
                variant="outline"
                size="sm"
                className="gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <span className="text-[11px]">Next</span>
                <span className="hidden sm:inline font-mono">{formatPokemonId(nextId)}</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Card Container */}
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8 md:p-10 transition-all shadow-sm',
          typeStyle.cardSurfaceLight,
          typeStyle.cardSurfaceDark
        )}
      >
        {/* Subtle radial glow matching primary type */}
        <div
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-15 dark:opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: typeStyle.bgHex }}
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          {/* Visual Artwork Column */}
          <div className="md:col-span-5 flex justify-center">
            <div
              className={cn(
                'relative flex aspect-square w-full max-w-[280px] sm:max-w-[320px] items-center justify-center rounded-2xl border border-border/40 p-4 transition-colors',
                'bg-card/70 backdrop-blur-xs'
              )}
            >
              {/* Radial backdrop */}
              <div
                className="absolute inset-0 rounded-2xl opacity-20 dark:opacity-30"
                style={{
                  background: `radial-gradient(circle at center, ${typeStyle.bgHex} 0%, transparent 70%)`,
                }}
                aria-hidden="true"
              />

              {/* Skeleton placeholder while image loads */}
              {!isLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-muted/40 rounded-2xl">
                  <Sparkles className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}

              {!imageError ? (
                <img
                  key={`${pokemon.id}-${currentImgSrc}`}
                  ref={imgRef}
                  src={currentImgSrc}
                  alt={`${pokemon.displayName} official artwork`}
                  width={280}
                  height={280}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onLoad={onLoad}
                  onError={onError}
                  className={cn(
                    'relative z-10 h-60 w-60 sm:h-72 sm:w-72 object-contain drop-shadow-xl transition-all duration-300',
                    isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  )}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 z-10">
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center mb-3 shadow-inner"
                    style={{ backgroundColor: `${typeStyle.bgHex}25` }}
                  >
                    <span
                      className="text-lg font-bold font-mono"
                      style={{ color: typeStyle.bgHex }}
                    >
                      #{pokemon.id}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Artwork unavailable
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info Identity Column */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm sm:text-base font-bold tracking-widest text-muted-foreground">
                {formatPokemonId(pokemon.id)}
              </span>
              <span className="text-border">·</span>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                {domainGenerationLabel(pokemon.generation)}
              </span>
              <span className="text-border">·</span>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground italic">
                {pokemon.genus}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground capitalize leading-tight">
              {pokemon.displayName}
            </h1>

            {/* Elemental Types & Analyze Type Weakness Action */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1" aria-label="Elemental types and weakness analysis">
              <div className="flex flex-wrap gap-2">
                {pokemon.types.map((type) => (
                  <Badge key={type} pokemonType={type} size="md" />
                ))}
              </div>

              <Link
                to={calculatorUrl}
                aria-label={`Analyze ${pokemon.displayName} type weaknesses in Type Calculator`}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs font-semibold gap-1.5 text-primary border-primary/30 hover:bg-primary/10 rounded-full"
                >
                  <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Analyze Type Weakness</span>
                </Button>
              </Link>
            </div>

            {/* Flavor Text Description */}
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-2 max-w-xl">
              {pokemon.description ||
                `${pokemon.displayName} is a ${pokemon.types.join(' and ')}-type Pokémon registered in the official Pokédex.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function domainGenerationLabel(gen: number): string {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][gen - 1] || String(gen);
  return `Generation ${roman}`;
}
